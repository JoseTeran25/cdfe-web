"use client";

import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROSTER_COLUMNS,
  TYPE_ACCENT_CLASS,
  formatRowDate,
  formatRowService,
  getRosterRoleLabel,
  rowKey,
  shortName,
} from "./rosterConfig";
import { PersonChip, ServiceActions } from "./RosterControls";
import type { RosterViewProps } from "./types";

/** Vista de celular: una tarjeta por fecha con solo los roles asignados; "Editar" despliega los 12. */
export function RosterCards({
  rows,
  cells,
  serviceByRow,
  users,
  today,
  highlightUserId,
  applying,
  onEditCell,
  onApply,
  large,
}: RosterViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const key = rowKey(row.date, row.serviceType);
        const isOpen = expanded.has(key);
        const isToday = row.date === today;
        const filled = ROSTER_COLUMNS.filter((c) => (cells.get(`${key}|${c.role}`) ?? []).length > 0);
        const visible = isOpen ? ROSTER_COLUMNS : filled;
        const personRoles = highlightUserId
          ? filled.filter((c) => cells.get(`${key}|${c.role}`)!.some((a) => a.userId === highlightUserId))
          : [];

        return (
          <article
            key={key}
            className={cn(
              "bg-white rounded-2xl border shadow-sm overflow-hidden",
              isToday ? "border-gold/60 ring-1 ring-gold/30" : "border-surface-border",
              row.date < today && "opacity-60"
            )}
          >
            <header className="flex items-center gap-3 pl-3 pr-2 py-3 border-b border-surface-border">
              <span className={cn("w-1 self-stretch rounded-full shrink-0", TYPE_ACCENT_CLASS[row.serviceType])} />
              <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-gray-800 tabular-nums", large && "text-lg")}>
                  {formatRowDate(row.date)}
                  {isToday && (
                    <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-gold/20 rounded-full px-2 py-0.5">
                      Hoy
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{formatRowService(row.date, row.serviceType)}</p>
              </div>
              <ServiceActions service={serviceByRow.get(key)} applying={applying} onApply={onApply} />
            </header>

            {personRoles.length > 0 && (
              <p className="mx-3 mt-3 text-xs font-semibold text-navy-950 bg-gold/25 rounded-lg px-3 py-2">
                Sirve en: {personRoles.map((c) => getRosterRoleLabel(c.role)).join(" · ")}
              </p>
            )}

            {visible.length > 0 ? (
              <ul className="px-3 py-1 divide-y divide-surface-border">
                {visible.map((col) => {
                  const people = cells.get(`${key}|${col.role}`) ?? [];
                  return (
                    <li key={col.role}>
                      <button
                        type="button"
                        onClick={() => onEditCell(row, col.role)}
                        className="w-full flex items-center gap-3 py-2.5 text-left active:bg-navy/5 rounded-lg"
                      >
                        <span className={cn("w-28 shrink-0 text-gray-500", large ? "text-sm" : "text-xs")}>
                          {getRosterRoleLabel(col.role)}
                        </span>
                        <span className="flex-1 flex flex-wrap gap-1 min-w-0">
                          {people.length > 0 ? (
                            people.map((p) => (
                              <PersonChip
                                key={p.id}
                                name={shortName(p.user, users)}
                                fullName={p.user.name}
                                highlighted={p.userId === highlightUserId}
                                dimmed={!!highlightUserId && p.userId !== highlightUserId}
                                large={large}
                              />
                            ))
                          ) : (
                            <span className="text-xs text-gray-300">Sin asignar</span>
                          )}
                        </span>
                        <Pencil className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-gray-400">Sin asignaciones todavía</p>
            )}

            <button
              type="button"
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-navy border-t border-surface-border bg-gray-50/60 active:bg-navy/5"
            >
              {isOpen ? "Mostrar solo asignados" : filled.length > 0 ? "Editar todos los roles" : "Asignar equipo"}
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
            </button>
          </article>
        );
      })}
    </div>
  );
}
