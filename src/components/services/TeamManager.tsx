"use client";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import type { User, Instrument } from "@/types";
import type { ApiService, UserServiceItem } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { getInstrumentLabel, getRoleLabel } from "@/lib/utils";

const INSTRUMENT_OPTIONS = [
  { value: "GUITARRA", label: "Guitarra" }, { value: "BAJO", label: "Bajo" },
  { value: "BATERIA", label: "Batería" }, { value: "TECLADO", label: "Teclado" },
  { value: "PIANO", label: "Piano" }, { value: "VIOLIN", label: "Violín" },
  { value: "TROMPETA", label: "Trompeta" }, { value: "VOZ_PRINCIPAL", label: "Voz Principal" },
  { value: "VOZ_SECUNDARIA", label: "Voz Secundaria" }, { value: "OTRO", label: "Otro" },
];

interface Props {
  service: ApiService;
  availableUsers: User[];
  onAddMember: (userId: string, instrument: Instrument) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function TeamManager({ service, availableUsers, onAddMember, onRemoveMember }: Props) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("GUITARRA");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onAddMember(selectedUserId, instrument);
      setSelectedUserId("");
      setToast({ type: "success", message: "Miembro asignado al servicio" });
    } catch (e: any) {
      setToast({ type: "error", message: e.message ?? "Error al asignar" });
    } finally { setLoading(false); }
  };

  const handleRemove = async (userId: string) => {
    setLoading(true);
    try {
      await onRemoveMember(userId);
      setToast({ type: "success", message: "Miembro removido del servicio" });
    } catch (e: any) {
      setToast({ type: "error", message: e.message ?? "Error" });
    } finally { setLoading(false); }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center">
          <Users className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="font-display font-semibold text-navy">
          Equipo <span className="text-gray-400 font-normal text-sm">({service.team.length} miembros)</span>
        </h3>
      </div>

      {/* Team list */}
      <div className="space-y-2 mb-4">
        {service.team.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-surface-border rounded-xl">
            Sin miembros asignados. Agrega músicos abajo.
          </p>
        ) : (
          service.team.map((tm: UserServiceItem) => (
            <div key={tm.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-white group hover:border-navy/20 transition-colors">
              <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center shrink-0">
                <span className="text-gold font-bold text-xs">{tm.user.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{tm.user.name}</p>
                <p className="text-xs text-gray-400">{getRoleLabel(tm.user.role)}</p>
              </div>
              <Badge variant="navy" size="sm">{getInstrumentLabel(tm.instrument)}</Badge>
              <button
                onClick={() => handleRemove(tm.userId)}
                disabled={loading}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add member */}
      {availableUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="flex-1 min-w-0 sm:min-w-[180px] text-sm px-3.5 py-2.5 border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40"
          >
            <option value="">Seleccionar músico...</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {getRoleLabel(u.role)}</option>
            ))}
          </select>
          <select
            value={instrument}
            onChange={e => setInstrument(e.target.value as Instrument)}
            className="flex-1 min-w-0 sm:min-w-[140px] text-sm px-3.5 py-2.5 border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40"
          >
            {INSTRUMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="primary" size="sm" onClick={handleAdd} loading={loading} disabled={!selectedUserId}
            className="sm:shrink-0">
            <Plus className="w-4 h-4" /> Asignar
          </Button>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </section>
  );
}
