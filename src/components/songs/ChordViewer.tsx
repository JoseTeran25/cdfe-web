"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, RotateCcw, Maximize2, X } from "lucide-react";
import { buildLines, transposeChord, type ParsedLine } from "@/lib/chordpro";
import { cn } from "@/lib/utils";

// ── Props ──────────────────────────────────────────────────────
interface Props {
  lyrics: string;
  originalKey: string;
  semitones: number;
  onSemitonesChange: (s: number) => void;
  title?: string;
  artist?: string;
}

function TransposeControls({
  currentKey,
  originalKey,
  semitones,
  onSemitonesChange,
  size = "sm",
}: {
  currentKey: string;
  originalKey: string;
  semitones: number;
  onSemitonesChange: (s: number) => void;
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={cn("font-semibold uppercase tracking-widest", lg ? "text-sm text-white/50" : "text-xs text-gray-500")}>
        Tono
      </span>
      <div className={cn("flex items-center gap-1 rounded-xl p-0.5", lg ? "bg-white/10 border border-white/15" : "bg-surface border border-surface-border")}>
        <button
          onClick={() => onSemitonesChange(semitones - 1)}
          className={cn("rounded-lg transition-all", lg ? "p-2 text-white/70 hover:text-white hover:bg-white/10" : "p-1.5 text-gray-500 hover:text-navy hover:bg-white hover:shadow-card")}
          aria-label="Bajar semitono"
        >
          <ChevronDown className={lg ? "w-5 h-5" : "w-4 h-4"} />
        </button>
        <span className={cn("text-center font-display font-bold px-2", lg ? "min-w-[4rem] text-2xl text-white" : "min-w-[3rem] text-sm text-navy")}>
          {currentKey}
        </span>
        <button
          onClick={() => onSemitonesChange(semitones + 1)}
          className={cn("rounded-lg transition-all", lg ? "p-2 text-white/70 hover:text-white hover:bg-white/10" : "p-1.5 text-gray-500 hover:text-navy hover:bg-white hover:shadow-card")}
          aria-label="Subir semitono"
        >
          <ChevronUp className={lg ? "w-5 h-5" : "w-4 h-4"} />
        </button>
      </div>
      {semitones !== 0 && (
        <button
          onClick={() => onSemitonesChange(0)}
          className={cn("flex items-center gap-1 transition-colors", lg ? "text-sm text-white/50 hover:text-white" : "text-xs text-gray-400 hover:text-navy")}
        >
          <RotateCcw className="w-3 h-3" />
          Restablecer ({originalKey})
        </button>
      )}
    </div>
  );
}

function LyricsLines({ lines, big }: { lines: ParsedLine[]; big?: boolean }) {
  const chordColor = big ? "text-gold" : "text-navy";
  const lyricColor = big ? "text-white" : "text-gray-800";

  return (
    <div className={cn("font-mono", big ? "text-lg sm:text-xl" : "text-sm")}>
      {lines.map((line, i) => {
        switch (line.type) {
          case "section":
            return (
              <p
                key={i}
                className={cn(
                  "font-display font-bold uppercase tracking-widest mt-8 first:mt-0 mb-3 select-none",
                  big ? "text-gold text-sm sm:text-base" : "text-navy/50 text-[11px] mt-7 mb-2"
                )}
              >
                {line.label}
              </p>
            );

          case "empty":
            return <div key={i} className={big ? "h-8" : "h-4"} />;

          case "pair":
            return (
              <div key={i} className="overflow-x-auto mb-1">
                <div className={cn("font-bold leading-tight whitespace-pre", chordColor)}>{line.chordLine}</div>
                <div className={cn("leading-relaxed whitespace-pre", lyricColor)}>{line.lyricLine}</div>
              </div>
            );

          case "chordline":
            return (
              <div key={i} className={cn("overflow-x-auto font-bold leading-tight whitespace-pre mb-1", chordColor)}>
                {line.text}
              </div>
            );

          case "plain":
            return (
              <div key={i} className={cn("leading-relaxed whitespace-pre-wrap break-words mb-1", lyricColor)}>
                {line.text}
              </div>
            );

          case "inline":
            return (
              <div key={i} className="flex flex-wrap mb-1 leading-none">
                {line.segments.map((seg, j) => (
                  <span key={j} className="inline-flex flex-col">
                    <span className={cn("font-bold leading-tight pr-1 whitespace-pre", big ? "text-base sm:text-lg" : "text-[11px]", seg.chord ? chordColor : "")}>
                      {seg.chord ?? " "}
                    </span>
                    <span className={cn("leading-relaxed whitespace-pre pr-0.5", lyricColor)}>
                      {seg.lyric || " "}
                    </span>
                  </span>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

function FullscreenViewer({
  lyrics,
  originalKey,
  semitones,
  onSemitonesChange,
  title,
  artist,
  onClose,
}: Props & { onClose: () => void }) {
  const lines = useMemo(() => buildLines(lyrics, semitones), [lyrics, semitones]);
  const currentKey = semitones !== 0 ? transposeChord(originalKey, semitones) : originalKey;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-navy-gradient">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 shrink-0">
        <div className="min-w-0">
          {title && <h2 className="font-display font-bold text-xl sm:text-2xl text-white truncate">{title}</h2>}
          {artist && <p className="text-white/50 text-sm truncate">{artist}</p>}
        </div>
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <TransposeControls
            currentKey={currentKey}
            originalKey={originalKey}
            semitones={semitones}
            onSemitonesChange={onSemitonesChange}
            size="lg"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar pantalla completa"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Lyrics + chords — vertical scroll only, no horizontal overflow */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-10 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <LyricsLines lines={lines} big />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ChordViewer({ lyrics, originalKey, semitones, onSemitonesChange, title, artist }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const lines = useMemo(() => buildLines(lyrics, semitones), [lyrics, semitones]);
  const currentKey = semitones !== 0 ? transposeChord(originalKey, semitones) : originalKey;

  return (
    <div className="space-y-5">
      {/* Transpose bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TransposeControls
          currentKey={currentKey}
          originalKey={originalKey}
          semitones={semitones}
          onSemitonesChange={onSemitonesChange}
        />
        <button
          onClick={() => setFullscreen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy px-3 py-1.5 rounded-xl border border-surface-border hover:border-navy/30 hover:bg-navy/5 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Pantalla completa
        </button>
      </div>

      {/* Lyrics + chords — no boxed container, just breathing room */}
      <div className="py-1">
        <LyricsLines lines={lines} />
      </div>

      {fullscreen && (
        <FullscreenViewer
          lyrics={lyrics}
          originalKey={originalKey}
          semitones={semitones}
          onSemitonesChange={onSemitonesChange}
          title={title}
          artist={artist}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  );
}
