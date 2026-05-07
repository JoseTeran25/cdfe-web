"use client";
import { useState, useCallback } from "react";
import { songsApi } from "@/lib/api";
import type { Song, SongStatus, CreateSongDto } from "@/types";

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (p?: { status?: SongStatus; search?: string }) => {
    setLoading(true);
    try { setSongs(await songsApi.getAll(p)); }
    finally { setLoading(false); }
  }, []);

  const create = async (data: CreateSongDto) => {
    const s = await songsApi.create(data);
    setSongs(prev => [s, ...prev]);
    return s;
  };

  const update = async (id: string, data: Partial<CreateSongDto>) => {
    const s = await songsApi.update(id, data);
    setSongs(prev => prev.map(x => x.id === id ? s : x));
    return s;
  };

  const remove = async (id: string) => {
    await songsApi.remove(id);
    setSongs(prev => prev.filter(x => x.id !== id));
  };

  return { songs, loading, fetch, create, update, remove };
}
