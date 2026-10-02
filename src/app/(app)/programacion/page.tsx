"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { useRoster } from "@/hooks/useRoster";
import { useUsers } from "@/hooks/useUsers";
import { rosterApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { RosterRole, User } from "@/types";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { RosterCellModal } from "@/components/roster/RosterCellModal";
import {
  ROSTER_GROUPS,
  ROSTER_COLUMNS,
  buildRows,
  formatMonthTitle,
  formatRowDate,
  formatRowService,
  getRosterRoleLabel,
  rowKey,
  shiftMonth,
  todayKey,
  type RosterRow,
} from "@/components/roster/rosterConfig";

const TYPE_ACCENT = {
  DOMINGO: "bg-navy",
  MIERCOLES: "bg-gold",
  JOVENES: "bg-violet-500",
} as const;

/** Primer nombre, como en el calendario; agrega la inicial del apellido si se repite. */
function shortName(user: { id: string; name: string }, users: User[]): string {
  const [first, ...rest] = user.name.trim().split(/\s+/);
  const clash = users.some((u) => u.id !== user.id && u.name.trim().split(/\s+/)[0] === first);
  return clash && rest.length ? `${first} ${rest[0][0]}.` : first;
}

export default function ProgramacionPage() {
  const [month, setMonth] = useState(() => todayKey().slice(0, 7));
  const { assignments, services, loading, error, setCell } = useRoster(month);
  const { users, fetch: fetchUsers } = useUsers();
  const [editing, setEditing] = useState<{ row: RosterRow; role: RosterRole } | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const cells = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const key = `${rowKey(a.date, a.serviceType)}|${a.role}`;
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [assignments]);

  const serviceByRow = useMemo(
    () => new Map(services.map((s) => [rowKey(s.date, s.type), s])),
    [services]
  );

  const rows = useMemo(
    () =>
      buildRows(month, [
        ...assignments.map((a) => ({ date: a.date, serviceType: a.serviceType })),
        ...services.map((s) => ({ date: s.date, serviceType: s.type })),
      ]),
    [month, assignments, services]
  );

  const today = todayKey();

  const editingIds = useMemo(() => {
    if (!editing) return [];
    const key = `${rowKey(editing.row.date, editing.row.serviceType)}|${editing.role}`;
    return (cells.get(key) ?? []).map((a) => a.userId);
  }, [editing, cells]);

  const handleSaveCell = async (userIds: string[]) => {
    if (!editing) return;
    try {
      await setCell(editing.row.date, editing.row.serviceType, editing.role, userIds);
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo guardar" });
      throw e;
    }
  };

  const handleApply = async (serviceId: string) => {
    setApplying(serviceId);
    try {
      const { added } = await rosterApi.applyToService(serviceId);
      setToast({
        type: "success",
        message:
          added > 0
            ? `${added} asignacion${added !== 1 ? "es" : ""} agregada${added !== 1 ? "s" : ""} al servicio`
            : "El equipo del servicio ya incluía esta programación",
      });
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo aplicar" });
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-navy leading-tight">Programación del equipo</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Al crear el servicio de una fecha, su equipo se asigna automáticamente desde aquí.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto bg-white border border-surface-border rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-navy">
            {formatMonthTitle(month)}
          </span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {month !== today.slice(0, 7) && (
            <button
              onClick={() => setMonth(today.slice(0, 7))}
              className="ml-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {users.length === 0 && !loading && (
        <div className="flex items-center gap-2 text-sm bg-gold/10 border border-gold/30 text-amber-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Aún no hay integrantes registrados.{" "}
            <Link href="/team" className="font-semibold underline underline-offset-2">
              Agrégalos en Equipo
            </Link>{" "}
            para poder asignarlos.
          </span>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center gap-2 text-red-600 text-sm py-10 bg-white rounded-2xl border border-surface-border">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-50 pointer-events-none")}>
            <table className="min-w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-gray-500">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-20 bg-gray-50 text-left font-semibold px-4 py-2 border-b border-r border-surface-border min-w-[150px]"
                  >
                    Fecha
                  </th>
                  {ROSTER_GROUPS.map((g) => (
                    <th
                      key={g.label ?? g.columns[0].role}
                      colSpan={g.label ? g.columns.length : 1}
                      rowSpan={g.label ? 1 : 2}
                      className="bg-gray-50 font-semibold px-3 py-2 border-b border-l border-surface-border"
                    >
                      {g.label ?? g.columns[0].label}
                    </th>
                  ))}
                  <th
                    rowSpan={2}
                    className="bg-gray-50 font-semibold px-3 py-2 border-b border-l border-surface-border"
                  >
                    Servicio
                  </th>
                </tr>
                <tr className="text-xs text-gray-600">
                  {ROSTER_GROUPS.filter((g) => g.label).flatMap((g) =>
                    g.columns.map((c) => (
                      <th
                        key={c.role}
                        className="bg-gray-50 font-medium px-3 py-2 border-b border-l border-surface-border whitespace-nowrap"
                      >
                        {c.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const key = rowKey(row.date, row.serviceType);
                  const service = serviceByRow.get(key);
                  const isPast = row.date < today;
                  const isToday = row.date === today;
                  return (
                    <tr key={key} className={cn("group/row", isPast && "opacity-55")}>
                      <td
                        className={cn(
                          "sticky left-0 z-10 border-b border-r border-surface-border px-4 py-2.5",
                          isToday ? "bg-gold-50" : "bg-white group-hover/row:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn("w-1 h-8 rounded-full shrink-0", TYPE_ACCENT[row.serviceType])} />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                              {formatRowDate(row.date)}
                            </p>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {formatRowService(row.date, row.serviceType)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {ROSTER_COLUMNS.map((col) => {
                        const people = cells.get(`${key}|${col.role}`) ?? [];
                        return (
                          <td
                            key={col.role}
                            className={cn(
                              "border-b border-l border-surface-border p-1 align-middle",
                              isToday ? "bg-gold-50/60" : "group-hover/row:bg-gray-50/60"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setEditing({ row, role: col.role })}
                              className="w-full min-w-[110px] min-h-[42px] rounded-lg px-2 py-1.5 text-left hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20 transition-colors"
                              aria-label={`${getRosterRoleLabel(col.role)} — ${formatRowDate(row.date)}`}
                            >
                              {people.length > 0 ? (
                                <span className="flex flex-wrap gap-1">
                                  {people.map((p) => (
                                    <span
                                      key={p.id}
                                      title={p.user.name}
                                      className="text-xs font-medium text-navy bg-navy/[6%] rounded-md px-1.5 py-0.5 whitespace-nowrap"
                                    >
                                      {shortName(p.user, users)}
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      <td className="border-b border-l border-surface-border px-3 py-2 whitespace-nowrap">
                        {service ? (
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/services/${service.id}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver
                            </Link>
                            <button
                              onClick={() => handleApply(service.id)}
                              disabled={applying === service.id}
                              title="Agregar al servicio las asignaciones de esta fila que le falten"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className={cn("w-3.5 h-3.5", applying === service.id && "animate-spin")} />
                              Aplicar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 px-2">Sin crear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy" />Domingo</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" />Miércoles</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />Sábado - Jóvenes</span>
        <span className="sm:hidden text-gray-400">Desliza la tabla para ver todos los roles →</span>
      </div>

      {editing && (
        <RosterCellModal
          key={`${rowKey(editing.row.date, editing.row.serviceType)}|${editing.role}`}
          open
          title={getRosterRoleLabel(editing.role)}
          subtitle={`${formatRowService(editing.row.date, editing.row.serviceType)} · ${formatRowDate(editing.row.date)}`}
          users={users}
          selectedIds={editingIds}
          onClose={() => setEditing(null)}
          onSave={handleSaveCell}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
