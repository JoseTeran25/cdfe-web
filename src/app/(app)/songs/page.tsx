"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSongs } from "@/hooks/useSongs";
import { SongsTable } from "@/components/songs/SongsTable";
import { SongModal } from "@/components/songs/SongModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { Song, SongStatus, CreateSongDto } from "@/types";

export default function SongsPage() {
  const router = useRouter();
  const { songs, loading, fetch, update, remove } = useSongs();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SongStatus | "">("");
  const [editModal, setEditModal] = useState<Song | null>(null);
  const [deleting, setDeleting] = useState<Song | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    fetch({ status: statusFilter || undefined, search: search || undefined });
  }, [fetch, statusFilter, search]);

  const handleUpdate = async (data: CreateSongDto, id?: string) => {
    if (!id) return;
    try {
      await update(id, data);
      setToast({ type: "success", message: "Canción actualizada" });
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error" });
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove(deleting.id);
      setToast({ type: "success", message: "Canción eliminada" });
      setDeleting(null);
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
          <h2 className="font-display font-bold text-2xl text-navy">Canciones</h2>
          <p className="text-gray-400 text-sm mt-0.5">Gestiona el repertorio del ministerio</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/songs/new")}>
          <Plus className="w-4 h-4" /> Nueva Canción
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o artista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40 transition-[box-shadow,border-color]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as SongStatus | "")}
          className="px-3 py-2.5 text-sm border border-surface-border rounded-xl bg-white focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVA">Activas</option>
          <option value="PENDIENTE">Pendientes</option>
        </select>
      </div>

      <SongsTable
        songs={songs}
        loading={loading}
        onEdit={s => setEditModal(s)}
        onDelete={s => setDeleting(s)}
      />

      {/* Edit modal — only for editing existing songs */}
      <SongModal
        open={!!editModal}
        song={editModal}
        onClose={() => setEditModal(null)}
        onSave={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={removing}
        message={`¿Eliminar "${deleting?.title}"? Esta acción no se puede deshacer.`}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
