"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import type { Song, SongStatus, CreateSongDto, TrackItem } from "@/types";
import { filesApi } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const KEY_OPTIONS = [
  "C","C#","D","D#","E","F","F#","G","G#","A","A#","B",
  "Cm","C#m","Dm","D#m","Em","Fm","F#m","Gm","G#m","Am","A#m","Bm",
].map(k => ({ value: k, label: k }));

const STATUS_OPTIONS = [
  { value: "ACTIVA", label: "Activa" },
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

interface Props {
  open: boolean;
  song: Song | null;
  onClose: () => void;
  onSave: (data: CreateSongDto, id?: string) => Promise<void>;
}

export function SongModal({ open, song, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreateSongDto>(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<boolean[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setForm(song
      ? {
          title: song.title,
          artist: song.artist,
          key: song.key,
          bpm: song.bpm,
          status: song.status,
          lyrics: song.lyrics ?? "",
          sequenceUrl: song.sequenceUrl ? [...song.sequenceUrl] : [],
        }
      : BLANK
    );
    setUploading([]);
    setUploadError(null);
  }, [song, open]);

  const set = <K extends keyof CreateSongDto>(k: K, v: CreateSongDto[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  // ── Track helpers ──────────────────────────────────────────
  const tracks = form.sequenceUrl ?? [];

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
    setUploadError(null);
    setUploading(prev => prev.map((v, j) => (j === i ? true : v)));
    try {
      const { url } = await filesApi.uploadAudio(file);
      const autoName = tracks[i]?.name || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      updateTrack(i, { url, name: tracks[i]?.name || autoName });
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Error al subir el archivo");
    } finally {
      setUploading(prev => prev.map((v, j) => (j === i ? false : v)));
      // Reset file input so same file can be re-uploaded
      if (fileInputRefs.current[i]) fileInputRefs.current[i]!.value = "";
    }
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title || !form.artist || !form.key) return;
    setSaving(true);
    try {
      await onSave(form, song?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={song ? "Editar Canción" : "Nueva Canción"}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {song ? "Guardar cambios" : "Crear canción"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* ── Datos básicos ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Título" required placeholder="Majestad" value={form.title}
            onChange={e => set("title", e.target.value)} />
          <Input label="Artista" required placeholder="Marcos Barrientos" value={form.artist}
            onChange={e => set("artist", e.target.value)} />
          <Select label="Tono" required value={form.key}
            onChange={e => set("key", e.target.value)} options={KEY_OPTIONS} />
          <Input label="BPM" type="number" placeholder="72" value={form.bpm ?? ""}
            onChange={e => set("bpm", e.target.value ? Number(e.target.value) : undefined)}
            hint="Opcional" />
          <Select label="Estado" required value={form.status ?? "PENDIENTE"}
            onChange={e => set("status", e.target.value as SongStatus)}
            options={STATUS_OPTIONS} />
        </div>

        {/* ── Letra / ChordPro ──────────────────────────────── */}
        <Textarea
          label="Letra / ChordPro"
          placeholder={"# Verso 1\n[G]Santo, [D]Santo..."}
          value={form.lyrics ?? ""}
          onChange={e => set("lyrics", e.target.value)}
          rows={6}
          hint="Formato ChordPro: [Am]Letra del [G]coro"
        />

        {/* ── Pistas Multitrack ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Pistas Multitrack</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sube archivos MP3/WAV o pega una URL directa
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={addTrack}>
              <Plus className="w-3.5 h-3.5" /> Agregar pista
            </Button>
          </div>

          {uploadError && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {uploadError}
            </div>
          )}

          {tracks.length === 0 ? (
            <button
              type="button"
              onClick={addTrack}
              className="w-full border-2 border-dashed border-surface-border rounded-xl px-4 py-6 text-center hover:border-navy/30 hover:bg-navy/[2%] transition-colors"
            >
              <p className="text-sm text-gray-400">Sin pistas configuradas</p>
              <p className="text-xs text-gray-300 mt-1">Haz clic para agregar la primera pista</p>
            </button>
          ) : (
            <div className="space-y-2.5">
              {tracks.map((track, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-surface-border bg-surface p-3 space-y-2"
                >
                  {/* Row 1: nombre + tipo + eliminar */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre (ej: Click, Guitarras…)"
                      value={track.name}
                      onChange={e => updateTrack(i, { name: e.target.value })}
                      className="flex-1 min-w-0 text-sm px-2.5 py-1.5 border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40"
                    />
                    <select
                      value={track.type}
                      onChange={e => updateTrack(i, { type: e.target.value as TrackItem["type"] })}
                      className="text-xs px-2 py-1.5 border border-surface-border rounded-lg bg-white focus:outline-none shrink-0"
                    >
                      {TRACK_TYPE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeTrack(i)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Eliminar pista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 2: URL + botón subir */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="URL del audio (se rellena al subir)"
                      value={track.url}
                      onChange={e => updateTrack(i, { url: e.target.value })}
                      className="flex-1 min-w-0 text-xs px-2.5 py-1.5 border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40 text-gray-500"
                    />

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg,.aac,.flac"
                      className="sr-only"
                      ref={el => { fileInputRefs.current[i] = el; }}
                      onChange={e => handleFileUpload(i, e.target.files?.[0])}
                    />

                    {/* Upload trigger button */}
                    <button
                      type="button"
                      disabled={uploading[i]}
                      onClick={() => fileInputRefs.current[i]?.click()}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy-800 disabled:opacity-50 transition-colors shrink-0"
                      title="Subir archivo de audio"
                    >
                      {uploading[i]
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Subiendo…</>
                        : <><Upload className="w-3 h-3" /> Subir</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
