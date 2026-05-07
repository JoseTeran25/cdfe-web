"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Music2, Plus, Trash2, Upload, Loader2, Save,
} from "lucide-react";
import { songsApi, filesApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast, type ToastData } from "@/components/ui/Toast";
import type { SongStatus, CreateSongDto, TrackItem } from "@/types";

// ── Options ────────────────────────────────────────────────
const KEY_OPTIONS = [
  "C","C#","D","D#","E","F","F#","G","G#","A","A#","B",
  "Cm","C#m","Dm","D#m","Em","Fm","F#m","Gm","G#m","Am","A#m","Bm",
].map(k => ({ value: k, label: k }));

const STATUS_OPTIONS = [
  { value: "ACTIVA",    label: "Activa" },
  { value: "PENDIENTE", label: "Pendiente" },
];

const TRACK_TYPE_OPTIONS = [
  { value: "click",  label: "Click / Metrónomo" },
  { value: "guide",  label: "Guía" },
  { value: "full",   label: "Mezcla completa" },
  { value: "stems",  label: "Stems" },
];

const BLANK: CreateSongDto = {
  title: "", artist: "", key: "G", status: "PENDIENTE",
  bpm: undefined, lyrics: "", sequenceUrl: [],
};

export default function NewSongPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateSongDto>(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<boolean[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = <K extends keyof CreateSongDto>(k: K, v: CreateSongDto[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const tracks = form.sequenceUrl ?? [];

  // ── Track helpers ──────────────────────────────────────────
  const addTrack = () => {
    set("sequenceUrl", [...tracks, { name: "", url: "", type: "guide" }]);
    setUploading(prev => [...prev, false]);
  };

  const updateTrack = (i: number, patch: Partial<TrackItem>) =>
    set("sequenceUrl", tracks.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const removeTrack = (i: number) => {
    set("sequenceUrl", tracks.filter((_, j) => j !== i));
    setUploading(prev => prev.filter((_, j) => j !== i));
  };

  const handleFileUpload = async (i: number, file: File | undefined) => {
    if (!file) return;
    setUploading(prev => prev.map((v, j) => (j === i ? true : v)));
    try {
      const { url } = await filesApi.uploadAudio(file);
      const autoName = tracks[i]?.name || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      updateTrack(i, { url, name: tracks[i]?.name || autoName });
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error al subir" });
    } finally {
      setUploading(prev => prev.map((v, j) => (j === i ? false : v)));
      if (fileInputRefs.current[i]) fileInputRefs.current[i]!.value = "";
    }
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim() || !form.artist.trim() || !form.key) {
      setToast({ type: "error", message: "Título, artista y tono son obligatorios" });
      return;
    }
    setSaving(true);
    try {
      const created = await songsApi.create(form);
      router.push(`/songs/${created.id}`);
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error al crear" });
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Canciones
      </button>

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-navy/5 flex items-center justify-center">
            <Music2 className="w-5 h-5 text-navy/40" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-navy">Nueva Canción</h1>
            <p className="text-gray-400 text-sm">Completa los datos del repertorio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Crear canción
          </Button>
        </div>
      </div>

      {/* ── Sección: Datos básicos ───────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6 space-y-4">
        <h2 className="font-display font-semibold text-navy text-sm uppercase tracking-widest opacity-60">
          Datos básicos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Título" required placeholder="Majestad"
            value={form.title} onChange={e => set("title", e.target.value)}
          />
          <Input
            label="Artista" required placeholder="Marcos Barrientos"
            value={form.artist} onChange={e => set("artist", e.target.value)}
          />
          <Select
            label="Tono" required value={form.key}
            onChange={e => set("key", e.target.value)} options={KEY_OPTIONS}
          />
          <Input
            label="BPM" type="number" placeholder="72" hint="Opcional"
            value={form.bpm ?? ""}
            onChange={e => set("bpm", e.target.value ? Number(e.target.value) : undefined)}
          />
          <Select
            label="Estado" required value={form.status ?? "PENDIENTE"}
            onChange={e => set("status", e.target.value as SongStatus)}
            options={STATUS_OPTIONS}
          />
        </div>
      </section>

      {/* ── Sección: Letra / Acordes ─────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-display font-semibold text-navy text-sm uppercase tracking-widest opacity-60">
            Letra y Acordes
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Formato ChordPro: escribe los acordes entre corchetes antes de la sílaba.
            Ej: <span className="font-mono text-navy/70">[G]Santo, [D]Santo [Em]es el [C]Señor</span>
          </p>
        </div>
        <Textarea
          label=""
          placeholder={"# Verso 1\n[G]Santo, [D]Santo [Em]es el [C]Señor\n\n# Coro\n[Am]Tu gloria [G]llena..."}
          value={form.lyrics ?? ""}
          onChange={e => set("lyrics", e.target.value)}
          rows={10}
        />
      </section>

      {/* ── Sección: Pistas Multitrack ───────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-navy text-sm uppercase tracking-widest opacity-60">
              Pistas Multitrack
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sube archivos MP3/WAV o pega una URL directa. Puedes agregar más tarde.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={addTrack}>
            <Plus className="w-3.5 h-3.5" /> Agregar pista
          </Button>
        </div>

        {tracks.length === 0 ? (
          <button
            type="button"
            onClick={addTrack}
            className="w-full border-2 border-dashed border-surface-border rounded-xl px-4 py-8 text-center hover:border-navy/30 hover:bg-navy/[2%] transition-colors"
          >
            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Sin pistas configuradas</p>
            <p className="text-xs text-gray-300 mt-1">Haz clic para agregar la primera pista</p>
          </button>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-border bg-surface p-3.5 space-y-2.5"
              >
                {/* Row 1: nombre + tipo + eliminar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de la pista (ej: Click, Guitarras…)"
                    value={track.name}
                    onChange={e => updateTrack(i, { name: e.target.value })}
                    className="flex-1 min-w-0 text-sm px-3 py-2 border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40"
                  />
                  <select
                    value={track.type}
                    onChange={e => updateTrack(i, { type: e.target.value as TrackItem["type"] })}
                    className="text-xs px-2 py-2 border border-surface-border rounded-lg bg-white focus:outline-none shrink-0"
                  >
                    {TRACK_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeTrack(i)}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Row 2: URL + subir */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="URL del audio (se completa al subir el archivo)"
                    value={track.url}
                    onChange={e => updateTrack(i, { url: e.target.value })}
                    className="flex-1 min-w-0 text-xs px-3 py-2 border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40 text-gray-500"
                  />
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.aac,.flac"
                    className="sr-only"
                    ref={el => { fileInputRefs.current[i] = el; }}
                    onChange={e => handleFileUpload(i, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploading[i]}
                    onClick={() => fileInputRefs.current[i]?.click()}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-navy text-white hover:bg-navy-800 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {uploading[i]
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Subiendo…</>
                      : <><Upload className="w-3 h-3" /> Subir archivo</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom actions — repeated for long forms */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Crear canción
        </Button>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
