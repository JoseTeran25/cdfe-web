"use client";

import { X } from "lucide-react";

export function RosterPersonSummary({
  name,
  days,
  monthTitle,
  onClear,
}: {
  name: string;
  days: number;
  monthTitle: string;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gold/10 border border-gold/30 rounded-xl px-4 py-2.5 text-sm text-gray-700">
      <p>
        <span className="font-semibold text-navy">{name}</span>{" "}
        {days > 0 ? (
          <>
            sirve <span className="font-semibold text-navy">{days}</span> día{days !== 1 ? "s" : ""} en {monthTitle}
          </>
        ) : (
          <>no tiene servicios programados en {monthTitle}</>
        )}
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-900 px-2 py-1 rounded-lg hover:bg-gold/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Quitar filtro
      </button>
    </div>
  );
}
