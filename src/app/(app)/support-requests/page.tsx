"use client";

import { useState, useEffect } from "react";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { SupportRequestsTable } from "@/components/support/SupportRequestsTable";
import { SupportRequestDetailModal } from "@/components/support/SupportRequestDetailModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastData } from "@/components/ui/Toast";
import type { SupportRequest } from "@/types";

type StatusFilter = "" | "pending" | "contacted";

export default function SupportRequestsPage() {
  const { requests, loading, fetch, setContacted, remove } = useSupportRequests();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [viewing, setViewing] = useState<SupportRequest | null>(null);
  const [deleting, setDeleting] = useState<SupportRequest | null>(null);
  const [removing, setRemoving] = useState(false);
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

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      setToast({ type: "success", message: "Solicitud eliminada" });
      setDeleting(null);
      setViewing(prev => (prev && prev.id === deleting.id ? null : prev));
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error" });
    } finally {
      setRemoving(false);
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
        onDelete={setDeleting}
      />

      <SupportRequestDetailModal
        request={viewing}
        onClose={() => setViewing(null)}
        onToggleContacted={handleToggleContacted}
        onDelete={r => setDeleting(r)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={removing}
        message={`¿Eliminar la solicitud de "${deleting?.name}"? Esta acción no se puede deshacer.`}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
