"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServiceModal } from "@/components/services/ServiceModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { ApiService } from "@/lib/api";
import type { CreateServiceDto } from "@/types";

export default function ServicesPage() {
  const { services, loading, fetch, create, update, remove } = useServices();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [deleting, setDeleting] = useState<ApiService | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy">Servicios</h2>
          <p className="text-gray-400 text-sm mt-0.5">Planifica y gestiona los servicios. Haz clic en → para configurar el setlist y equipo.</p>
        </div>
        <Button variant="primary" id="add-service-btn" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </Button>
      </div>

      <ServicesTable services={services} loading={loading}
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
