"use client";
import { useState, useCallback, useEffect } from "react";
import { servicesApi, type ApiService } from "@/lib/api";
import type { Instrument } from "@/types";

export function useServiceDetail(id: string) {
  const [service, setService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setService(await servicesApi.getOne(id)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const addSong = async (songId: string) => {
    const updated = await servicesApi.addSong(id, songId);
    setService(updated);
    return updated;
  };

  const removeSong = async (songId: string) => {
    const updated = await servicesApi.removeSong(id, songId);
    setService(updated);
    return updated;
  };

  const addMember = async (userId: string, instrument: Instrument) => {
    const updated = await servicesApi.addMember(id, userId, instrument);
    setService(updated);
    return updated;
  };

  const removeMember = async (userId: string) => {
    const updated = await servicesApi.removeMember(id, userId);
    setService(updated);
    return updated;
  };

  return { service, loading, refresh, addSong, removeSong, addMember, removeMember };
}
