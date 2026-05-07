"use client";
import { useState, useEffect } from "react";
import { songsApi } from "@/lib/api";
import type { Song } from "@/types";

export function useSong(id: string) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    songsApi
      .getOne(id)
      .then(setSong)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { song, loading, error };
}
