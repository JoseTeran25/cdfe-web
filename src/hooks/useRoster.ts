"use client";
import { useState, useEffect, useCallback } from "react";
import { rosterApi } from "@/lib/api";
import type { RosterAssignment, RosterRole, RosterServiceRef, ServiceType } from "@/types";

export function useRoster(month: string) {
  const [assignments, setAssignments] = useState<RosterAssignment[]>([]);
  const [services, setServices] = useState<RosterServiceRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    rosterApi
      .getMonth(month)
      .then((data) => {
        if (ignore) return;
        setAssignments(data.assignments);
        setServices(data.services);
      })
      .catch((e) => !ignore && setError(e instanceof Error ? e.message : "Error al cargar la programación"))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [month]);

  const setCell = useCallback(
    async (date: string, serviceType: ServiceType, role: RosterRole, userIds: string[]) => {
      const cell = await rosterApi.setCell({ date, serviceType, role, userIds });
      setAssignments((prev) => [
        ...prev.filter((a) => !(a.date === date && a.serviceType === serviceType && a.role === role)),
        ...cell,
      ]);
    },
    []
  );

  return { assignments, services, loading, error, setCell };
}
