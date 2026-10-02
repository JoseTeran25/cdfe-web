"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RosterServiceRef, User } from "@/types";
import { formatMonthTitle, shiftMonth } from "./rosterConfig";

export function MonthNav({
  month,
  today,
  onChange,
  className,
}: {
  month: string;
  today: string;
  onChange: (month: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 bg-white border border-surface-border rounded-xl p-1 shadow-sm", className)}>
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        className="p-2 rounded-lg text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="flex-1 min-w-[130px] text-center text-sm font-semibold text-navy">{formatMonthTitle(month)}</span>
      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        className="p-2 rounded-lg text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      {month !== today.slice(0, 7) && (
        <button
          onClick={() => onChange(today.slice(0, 7))}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors"
        >
          Hoy
        </button>
      )}
    </div>
  );
}

export function PersonFilter({
  users,
  value,
  counts,
  onChange,
  className,
}: {
  users: User[];
  value: string | null;
  counts: Map<string, number>;
  onChange: (userId: string | null) => void;
  className?: string;
}) {
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name, "es"));
  return (
    <div className={cn("relative", className)}>
      <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Filtrar por integrante"
        className={cn(
          "w-full appearance-none h-10 pl-9 pr-9 rounded-xl border text-sm bg-white outline-none transition-colors",
          "focus:border-navy/40 focus:ring-2 focus:ring-navy/10",
          value ? "border-gold/60 text-navy font-semibold" : "border-surface-border text-gray-600"
        )}
      >
        <option value="">Todos los integrantes</option>
        {sorted.map((u) => {
          const count = counts.get(u.id) ?? 0;
          return (
            <option key={u.id} value={u.id}>
              {u.name}
              {count > 0 ? ` · ${count} día${count !== 1 ? "s" : ""}` : ""}
            </option>
          );
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function ServiceActions({
  service,
  applying,
  onApply,
}: {
  service: RosterServiceRef | undefined;
  applying: string | null;
  onApply: (serviceId: string) => void;
}) {
  if (!service) return <span className="text-xs text-gray-300 px-2 whitespace-nowrap">Sin crear</span>;
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/services/${service.id}`}
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-navy hover:bg-navy/5 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Ver
      </Link>
      <button
        onClick={() => onApply(service.id)}
        disabled={applying === service.id}
        title="Agregar al servicio las asignaciones de esta fecha que le falten"
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-navy/5 hover:text-navy transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn("w-3.5 h-3.5", applying === service.id && "animate-spin")} />
        Aplicar
      </button>
    </div>
  );
}

/** Chip con el nombre corto; resalta en dorado a la persona filtrada. */
export function PersonChip({ name, fullName, highlighted, dimmed, large }: {
  name: string;
  fullName: string;
  highlighted: boolean;
  dimmed: boolean;
  large?: boolean;
}) {
  return (
    <span
      title={fullName}
      className={cn(
        "font-medium rounded-md whitespace-nowrap",
        large ? "text-sm px-2 py-0.5" : "text-xs px-1.5 py-0.5",
        highlighted ? "bg-gold text-navy-950 font-semibold" : dimmed ? "bg-gray-100 text-gray-500" : "bg-navy/[6%] text-navy"
      )}
    >
      {name}
    </span>
  );
}
