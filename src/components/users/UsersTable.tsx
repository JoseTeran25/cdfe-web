"use client";
import { Pencil, Trash2, Users } from "lucide-react";
import type { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getRoleLabel, getInstrumentLabel } from "@/lib/utils";

type RoleBadge = "gold" | "navy" | "success" | "warning";
const ROLE_BADGE: Record<string, RoleBadge> = { ADMIN: "gold", DIRECTOR: "navy", MUSICO: "success", VOCALISTA: "warning" };

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({ users, loading, onEdit, onDelete }: Props) {
  if (loading) return (
    <Card padding="none">
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    </Card>
  );

  if (users.length === 0) return (
    <Card padding="none">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
          <Users className="w-7 h-7 text-navy/30" />
        </div>
        <p className="font-medium text-gray-500">Sin miembros</p>
        <p className="text-xs text-gray-400 mt-1">Agrega el primer músico al equipo</p>
      </div>
    </Card>
  );

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-navy/[3%]">
              {["Miembro", "Email", "Rol", "Instrumento", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-navy/60 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={`border-b border-surface-border last:border-0 hover:bg-surface transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0">
                      <span className="text-gold font-bold text-xs">{u.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={ROLE_BADGE[u.role] ?? "neutral"} size="sm">{getRoleLabel(u.role)}</Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-500">
                  {u.instrument ? getInstrumentLabel(u.instrument) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-surface-border text-xs text-gray-400">
        {users.length} miembro{users.length !== 1 ? "s" : ""}
      </div>
    </Card>
  );
}
