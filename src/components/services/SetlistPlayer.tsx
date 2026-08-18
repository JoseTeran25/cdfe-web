"use client";

import { useEffect, useState } from "react";
import {
  Music2, ChevronLeft, ChevronRight, Volume2, BookOpen, Hash, Activity, Video,
} from "lucide-react";
import { cn, getYoutubeVideoId } from "@/lib/utils";
import { ChordViewer } from "@/components/songs/ChordViewer";
import { MultitrackPlayer } from "@/components/songs/MultitrackPlayer";
import { YoutubeEmbed } from "@/components/songs/YoutubeEmbed";
import { Badge } from "@/components/ui/Badge";
import type { Song } from "@/types";

interface Props {
  songs: Song[];
}

export function SetlistPlayer({ songs }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  // Per-song transposition state — preserved when switching tabs
  const [semitones, setSemitones] = useState<number[]>(() => songs.map(() => 0));
  const [mediaTab, setMediaTab] = useState<"tracks" | "video">("tracks");

  const currentSong = songs[activeIdx];
  const currentHasTracks = !!(currentSong?.sequenceUrl && currentSong.sequenceUrl.length > 0);

  // Al cambiar de canción, mostrar pistas si tiene, si no el video (si tiene)
  useEffect(() => {
    setMediaTab(currentHasTracks ? "tracks" : "video");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const prev = () => setActiveIdx(i => Math.max(0, i - 1));
  const next = () => setActiveIdx(i => Math.min(songs.length - 1, i + 1));

  // ── Empty state ────────────────────────────────────────────
  if (songs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border shadow-card">
        <div className="h-1 bg-navy-gradient w-full rounded-t-2xl" />
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-navy/20" />
          </div>
          <p className="font-medium text-gray-400 text-sm">
            No hay canciones en el setlist aún
          </p>
          <p className="text-xs text-gray-300">
            Agrega canciones en el panel de gestión de abajo
          </p>
        </div>
      </div>
    );
  }

  const song = currentSong;
  const hasTracks = currentHasTracks;
  const hasLyrics = !!song.lyrics;
  const youtubeId = song.referenceUrl ? getYoutubeVideoId(song.referenceUrl) : null;
  const hasVideo = !!youtubeId;

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
      {/* Accent stripe */}
      <div className="h-1 bg-navy-gradient w-full" />

      {/* Section label */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold" />
          <span className="font-display font-semibold text-navy text-sm">
            Modo Ensayo
          </span>
          <span className="text-gray-300 text-xs">
            · {songs.length} canción{songs.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            disabled={activeIdx === 0}
            className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Canción anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 tabular-nums w-10 text-center">
            {activeIdx + 1} / {songs.length}
          </span>
          <button
            onClick={next}
            disabled={activeIdx === songs.length - 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Siguiente canción"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div className="overflow-x-auto border-b border-surface-border">
        <div className="flex min-w-max">
          {songs.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all",
                i === activeIdx
                  ? "border-navy text-navy bg-navy/[3%] font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              {/* Number pill */}
              <span
                className={cn(
                  "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors",
                  i === activeIdx
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {i + 1}
              </span>
              <span className="max-w-[140px] truncate">{s.title}</span>
              {/* Tracks indicator */}
              {s.sequenceUrl && s.sequenceUrl.length > 0 && (
                <Volume2 className="w-3 h-3 text-gold shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/*
        key forces full remount when switching songs.
        This resets the MultitrackPlayer audio context cleanly.
      */}
      <div key={`${song.id}-${activeIdx}`} className="divide-y divide-surface-border">

        {/* ── Song header ─────────────────────────────────────── */}
        <div className="px-5 sm:px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-xl text-navy leading-tight">
              {song.title}
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">{song.artist}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="navy" size="sm">
                <Hash className="w-2.5 h-2.5" />
                {song.key}
              </Badge>
              {song.bpm && (
                <Badge variant="navy" size="sm">
                  <Activity className="w-2.5 h-2.5" />
                  {song.bpm} BPM
                </Badge>
              )}
              {hasTracks && (
                <Badge variant="gold" size="sm">
                  <Volume2 className="w-2.5 h-2.5" />
                  {song.sequenceUrl!.length} pista{song.sequenceUrl!.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ── Pistas o video: uno u otro, no ambos, para no ocupar mucho espacio ── */}
        {(hasTracks || hasVideo) && (
          <div className="px-5 sm:px-6 py-5">
            {hasTracks && hasVideo && (
              <div className="flex items-center gap-1 mb-4 bg-surface border border-surface-border rounded-xl p-1 w-fit">
                <button
                  onClick={() => setMediaTab("tracks")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    mediaTab === "tracks" ? "bg-white text-navy shadow-card" : "text-gray-400 hover:text-navy"
                  )}
                >
                  <Volume2 className="w-3.5 h-3.5" /> Pistas
                </button>
                <button
                  onClick={() => setMediaTab("video")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    mediaTab === "video" ? "bg-white text-navy shadow-card" : "text-gray-400 hover:text-navy"
                  )}
                >
                  <Video className="w-3.5 h-3.5" /> Video
                </button>
              </div>
            )}

            {mediaTab === "tracks" && hasTracks && <MultitrackPlayer tracks={song.sequenceUrl!} />}
            {mediaTab === "video" && hasVideo && (
              <YoutubeEmbed videoId={youtubeId!} title={`${song.title} — video de referencia`} />
            )}
          </div>
        )}

        {/* ── Chord viewer ─────────────────────────────────────── */}
        <div className="px-5 sm:px-6 py-5">
          {hasLyrics ? (
            <ChordViewer
              lyrics={song.lyrics!}
              originalKey={song.key}
              semitones={semitones[activeIdx]}
              onSemitonesChange={val =>
                setSemitones(prev => prev.map((s, j) => (j === activeIdx ? val : s)))
              }
              title={song.title}
              artist={song.artist}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <Music2 className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">Esta canción no tiene letra registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
