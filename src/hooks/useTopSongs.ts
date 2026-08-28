"use client";
import { useState, useEffect } from "react";
import { songsApi, type TopPlayedSong } from "@/lib/api";
import type { ServiceType } from "@/types";

export interface TopSongsFilters {
  year?: number;
  serviceType?: ServiceType;
}

export function useTopSongs(filters: TopSongsFilters) {
  const [data, setData] = useState<TopPlayedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await songsApi.getTopPlayed({
          year: filters.year,
          serviceType: filters.serviceType,
          limit: 10,
        });
        setData(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar datos";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [filters.year, filters.serviceType]);

  return { data, loading, error };
}
