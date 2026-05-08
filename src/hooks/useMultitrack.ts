"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { TrackItem } from "@/types";

export interface TrackState {
  name: string;
  url: string;
  volume: number;
  muted: boolean;
  soloed: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Cross-browser decodeAudioData.
 *
 * Older iOS Safari (≤ 14) doesn't support the Promise-based API and only
 * exposes the callback form.  We detect which one works and use that one
 * exclusively (never both, to avoid double-resolve races).
 */
function decodeAudio(ctx: AudioContext, buf: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise<AudioBuffer>((resolve, reject) => {
    try {
      // Pass success + error callbacks.  If the browser ALSO returns a Promise
      // we intentionally ignore it — the callbacks are sufficient and universal.
      ctx.decodeAudioData(
        buf,
        (decoded) => resolve(decoded),
        (err) => reject(err ?? new Error("decodeAudioData failed")),
      );
    } catch (e) {
      reject(e);
    }
  });
}

export function useMultitrack() {
  const ctxRef           = useRef<AudioContext | null>(null);
  const volumeGainsRef   = useRef<GainNode[]>([]);
  const muteGainsRef     = useRef<GainNode[]>([]);
  const analyserNodesRef = useRef<AnalyserNode[]>([]);
  const buffersRef       = useRef<(AudioBuffer | null)[]>([]);
  const sourcesRef       = useRef<(AudioBufferSourceNode | null)[]>([]);
  const startedAtRef     = useRef(0);
  const pausedAtRef      = useRef(0);
  const durationRef      = useRef(0);
  const rafRef           = useRef(0);

  const [tracks,        setTracks]        = useState<TrackState[]>([]);
  const [analysers,     setAnalysers]     = useState<(AnalyserNode | null)[]>([]);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // ── AudioContext factory ───────────────────────────────────────────────────
  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  // ── unlock ────────────────────────────────────────────────────────────────
  /**
   * MUST be called synchronously inside a touch / click handler.
   *
   * iOS Safari only grants audio permission when AudioContext.resume() is the
   * first thing on the call stack during a user gesture.  We also play a
   * one-frame silent buffer — the canonical trick to fully wake WebKit's audio
   * pipeline on older iOS versions.
   *
   * Returns a Promise that resolves once the context is confirmed "running".
   * Callers that need to start audio right after can await this.
   */
  const unlock = useCallback((): Promise<void> => {
    const ctx = getCtx();

    const activateContext = (): Promise<void> => {
      // Play a 1-sample silent buffer — this is the reliable iOS unlock trick
      try {
        const silentBuf = ctx.createBuffer(1, 1, 22050);
        const silentSrc = ctx.createBufferSource();
        silentSrc.buffer = silentBuf;
        silentSrc.connect(ctx.destination);
        silentSrc.start(0);
      } catch { /* ignore */ }

      setAudioUnlocked(true);
      return Promise.resolve();
    };

    if (ctx.state === "running") {
      return activateContext();
    }

    // resume() MUST be called synchronously here (we are still inside the gesture).
    // The .then() executes after the context is confirmed running — iOS allows this.
    return ctx.resume().then(activateContext).catch(activateContext);
  }, [getCtx]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const stopSources = useCallback(() => {
    sourcesRef.current.forEach(s => {
      try { s?.stop(); s?.disconnect(); } catch { /* already stopped */ }
    });
    sourcesRef.current = [];
  }, []);

  const stopRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  const startRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const loop = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const elapsed = ctx.currentTime - startedAtRef.current;
      const clamped  = Math.max(0, Math.min(elapsed, durationRef.current));
      setCurrentTime(clamped);
      if (durationRef.current > 0 && elapsed >= durationRef.current) {
        setIsPlaying(false);
        pausedAtRef.current = 0;
        setCurrentTime(0);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const applyMuteGains = useCallback((trkState: TrackState[]) => {
    const anySolo = trkState.some(t => t.soloed);
    const ctx = ctxRef.current;
    trkState.forEach((t, i) => {
      const gain = muteGainsRef.current[i];
      if (!gain) return;
      const active = anySolo ? t.soloed : !t.muted;
      gain.gain.setTargetAtTime(active ? 1 : 0, ctx ? ctx.currentTime : 0, 0.01);
    });
  }, []);

  // ── load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (items: TrackItem[]) => {
    cancelAnimationFrame(rafRef.current);
    stopSources();

    volumeGainsRef.current.forEach(n => { try { n.disconnect(); } catch { /* ok */ } });
    muteGainsRef.current.forEach(n => { try { n.disconnect(); } catch { /* ok */ } });
    analyserNodesRef.current.forEach(n => { try { n.disconnect(); } catch { /* ok */ } });

    pausedAtRef.current = 0;
    durationRef.current = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);

    const ctx = getCtx();
    const volGains:     GainNode[]     = [];
    const muteGains:    GainNode[]     = [];
    const newAnalysers: AnalyserNode[] = [];

    items.forEach(() => {
      const volG     = ctx.createGain();
      const muteG    = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      // chain: source → volGain → muteGain → analyser → destination
      volG.connect(muteG);
      muteG.connect(analyser);
      analyser.connect(ctx.destination);
      volGains.push(volG);
      muteGains.push(muteG);
      newAnalysers.push(analyser);
    });

    volumeGainsRef.current   = volGains;
    muteGainsRef.current     = muteGains;
    analyserNodesRef.current = newAnalysers;
    buffersRef.current       = new Array(items.length).fill(null);

    setTracks(items.map(item => ({
      name: item.name, url: item.url,
      volume: 1, muted: false, soloed: false, loading: true, error: null,
    })));
    setAnalysers([...newAnalysers]);

    const results = await Promise.allSettled(
      items.map(async item => {
        const res = await fetch(item.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        return decodeAudio(ctx, buf);
      })
    );

    let maxDur = 0;
    buffersRef.current = results.map(r => {
      if (r.status === "fulfilled") {
        if (r.value.duration > maxDur) maxDur = r.value.duration;
        return r.value;
      }
      return null;
    });

    durationRef.current = maxDur;
    setDuration(maxDur);
    setTracks(prev =>
      prev.map((t, i) => ({
        ...t,
        loading: false,
        error: results[i].status === "rejected"
          ? ((results[i] as PromiseRejectedResult).reason?.message ?? "Error al cargar")
          : null,
      }))
    );
    setIsLoading(false);
  }, [getCtx, stopSources]);

  // ── play ──────────────────────────────────────────────────────────────────
  /**
   * iOS-safe play().
   *
   * The critical rule on iOS Safari:
   *   • AudioContext.resume() must be called SYNCHRONOUSLY inside the gesture.
   *   • AudioBufferSourceNode.start() must happen AFTER the context is confirmed
   *     "running" — i.e., inside the resume().then() callback.
   *
   * Calling start() before resume() resolves (even in the same tick) causes
   * iOS to silently discard the scheduled audio.
   *
   * This function:
   *  1. Calls resume() synchronously (satisfies iOS gesture requirement).
   *  2. Starts the sources inside .then() (context is confirmed running).
   */
  const play = useCallback(() => {
    if (buffersRef.current.length === 0) return;
    const ctx = getCtx();

    const startSources = () => {
      stopSources();
      const offset    = Math.min(pausedAtRef.current, durationRef.current);
      const startTime = ctx.currentTime + 0.05;

      sourcesRef.current = buffersRef.current.map((buffer, i) => {
        if (!buffer) return null;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(volumeGainsRef.current[i]);
        source.start(startTime, offset);
        return source;
      });

      // elapsed = ctx.currentTime - startedAtRef  →  startedAtRef = startTime - offset
      startedAtRef.current = startTime - offset;
      setIsPlaying(true);
      startRaf();
    };

    if (ctx.state === "running") {
      // Context already unlocked — start immediately
      setAudioUnlocked(true);
      startSources();
    } else {
      // resume() called synchronously here (inside gesture) — iOS grants permission.
      // startSources() runs in .then() — context is confirmed running at that point.
      ctx.resume()
        .then(() => {
          setAudioUnlocked(true);
          startSources();
        })
        .catch(() => {
          // resume failed — try anyway (some iOS versions still play after a failed resume)
          startSources();
        });
    }
  }, [getCtx, stopSources, startRaf]);

  // ── pause / stop / seek ───────────────────────────────────────────────────
  const pause = useCallback(() => {
    const ctx = ctxRef.current;
    stopRaf();
    if (ctx) pausedAtRef.current = Math.max(0, ctx.currentTime - startedAtRef.current);
    stopSources();
    setIsPlaying(false);
  }, [stopRaf, stopSources]);

  const stop = useCallback(() => {
    stopRaf();
    stopSources();
    pausedAtRef.current = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, [stopRaf, stopSources]);

  const seek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, durationRef.current));
    pausedAtRef.current = clamped;
    setCurrentTime(clamped);

