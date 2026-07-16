"use client";

import { useState, useEffect } from "react";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { SupportRequestsTable } from "@/components/support/SupportRequestsTable";
import { SupportRequestDetailModal } from "@/components/support/SupportRequestDetailModal";
import { Toast, type ToastData } from "@/components/ui/Toast";
import type { SupportRequest } from "@/types";

type StatusFilter = "" | "pending" | "contacted";

export default function SupportRequestsPage() {
  const { requests, loading, fetch, setContacted } = useSupportRequests();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [viewing, setViewing] = useState<SupportRequest | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = requests.filter(r => {
    if (statusFilter === "pending") return !r.contacted;
    if (statusFilter === "contacted") return r.contacted;
    return true;
  });

  const pendingCount = requests.filter(r => !r.contacted).length;

  const handleToggleContacted = async (r: SupportRequest) => {
    try {
      const updated = await setContacted(r.id, !r.contacted);
      setToast({
        type: "success",
        message: updated.contacted ? "Marcado como contactado" : "Marcado como pendiente",
      });
      setViewing(prev => (prev && prev.id === r.id ? updated : prev));
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy">No estás solo</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Solicitudes de acompañamiento recibidas desde la landing pública
            {pendingCount > 0 && (
              <span className="ml-1.5 text-amber-600 font-medium">
                · {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2.5 text-sm border border-surface-border rounded-xl bg-white focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="contacted">Contactados</option>
        </select>
      </div>

      <SupportRequestsTable
        requests={filtered}
        loading={loading}
        onView={setViewing}
        onToggleContacted={handleToggleContacted}
      />

      <SupportRequestDetailModal
        request={viewing}
        onClose={() => setViewing(null)}
        onToggleContacted={handleToggleContacted}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
