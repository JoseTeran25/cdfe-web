"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Maximize2, X, Music2, PanelTopClose, PanelTopOpen } from "lucide-react";
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
  /** Si se pasa, el botón "Pantalla completa" delega en el padre (ej. el setlist, que navega entre canciones). */
  onOpenFullscreen?: () => void;
}

export interface FullscreenNavigation {
  index: number;
  total: number;
  nextTitle?: string;
  onPrev: () => void;
  onNext: () => void;
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

const HEADER_HIDDEN_KEY = "cdfe_fullscreen_header_hidden";

export function FullscreenViewer({
  lyrics,
  originalKey,
  semitones,
  onSemitonesChange,
  title,
  artist,
  onClose,
  navigation,
}: Omit<Props, "onOpenFullscreen"> & { onClose: () => void; navigation?: FullscreenNavigation }) {
  const lines = useMemo(() => buildLines(lyrics, semitones), [lyrics, semitones]);
  const currentKey = semitones !== 0 ? transposeChord(originalKey, semitones) : originalKey;
  const isFirst = navigation ? navigation.index === 0 : true;
  const isLast = navigation ? navigation.index === navigation.total - 1 : true;

  // Se recuerda entre canciones y entre sesiones (solo se monta en cliente, tras un clic)
  const [headerHidden, setHeaderHidden] = useState(() => {
    try {
      return localStorage.getItem(HEADER_HIDDEN_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleHeader = (hidden: boolean) => {
    setHeaderHidden(hidden);
    try {
      localStorage.setItem(HEADER_HIDDEN_KEY, hidden ? "1" : "0");
    } catch {
      // sin almacenamiento disponible: solo dura esta sesión
    }
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    // Flechas y Re Pág/Av Pág: también los envían los pedales Bluetooth pasa-páginas
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!navigation) return;
      if ((e.key === "ArrowRight" || e.key === "PageDown") && !isLast) {
        e.preventDefault();
        navigation.onNext();
      }
      if ((e.key === "ArrowLeft" || e.key === "PageUp") && !isFirst) {
        e.preventDefault();
        navigation.onPrev();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, navigation, isFirst, isLast]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-navy-gradient">
      {/* Header oculto: solo una pastilla flotante con canción y tono que lo vuelve a mostrar */}
      {headerHidden && (
        <button
          onClick={() => toggleHeader(false)}
          className="absolute top-3 right-3 z-10 flex items-center gap-2 h-10 pl-3 pr-3.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/85 text-sm shadow-lg transition-colors hover:bg-white/15 active:scale-95"
          aria-label="Mostrar encabezado"
        >
          <PanelTopOpen className="w-4 h-4 shrink-0" />
          {title && <span className="max-w-[45vw] truncate font-medium">{title}</span>}
          <span className="font-display font-bold text-gold">{currentKey}</span>
        </button>
      )}

      {/* Header — en celular el tono baja a una segunda línea para que el título se lea completo */}
      {!headerHidden && (
      <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 shrink-0 space-y-3 sm:space-y-0">
       <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {title && <h2 className="font-display font-bold text-xl sm:text-2xl text-white truncate">{title}</h2>}
          {artist && <p className="text-white/50 text-sm truncate">{artist}</p>}
        </div>
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="hidden sm:block">
            <TransposeControls
              currentKey={currentKey}
              originalKey={originalKey}
              semitones={semitones}
              onSemitonesChange={onSemitonesChange}
              size="lg"
            />
          </div>
          <button
            onClick={() => toggleHeader(true)}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Ocultar encabezado"
            title="Ocultar encabezado"
          >
            <PanelTopClose className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar pantalla completa"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
       </div>
        <div className="sm:hidden">
          <TransposeControls
            currentKey={currentKey}
            originalKey={originalKey}
            semitones={semitones}
            onSemitonesChange={onSemitonesChange}
            size="lg"
          />
        </div>
      </div>
      )}

      {/* Lyrics + chords — vertical scroll only; `key` vuelve arriba al cambiar de canción */}
      <div
        key={title}
        className={cn("flex-1 overflow-y-auto px-5 sm:px-10 pb-8 sm:pb-10", headerHidden ? "pt-16" : "pt-8 sm:pt-10")}
      >
        <div className="max-w-4xl mx-auto">
          {lyrics.trim() ? (
            <LyricsLines lines={lines} big />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <Music2 className="w-10 h-10 text-white/20" />
              <p className="text-white/50">Esta canción no tiene letra registrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegación entre canciones — botones grandes para el dedo en celular/atril */}
      {navigation && navigation.total > 1 && (
        <div className="shrink-0 border-t border-white/10 bg-navy-950/40 backdrop-blur-sm px-3 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={navigation.onPrev}
              disabled={isFirst}
              className="flex items-center justify-center gap-1.5 h-14 min-w-14 px-3 sm:px-5 rounded-2xl bg-white/10 text-white font-semibold transition-all hover:bg-white/15 active:scale-95 disabled:opacity-25 disabled:active:scale-100"
              aria-label="Canción anterior"
            >
              <ChevronLeft className="w-7 h-7" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-white/50 text-xs tabular-nums">
                Canción {navigation.index + 1} de {navigation.total}
              </p>
              <p className="text-white text-sm font-medium truncate">
                {isLast ? "Última canción" : `Sigue: ${navigation.nextTitle}`}
              </p>
            </div>

            <button
              onClick={navigation.onNext}
              disabled={isLast}
              className="flex items-center justify-center gap-1.5 h-14 min-w-14 px-3 sm:px-6 rounded-2xl bg-gold text-navy-950 font-semibold shadow-lg transition-all hover:brightness-105 active:scale-95 disabled:bg-white/10 disabled:text-white disabled:opacity-25 disabled:shadow-none disabled:active:scale-100"
              aria-label="Siguiente canción"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

export function ChordViewer({ lyrics, originalKey, semitones, onSemitonesChange, title, artist, onOpenFullscreen }: Props) {
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
          onClick={() => (onOpenFullscreen ? onOpenFullscreen() : setFullscreen(true))}
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
