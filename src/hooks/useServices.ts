"use client";
import { useState, useCallback } from "react";
import { servicesApi, type ApiService } from "@/lib/api";
import type { CreateServiceDto } from "@/types";

export function useServices() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setServices(await servicesApi.getAll()); }
    finally { setLoading(false); }
  }, []);

  const create = async (data: CreateServiceDto) => {
    const s = await servicesApi.create(data);
    setServices(prev => [s, ...prev]);
    return s;
  };

  const update = async (id: string, data: Partial<CreateServiceDto>) => {
    const s = await servicesApi.update(id, data);
    setServices(prev => prev.map(x => x.id === id ? s : x));
    return s;
  };

  const remove = async (id: string) => {
    await servicesApi.remove(id);
    setServices(prev => prev.filter(x => x.id !== id));
  };

  return { services, loading, fetch, create, update, remove };
}