    if (sourcesRef.current.some(Boolean)) {
      const ctx = getCtx();
      stopSources();
      const startTime = ctx.currentTime + 0.05;
      sourcesRef.current = buffersRef.current.map((buffer, i) => {
        if (!buffer) return null;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(volumeGainsRef.current[i]);
        source.start(startTime, clamped);
        return source;
      });
      startedAtRef.current = startTime - clamped;
    }
  }, [getCtx, stopSources]);

  // ── volume / mute / solo ──────────────────────────────────────────────────
  const setVolume = useCallback((index: number, value: number) => {
    const gain = volumeGainsRef.current[index];
    if (gain) {
      const ctx = ctxRef.current;
      gain.gain.setTargetAtTime(value, ctx ? ctx.currentTime : 0, 0.01);
    }
    setTracks(prev => prev.map((t, i) => i === index ? { ...t, volume: value } : t));
  }, []);

  const toggleMute = useCallback((index: number) => {
    setTracks(prev => {
      const next = prev.map((t, i) => i === index ? { ...t, muted: !t.muted } : t);
      applyMuteGains(next);
      return next;
    });
  }, [applyMuteGains]);

  const toggleSolo = useCallback((index: number) => {
    setTracks(prev => {
      const next = prev.map((t, i) => i === index ? { ...t, soloed: !t.soloed } : t);
      applyMuteGains(next);
      return next;
    });
  }, [applyMuteGains]);

  // ── cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopSources();
      ctxRef.current?.close();
    };
  }, [stopSources]);

  return {
    tracks, analysers, isPlaying, isLoading, currentTime, duration, audioUnlocked,
    load, play, pause, stop, seek, setVolume, toggleMute, toggleSolo, unlock,
  };
}
