"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, FileText, Pencil, Music2, Users } from "lucide-react";
import { useServiceDetail } from "@/hooks/useServiceDetail";
import { useSongs } from "@/hooks/useSongs";
import { useUsers } from "@/hooks/useUsers";
import { SetlistManager } from "@/components/services/SetlistManager";
import { TeamManager } from "@/components/services/TeamManager";
import { SetlistPlayer } from "@/components/services/SetlistPlayer";
import { ServiceModal } from "@/components/services/ServiceModal";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { servicesApi } from "@/lib/api";
import { formatDate, getServiceTypeLabel } from "@/lib/utils";
import type { Instrument, CreateServiceDto } from "@/types";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { service, loading, refresh, addSong, removeSong, addMember, removeMember } =
    useServiceDetail(id);
  const { songs, fetch: fetchSongs } = useSongs();
  const { users, fetch: fetchUsers } = useUsers();

  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    fetchSongs();
    fetchUsers();
  }, [fetchSongs, fetchUsers]);

  const handleSaveEdit = async (data: CreateServiceDto) => {
    try {
      await servicesApi.update(id, data);
      await refresh();
      setToast({ type: "success", message: "Servicio actualizado" });
    } catch (e: any) {
      setToast({ type: "error", message: e.message });
      throw e;
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Not found ──────────────────────────────────────────────────
  if (!service) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
      <p className="font-medium text-gray-500">Servicio no encontrado</p>
      <Button variant="secondary" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Volver
      </Button>
    </div>
  );

  const availableSongs = songs.filter(
    (s) => !service.setlist.some((ss) => ss.songId === s.id)
  );
  const availableUsers = (users as any[]).filter(
    (u) => !service.team.some((t) => t.userId === u.id)
  );

  const displayTitle = service.title ??
    formatDate(service.date, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">

      {/* ── Back button ─────────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Servicios
      </button>

      {/* ── Header card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        {/* Top accent stripe */}
        <div className="h-1.5 bg-navy-gradient w-full" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            {/* Info */}
            <div className="min-w-0 flex-1">
              {/* Type badge + title */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  variant={service.type === "DOMINGO" ? "navy" : "gold"}
                  size="sm"
                >
                  {getServiceTypeLabel(service.type)}
                </Badge>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-navy leading-tight break-words">
                  {displayTitle}
                </h1>
              </div>

              {/* Meta row */}
              <div className="flex flex-col xs:flex-row flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 shrink-0 text-gray-400" />
                  {formatDate(service.date, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                {service.notes && (
                  <span className="flex items-start gap-1.5">
                    <FileText className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{service.notes}</span>
                  </span>
                )}
              </div>

              {/* Quick stats — mobile-friendly pill row */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 rounded-xl text-xs font-medium text-navy">
                  <Music2 className="w-3.5 h-3.5" />
                  {service.setlist.length} canción{service.setlist.length !== 1 ? "es" : ""}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 rounded-xl text-xs font-medium text-amber-700">
                  <Users className="w-3.5 h-3.5" />
                  {service.team.length} miembro{service.team.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Edit button — always accessible */}
            <div className="shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
                id="edit-service-btn"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden xs:inline">Editar datos</span>
                <span className="xs:hidden">Editar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      

      {/* ── Two-column managers ──────────────────────────────────── */}
      {/*
        Mobile: single column stacked
        lg+:   two equal columns side by side
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

        {/* Setlist */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-0">
          <SetlistManager
            service={service}
            availableSongs={availableSongs}
            onAddSong={async (songId) => { await addSong(songId); }}
            onRemoveSong={async (songId) => { await removeSong(songId); }}
          />
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm p-5 sm:p-6 flex flex-col gap-0">
          <TeamManager
            service={service}
            availableUsers={availableUsers}
            onAddMember={async (userId: string, instrument: Instrument) => {
              await addMember(userId, instrument);
            }}
            onRemoveMember={async (userId) => { await removeMember(userId); }}
          />
        </div>
      </div>

      {/* ── Setlist Player / Modo Ensayo ────────────────────────── */}
      <SetlistPlayer
        songs={service.setlist
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(item => item.song)}
      />

      {/* ── Modals & notifications ────────────────────────────────── */}
      <ServiceModal
        open={editOpen}
        service={service}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
