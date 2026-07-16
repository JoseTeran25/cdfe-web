"use client";
import { useState, useCallback } from "react";
import { supportRequestsApi } from "@/lib/api";
import type { SupportRequest } from "@/types";

export function useSupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setRequests(await supportRequestsApi.getAll()); }
    finally { setLoading(false); }
  }, []);

  const setContacted = async (id: string, contacted: boolean) => {
    const r = await supportRequestsApi.setContacted(id, contacted);
    setRequests(prev => prev.map(x => x.id === id ? r : x));
    return r;
  };

  return { requests, loading, fetch, setContacted };
}
