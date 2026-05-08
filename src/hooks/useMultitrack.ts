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

export function useMultitrack() {
  const ctxRef = useRef<AudioContext | null>(null);
  const volumeGainsRef = useRef<GainNode[]>([]);
  const muteGainsRef = useRef<GainNode[]>([]);
  const analyserNodesRef = useRef<AnalyserNode[]>([]);
  const buffersRef = useRef<(AudioBuffer | null)[]>([]);
  const sourcesRef = useRef<(AudioBufferSourceNode | null)[]>([]);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const durationRef = useRef(0);
  const rafRef = useRef(0);

  const [tracks, setTracks] = useState<TrackState[]>([]);
  const [analysers, setAnalysers] = useState<(AnalyserNode | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return ctxRef.current;
  }, []);

  // Must be called synchronously inside a touch/click handler (no preceding await).
  // iOS Safari only accepts resume() when it's the first thing in the gesture call stack.
  const unlock = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state !== "running") {
      ctx.resume()
        .then(() => setAudioUnlocked(true))
        .catch(() => {});
    } else {
      setAudioUnlocked(true);
    }
  }, [getCtx]);

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
      const clamped = Math.max(0, Math.min(elapsed, durationRef.current));
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
    const volGains: GainNode[] = [];
    const muteGains: GainNode[] = [];
    const newAnalysers: AnalyserNode[] = [];

    items.forEach(() => {
      const volG = ctx.createGain();
      const muteG = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      // source → volG → muteG → analyser → destination
      volG.connect(muteG);
      muteG.connect(analyser);
      analyser.connect(ctx.destination);
      volGains.push(volG);
      muteGains.push(muteG);
      newAnalysers.push(analyser);
    });

    volumeGainsRef.current = volGains;
    muteGainsRef.current = muteGains;
    analyserNodesRef.current = newAnalysers;
    buffersRef.current = new Array(items.length).fill(null);

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
        return ctx.decodeAudioData(buf);
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

  const play = useCallback(async () => {
    if (buffersRef.current.length === 0) return;
    const ctx = getCtx();
    if (ctx.state !== "running") {
      await ctx.resume();
      setAudioUnlocked(true);
    }

    stopSources();
    const offset = Math.min(pausedAtRef.current, durationRef.current);
    const startTime = ctx.currentTime + 0.05;

    sourcesRef.current = buffersRef.current.map((buffer, i) => {
      if (!buffer) return null;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(volumeGainsRef.current[i]);
      source.start(startTime, offset);
      return source;
    });

    // startedAtRef is the "virtual zero" of context time: elapsed = ctx.currentTime - startedAtRef
    startedAtRef.current = startTime - offset;
    setIsPlaying(true);
    startRaf();
  }, [getCtx, stopSources, startRaf]);

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
