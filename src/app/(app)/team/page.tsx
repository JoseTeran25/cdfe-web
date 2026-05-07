"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { UsersTable } from "@/components/users/UsersTable";
import { UserModal } from "@/components/users/UserModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { User, CreateUserDto } from "@/types";

export default function TeamPage() {
  const { users, loading, fetch, create, update, remove } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (data: Partial<CreateUserDto> & { password?: string }, id?: string) => {
    try {
      if (id) { await update(id, data as Partial<CreateUserDto>); setToast({ type: "success", message: "Miembro actualizado" }); }
      else { await create(data as CreateUserDto); setToast({ type: "success", message: "Miembro creado" }); }
    } catch (e: any) { setToast({ type: "error", message: e.message }); throw e; }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      setToast({ type: "success", message: "Miembro eliminado" });
      setDeleting(null);
    } catch (e: any) { setToast({ type: "error", message: e.message }); }
    finally { setRemoving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-navy">Equipo</h2>
          <p className="text-gray-400 text-sm mt-0.5">Músicos y vocalistas del ministerio</p>
        </div>
        <Button variant="primary" id="add-member-btn" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Nuevo Miembro
        </Button>
      </div>

      <UsersTable users={users} loading={loading}
        onEdit={u => { setEditing(u); setModalOpen(true); }}
        onDelete={u => setDeleting(u)}
      />

      <UserModal open={modalOpen} user={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        loading={removing} message={`¿Eliminar a "${deleting?.name}" del equipo? Esta acción no se puede deshacer.`} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
