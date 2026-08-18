"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Music2, Pencil, Activity,
  Clock, Hash, Tag, Volume2, Plus, ExternalLink, StickyNote, Link2,
} from "lucide-react";
import { useSong } from "@/hooks/useSong";
import { useSongs } from "@/hooks/useSongs";
import { ChordViewer } from "@/components/songs/ChordViewer";
import { MultitrackPlayer } from "@/components/songs/MultitrackPlayer";
import { YoutubeEmbed } from "@/components/songs/YoutubeEmbed";
import { SongModal } from "@/components/songs/SongModal";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getYoutubeVideoId } from "@/lib/utils";
import type { CreateSongDto } from "@/types";

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { song, loading, error } = useSong(id);
  const { update } = useSongs();

  const [semitones, setSemitones] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleSave = async (data: CreateSongDto) => {
    try {
      await update(id, data);
      setEditOpen(false);
      setToast({ type: "success", message: "Canción actualizada" });
      // Reload to reflect changes — simple full reload
      window.location.reload();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setToast({ type: "error", message: msg });
      throw e;
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Error / not found ────────────────────────────────────────
  if (error || !song) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center">
        <Music2 className="w-7 h-7 text-navy/30" />
      </div>
      <p className="font-medium text-gray-500">{error ?? "Canción no encontrada"}</p>
      <Button variant="secondary" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Volver
      </Button>
    </div>
  );

  const youtubeId = song.referenceUrl ? getYoutubeVideoId(song.referenceUrl) : null;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Canciones
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <div className="h-1.5 bg-navy-gradient w-full" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  variant={song.status === "ACTIVA" ? "success" : "pending"}
                  dot
                  size="sm"
                >
                  {song.status === "ACTIVA" ? "Activa" : "Pendiente"}
                </Badge>
                {song.tags?.map(tag => (
                  <Badge key={tag} variant="navy" size="sm">
                    <Tag className="w-2.5 h-2.5 mr-0.5" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy leading-tight">
                {song.title}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{song.artist}</p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-xl text-xs font-semibold text-navy">
                  <Hash className="w-3.5 h-3.5" />
                  {song.key}
                </div>
                {song.bpm && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-xl text-xs font-semibold text-navy">
                    <Activity className="w-3.5 h-3.5" />
                    {song.bpm} BPM
                  </div>
                )}
                {song.sequenceUrl && song.sequenceUrl.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 rounded-xl text-xs font-semibold text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    {song.sequenceUrl.length} pista{song.sequenceUrl.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {song.notes && (
        <div className="bg-gold/[6%] rounded-2xl border border-gold/20 p-5 sm:p-6">
          <h2 className="font-display font-semibold text-navy text-base mb-2 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-gold" />
            Notas
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{song.notes}</p>
        </div>
      )}

      {/* Referencia: YouTube embebido o link externo (Drive, etc.) */}
      {song.referenceUrl && (
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gold" />
              Referencia
            </h2>
            <a
              href={song.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-navy transition-colors"
            >
              Abrir enlace <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {youtubeId ? (
            <YoutubeEmbed videoId={youtubeId} title={`${song.title} — video de referencia`} />
          ) : (
            <a
              href={song.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-navy/5 hover:bg-navy/10 transition-colors text-navy text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="truncate">{song.referenceUrl}</span>
            </a>
          )}
        </div>
      )}

      {/* Multitrack player */}
      {song.sequenceUrl && song.sequenceUrl.length > 0 ? (
        <MultitrackPlayer tracks={song.sequenceUrl} />
      ) : (
        <div className="bg-navy/[3%] rounded-2xl border border-dashed border-navy/15 p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-navy/20" />
          </div>
          <div>
            <p className="font-medium text-gray-500 text-sm">Sin pistas multitrack</p>
            <p className="text-gray-400 text-xs mt-0.5">Agrega URLs de audio para habilitar el reproductor DAW</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Agregar pistas
          </Button>
        </div>
      )}

      {/* Chord viewer */}
      {song.lyrics ? (
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-5 sm:p-6">
          <h2 className="font-display font-semibold text-navy text-base mb-4 flex items-center gap-2">
            <Music2 className="w-4 h-4 text-gold" />
            Letra y Acordes
          </h2>
          <ChordViewer
            lyrics={song.lyrics}
            originalKey={song.key}
            semitones={semitones}
            onSemitonesChange={setSemitones}
            title={song.title}
            artist={song.artist}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-navy/20" />
          </div>
          <p className="text-gray-400 text-sm">Esta canción no tiene letra registrada.</p>
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5" /> Agregar letra
          </Button>
        </div>
      )}

      {editOpen && (
        <SongModal
          open={editOpen}
          song={song}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
