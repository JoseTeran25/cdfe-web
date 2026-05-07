"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMultitrack, type TrackState } from "@/hooks/useMultitrack";
import type { TrackItem } from "@/types";

// ── VU Meter ───────────────────────────────────────────────────
// Direct DOM mutation inside RAF avoids React render overhead.
function VuMeter({ analyser }: { analyser: AnalyserNode | null }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const fill = fillRef.current;
    if (!analyser || !fill) {
      if (fill) fill.style.height = "0%";
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      // amplify for visual clarity — real signals are often quiet
      fill.style.height = `${Math.min((avg / 255) * 220, 100)}%`;
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return (
    <div className="relative w-2 h-12 bg-white/10 rounded-full overflow-hidden mx-auto">
      <div
        ref={fillRef}
        className="absolute bottom-0 w-full rounded-full"
        style={{
          height: "0%",
          background: "linear-gradient(to top, #001F3F 0%, #4a90d9 60%, #C9A84C 100%)",
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

// ── Props ──────────────────────────────────────────────────────
interface Props {
  tracks: TrackItem[];
}

export function MultitrackPlayer({ tracks: trackItems }: Props) {
  const {
    tracks, analysers, isPlaying, isLoading, currentTime, duration,
    load, play, pause, stop, seek, setVolume, toggleMute, toggleSolo,
  } = useMultitrack();

  const loaded = tracks.length > 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleLoad = useCallback(() => load(trackItems), [load, trackItems]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => seek(Number(e.target.value)),
    [seek]
  );

  const handleVol = useCallback(
    (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => setVolume(i, Number(e.target.value)),
    [setVolume]
  );

  return (
    <div className="bg-navy rounded-2xl overflow-hidden shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gold" />
          <span className="font-display font-semibold text-white text-sm">
            Reproductor Multitrack
          </span>
          <span className="text-white/30 text-xs">
            · {trackItems.length} pista{trackItems.length !== 1 ? "s" : ""}
          </span>
        </div>
        {!loaded && (
          <button
            onClick={handleLoad}
            disabled={isLoading}
            className="text-xs font-semibold text-navy-950 bg-gold hover:bg-gold-300 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isLoading ? "Cargando…" : "Cargar pistas"}
          </button>
        )}
      </div>

      {/* Transport */}
      <div className="px-5 py-4 border-b border-white/10 space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={isPlaying ? pause : play}
            disabled={!loaded || isLoading}
            className="w-9 h-9 rounded-full bg-gold hover:bg-gold-300 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying
              ? <Pause className="w-4 h-4 text-navy-950" />
              : <Play className="w-4 h-4 text-navy-950 ml-0.5" />}
          </button>

          <button
            onClick={stop}
            disabled={!loaded || isLoading}
            className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
            aria-label="Detener"
          >
            <Square className="w-3.5 h-3.5 text-white/70" />
          </button>

          <span className="font-mono text-xs text-white/60 shrink-0">
            <span className="text-white">{fmt(currentTime)}</span>
            {" / "}
            {fmt(duration)}
          </span>
        </div>

        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={!loaded}
          className="w-full h-1.5 appearance-none rounded-full cursor-pointer disabled:cursor-default disabled:opacity-30"
          style={{
            background: `linear-gradient(to right, #C9A84C ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
          }}
        />
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-white/50 text-sm">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          Cargando audio…
        </div>
      )}

      {!loaded && !isLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-white/20">
          <Volume2 className="w-8 h-8" />
          <p className="text-sm">Haz clic en "Cargar pistas" para iniciar</p>
        </div>
      )}

      {/* Track mixer — horizontal scroll on small screens */}
      {loaded && !isLoading && (
        <div className="overflow-x-auto">
          <div className="flex min-w-max divide-x divide-white/6">
            {tracks.map((track, i) => (
              <TrackStrip
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
        </div>
      )}
    </div>
  );
}

// ── Track strip ────────────────────────────────────────────────
interface StripProps {
  track: TrackState;
  analyser: AnalyserNode | null;
  onVolume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMute: () => void;
  onSolo: () => void;
  anySolo: boolean;
}

function TrackStrip({ track, analyser, onVolume, onMute, onSolo, anySolo }: StripProps) {
  const effectiveMuted = anySolo ? !track.soloed : track.muted;

  return (
    <div className="flex flex-col items-center gap-3 px-4 pt-4 pb-4 min-w-24 hover:bg-white/3 transition-colors">

      {/* Name */}
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-white/50 text-center w-full truncate"
        title={track.name}
      >
        {track.name}
      </span>

      {/* VU meter */}
      <VuMeter analyser={effectiveMuted ? null : analyser} />

      {/* Volume label + slider */}
      <div className="w-full space-y-1">
        <div className="flex justify-between text-[9px] text-white/30">
          <span>vol</span>
          <span>{Math.round(track.volume * 100)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={track.volume}
          onChange={onVolume}
          className="w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #C9A84C ${track.volume * 100}%, rgba(255,255,255,0.15) ${track.volume * 100}%)`,
          }}
          aria-label={`Volumen ${track.name}`}
        />
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-1.5">
        <button
          onClick={onMute}
          aria-pressed={track.muted}
          aria-label={`Mute ${track.name}`}
          className={cn(
            "w-7 h-7 rounded-lg text-[10px] font-bold transition-all",
            track.muted
              ? "bg-navy text-white ring-1 ring-white/20"
              : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70"
          )}
        >
          M
        </button>
        <button
          onClick={onSolo}
          aria-pressed={track.soloed}
          aria-label={`Solo ${track.name}`}
          className={cn(
            "w-7 h-7 rounded-lg text-[10px] font-bold transition-all",
            track.soloed
              ? "bg-navy text-white ring-1 ring-white/20"
              : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70"
          )}
        >
          S
        </button>
      </div>

      {track.loading && (
        <div className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
      )}
      {track.error && (
        <span className="text-[9px] text-red-400 text-center">Error</span>
      )}
    </div>
  );
}
