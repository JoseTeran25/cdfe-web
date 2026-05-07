"use client";
import { Pencil, Trash2, CalendarDays, Music2, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ApiService } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getServiceTypeLabel } from "@/lib/utils";

interface Props {
  services: ApiService[];
  loading: boolean;
  onEdit: (service: ApiService) => void;
  onDelete: (service: ApiService) => void;
}

export function ServicesTable({ services, loading, onEdit, onDelete }: Props) {
  if (loading) return (
    <Card padding="none">
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    </Card>
  );

  if (services.length === 0) return (
    <Card padding="none">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
          <CalendarDays className="w-7 h-7 text-navy/30" />
        </div>
        <p className="font-medium text-gray-500">Sin servicios</p>
        <p className="text-xs text-gray-400 mt-1">Crea el primer servicio del ministerio</p>
      </div>
    </Card>
  );

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-navy/[3%]">
              {["Fecha", "Tipo", "Título", "Canciones", "Equipo", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-navy/60 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id} className={`border-b border-surface-border last:border-0 hover:bg-surface transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                  {formatDate(s.date, { weekday: undefined, month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={s.type === "DOMINGO" ? "navy" : "gold"} size="sm">
                    {getServiceTypeLabel(s.type)}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{s.title ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Music2 className="w-3.5 h-3.5" /> {s.setlist.length}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-3.5 h-3.5" /> {s.team.length}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    {/* Navigate to detail page */}
                    <Link href={`/services/${s.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors" title="Ver y configurar">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors" title="Editar datos">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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
        {services.length} servicio{services.length !== 1 ? "s" : ""}
      </div>
    </Card>
  );
}
