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

function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
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
    <>
      {/* Desktop / tablet — table */}
      <Card padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-navy/[3%]">
                {["Fecha", "Tipo", "Título", "Canciones", "Equipo", "Estado", "Acciones"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-navy/60 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => {
                const past = isPast(s.date);
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-surface-border last:border-0 transition-colors
                      ${past ? "opacity-50 bg-gray-50/80" : "hover:bg-surface"}
                      ${!past && i % 2 === 1 ? "bg-gray-50/50" : ""}
                    `}
                  >
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
                      {past
                        ? <Badge variant="pending" size="sm">Pasado</Badge>
                        : <Badge variant="success" dot size="sm">Próximo</Badge>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
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
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-surface-border text-xs text-gray-400">
          {services.length} servicio{services.length !== 1 ? "s" : ""}
        </div>
      </Card>

      {/* Mobile — cards */}
      <div className="md:hidden flex flex-col gap-3">
        {services.map(s => {
          const past = isPast(s.date);
          return (
            <Card key={s.id} padding="md" className={past ? "opacity-60" : ""}>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">
                    {formatDate(s.date, { weekday: undefined, month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {s.title && <p className="text-sm text-gray-500 truncate">{s.title}</p>}
                </div>
                {past
                  ? <Badge variant="pending" size="sm" className="shrink-0">Pasado</Badge>
                  : <Badge variant="success" dot size="sm" className="shrink-0">Próximo</Badge>
                }
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={s.type === "DOMINGO" ? "navy" : "gold"} size="sm">
                  {getServiceTypeLabel(s.type)}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Music2 className="w-3 h-3" /> {s.setlist.length}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3 h-3" /> {s.team.length}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                <Link href={`/services/${s.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-navy hover:bg-navy/5 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" /> Ver
                </Link>
                <button onClick={() => onEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-navy hover:bg-navy/5 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => onDelete(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </Card>
          );
        })}
        <p className="text-center text-xs text-gray-400">
          {services.length} servicio{services.length !== 1 ? "s" : ""}
        </p>
      </div>
    </>
  );
}
