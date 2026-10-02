"use client";

import { cn } from "@/lib/utils";
import {
  ROSTER_COLUMNS,
  ROSTER_GROUPS,
  TYPE_ACCENT_CLASS,
  formatRowDate,
  formatRowService,
  getRosterRoleLabel,
  rowKey,
  shortName,
} from "./rosterConfig";
import { PersonChip, ServiceActions } from "./RosterControls";
import type { RosterViewProps } from "./types";

/** Vista de escritorio: la misma grilla que el calendario de Google Sheets. */
export function RosterTable({
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
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full border-separate border-spacing-0", large ? "text-base" : "text-sm")}>
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
            <th rowSpan={2} className="bg-gray-50 font-semibold px-3 py-2 border-b border-l border-surface-border">
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
            const isToday = row.date === today;
            return (
              <tr key={key} className={cn("group/row", row.date < today && "opacity-55")}>
                <td
                  className={cn(
                    "sticky left-0 z-10 border-b border-r border-surface-border px-4",
                    large ? "py-3.5" : "py-2.5",
                    isToday ? "bg-gold-50" : "bg-white group-hover/row:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("w-1 h-8 rounded-full shrink-0", TYPE_ACCENT_CLASS[row.serviceType])} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 tabular-nums whitespace-nowrap">{formatRowDate(row.date)}</p>
                      <p className={cn("text-gray-500 whitespace-nowrap", large ? "text-sm" : "text-xs")}>
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
                        onClick={() => onEditCell(row, col.role)}
                        className={cn(
                          "w-full rounded-lg px-2 py-1.5 text-left hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20 transition-colors",
                          large ? "min-w-[120px] min-h-[52px]" : "min-w-[110px] min-h-[42px]"
                        )}
                        aria-label={`${getRosterRoleLabel(col.role)} — ${formatRowDate(row.date)}`}
                      >
                        {people.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {people.map((p) => (
                              <PersonChip
                                key={p.id}
                                name={shortName(p.user, users)}
                                fullName={p.user.name}
                                highlighted={p.userId === highlightUserId}
                                dimmed={!!highlightUserId && p.userId !== highlightUserId}
                                large={large}
                              />
                            ))}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </button>
                    </td>
                  );
                })}

                <td className="border-b border-l border-surface-border px-2 py-2 whitespace-nowrap">
                  <ServiceActions service={serviceByRow.get(key)} applying={applying} onApply={onApply} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
