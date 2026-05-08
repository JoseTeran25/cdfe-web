"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, Pause, Square, Volume2, ChevronDown, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMultitrack, type TrackState } from "@/hooks/useMultitrack";
import type { TrackItem } from "@/types";

// ── VU Meter (horizontal, green → yellow → red) ───────────────
function VuMeter({ analyser }: { analyser: AnalyserNode | null }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const rafRef  = useRef(0);

  useEffect(() => {
    const fill = fillRef.current;
    if (!analyser || !fill) {
      if (fill) fill.style.width = "0%";
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      fill.style.width = `${Math.min((avg / 255) * 220, 100)}%`;
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return (
    <div className="relative h-2 w-full bg-white/8 rounded-full overflow-hidden">
      <div
        ref={fillRef}
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: "0%",
          background: "linear-gradient(to right, #10b981 0%, #facc15 70%, #ef4444 100%)",
        }}
      />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props { tracks: TrackItem[] }

export function MultitrackPlayer({ tracks: trackItems }: Props) {
  const {
    tracks, analysers, isPlaying, isLoading, currentTime, duration, audioUnlocked,
    load, play, pause, stop, seek, setVolume, toggleMute, toggleSolo, unlock,
  } = useMultitrack();

  const [open, setOpen] = useState(true);

  const loaded   = tracks.length > 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Detect iOS once (SSR-safe)
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // On iOS, call unlock() synchronously BEFORE the async load —
  // this is the only moment iOS accepts AudioContext.resume() as a user gesture.
  const handleLoad = useCallback(() => {
    if (isIOS) unlock();
    load(trackItems);
  }, [isIOS, unlock, load, trackItems]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => seek(Number(e.target.value)), [seek]);
  const handleVol  = useCallback(
    (i: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setVolume(i, Number(e.target.value)), [setVolume]);

  return (
    <div className="bg-[#0a1929] rounded-2xl overflow-hidden shadow-lg border border-white/5">

      {/* ── Header / acordeón toggle ─────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-white/8 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gold shrink-0" />
          <span className="font-display font-semibold text-white text-sm">
            Reproductor Multitrack
          </span>
          <span className="text-white/25 text-xs">
            · {trackItems.length} pista{trackItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!loaded && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); handleLoad(); }}
              className={cn(
                "text-xs font-semibold text-navy-950 bg-gold hover:bg-gold-300 px-3 py-1.5 rounded-lg transition-colors",
                isLoading && "opacity-50 pointer-events-none",
              )}
            >
              {isLoading ? "Cargando…" : "Cargar pistas"}
            </span>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 text-white/30 transition-transform duration-300",
            open ? "rotate-180" : "rotate-0",
          )} />
        </div>
      </button>

      {/* ── Collapsible body ─────────────────────────────────── */}
      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}>
        <div className="overflow-hidden">

          {/* ── Transport ──────────────────────────────────────── */}
          <div className="px-5 py-4 border-b border-white/8 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // On iOS, unlock() and play() MUST be called synchronously
                  // within the same gesture — no await between them.
                  if (!audioUnlocked) unlock();
                  isPlaying ? pause() : play();
                }}
                disabled={!loaded || isLoading}
                className="w-9 h-9 rounded-full bg-gold hover:bg-gold-300 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying
                  ? <Pause className="w-4 h-4 text-navy-950" />
                  : <Play  className="w-4 h-4 text-navy-950 ml-0.5" />}
              </button>

              <button
                onClick={stop}
                disabled={!loaded || isLoading}
                className="w-8 h-8 rounded-full border border-white/15 hover:bg-white/10 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                aria-label="Detener"
              >
                <Square className="w-3.5 h-3.5 text-white/60" />
              </button>

              <span className="font-mono text-sm text-white/40 shrink-0">
                <span className="text-white font-semibold">{fmt(currentTime)}</span>
                {" / "}
                {fmt(duration)}
              </span>
            </div>

            <input
              type="range"
              min={0} max={duration || 1} step={0.1} value={currentTime}
              onChange={handleSeek}
              disabled={!loaded}
              className="w-full h-1.5 appearance-none rounded-full cursor-pointer disabled:cursor-default disabled:opacity-30 accent-gold"
              style={{
                background: `linear-gradient(to right, #C9A84C ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
              }}
            />
          </div>

          {/* ── iOS audio unlock banner ────────────────────────── */}
          {isIOS && loaded && !audioUnlocked && (
            <button
              onClick={unlock}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gold/10 border-b border-gold/20 hover:bg-gold/20 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <AudioLines className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gold leading-tight">
                  Toca para activar el audio
                </p>
                <p className="text-[10px] text-gold/60 leading-tight mt-0.5">
                  iOS requiere un toque para habilitar la reproducción
                </p>
              </div>
            </button>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-white/40 text-sm">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              Cargando audio…
            </div>
          )}

          {/* Empty */}
          {!loaded && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-white/15">
              <Volume2 className="w-7 h-7" />
              <p className="text-xs">Haz clic en "Cargar pistas" para iniciar</p>
            </div>
          )}

          {/* ── Track list ─────────────────────────────────────── */}
          {loaded && !isLoading && (
            <div className="divide-y divide-white/5">
              {tracks.map((track, i) => (
                <TrackRow
                  key={i}
                  track={track}
                  analyser={analysers[i] ?? null}
                  onVolume={handleVol(i)}
                  onMute={() => toggleMute(i)}
                  onSolo={() => toggleSolo(i)}
                  anySolo={tracks.some(t => t.soloed)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Track row ──────────────────────────────────────────────────
interface RowProps {
  track: TrackState;
  analyser: AnalyserNode | null;
  onVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMute: () => void;
  onSolo: () => void;
  anySolo: boolean;
}

function TrackRow({ track, analyser, onVolume, onMute, onSolo, anySolo }: RowProps) {
  const effectiveMuted = anySolo ? !track.soloed : track.muted;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">

      {/* ── Name ───────────────────────────────────────────── */}
      <span
        className="text-[10px] font-semibold uppercase tracking-wider text-white/50 w-14 shrink-0 truncate"
        title={track.name}
      >
        {track.name}
      </span>

      {/* ── VU meter — fills center space ──────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[7px] font-mono text-emerald-400/40 select-none leading-none">VU</span>
        </div>
        <VuMeter analyser={effectiveMuted ? null : analyser} />
      </div>

      {/* ── Volume — compact control, white color ───────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[7px] font-mono text-white/25 select-none leading-none hidden sm:block">VOL</span>
        <input
          type="range"
          min={0} max={1} step={0.01} value={track.volume}
          onChange={onVolume}
          className="w-16 sm:w-20 h-1 appearance-none rounded-full cursor-pointer accent-white"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.65) ${track.volume * 100}%, rgba(255,255,255,0.1) ${track.volume * 100}%)`,
          }}
          aria-label={`Volumen ${track.name}`}
        />
        <span className="text-[9px] font-mono text-white/35 w-5 text-right tabular-nums shrink-0">
          {Math.round(track.volume * 100)}
        </span>
      </div>

      {/* ── Mute ───────────────────────────────────────────── */}
      <button
        onClick={onMute}
        aria-pressed={track.muted}
        aria-label={`Mute ${track.name}`}
        className={cn(
          "w-7 h-7 rounded-lg text-[10px] font-bold transition-all shrink-0",
          track.muted
            ? "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            : "bg-white/8 text-white/30 hover:bg-white/15 hover:text-white/70",
        )}
      >
        M
      </button>

      {/* ── Solo ───────────────────────────────────────────── */}
      <button
        onClick={onSolo}
        aria-pressed={track.soloed}
        aria-label={`Solo ${track.name}`}
        className={cn(
          "w-7 h-7 rounded-lg text-[10px] font-bold transition-all shrink-0",
          track.soloed
            ? "bg-gold text-navy-950 shadow-[0_0_8px_rgba(201,168,76,0.5)]"
            : "bg-white/8 text-white/30 hover:bg-white/15 hover:text-white/70",
        )}
      >
        S
      </button>

      {track.loading && (
        <div className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {track.error && (
        <span className="text-[9px] text-red-400 shrink-0" title="Error al cargar">!</span>
      )}
    </div>
  );
}
