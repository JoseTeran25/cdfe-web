"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, History } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServiceModal } from "@/components/services/ServiceModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { ApiService } from "@/lib/api";
import type { CreateServiceDto } from "@/types";

function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

export default function ServicesPage() {
  const { services, loading, fetch, create, update, remove } = useServices();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [deleting, setDeleting] = useState<ApiService | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (data: CreateServiceDto, id?: string) => {
    try {
      if (id) { await update(id, data); setToast({ type: "success", message: "Servicio actualizado" }); }
      else { await create(data); setToast({ type: "success", message: "Servicio creado" }); }
    } catch (e: any) { setToast({ type: "error", message: e.message }); throw e; }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      setToast({ type: "success", message: "Servicio eliminado" });
      setDeleting(null);
    } catch (e: any) { setToast({ type: "error", message: e.message }); }
    finally { setRemoving(false); }
  };

  const { upcoming, past } = useMemo(() => ({
    upcoming: services.filter(s => !isPast(s.date)),
    past: services.filter(s => isPast(s.date)),
  }), [services]);

  const visibleServices = showPast ? services : upcoming;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy">Servicios</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Planifica y gestiona los servicios. Haz clic en → para configurar el setlist y equipo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {past.length > 0 && (
            <button
              onClick={() => setShowPast(p => !p)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors px-3 py-2 rounded-xl border border-surface-border bg-white"
            >
              <History className="w-4 h-4" />
              {showPast ? "Ocultar servicios pasados" : `Ver servicios pasados (${past.length})`}
            </button>
          )}
          <Button variant="primary" id="add-service-btn" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Nuevo Servicio
          </Button>
        </div>
      </div>

      {!showPast && upcoming.length === 0 && !loading && (
        <div className="text-center py-4 text-sm text-gray-400">
          No hay servicios próximos.{" "}
          {past.length > 0 && (
            <button onClick={() => setShowPast(true)} className="text-navy underline underline-offset-2">
              Ver los {past.length} servicios pasados
            </button>
          )}
        </div>
      )}

      <ServicesTable
        services={visibleServices}
        loading={loading}
        onEdit={s => { setEditing(s); setModalOpen(true); }}
        onDelete={s => setDeleting(s)}
      />

      <ServiceModal open={modalOpen} service={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        loading={removing} message="¿Eliminar este servicio? Se eliminarán también el setlist y las asignaciones de equipo." />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
