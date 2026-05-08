"use client";
import { useState, useEffect } from "react";
import { songsApi, servicesApi, usersApi } from "@/lib/api";
import type { Song, User } from "@/types";
import type { ApiService } from "@/lib/api";

export interface DashboardData {
  totalSongs: number;
  activeSongs: number;
  pendingSongs: number;
  totalMembers: number;
  nextService: ApiService | null;
  songsToLearn: Song[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all necessary data in parallel
        const [allSongs, nextService, allUsers] = await Promise.all([
          songsApi.getAll(),
          servicesApi.getNext().catch(() => null),
          usersApi.getAll(),
        ]);

        const activeCount = allSongs.filter(s => s.status === "ACTIVA").length;
        const pendingCount = allSongs.filter(s => s.status === "PENDIENTE").length;
        const songsToLearn = pendingCount > 0 
          ? allSongs.filter(s => s.status === "PENDIENTE").slice(0, 3)
          : [];

        setData({
          totalSongs: allSongs.length,
          activeSongs: activeCount,
          pendingSongs: pendingCount,
          totalMembers: allUsers.length,
          nextService,
          songsToLearn,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando datos";
        setError(message);
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
}
