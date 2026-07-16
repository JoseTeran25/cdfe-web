"use client";
import { HeartHandshake, Eye, CheckCircle2 } from "lucide-react";
import type { SupportRequest } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort, getContactMethodLabel } from "@/lib/utils";

interface Props {
  requests: SupportRequest[];
  loading: boolean;
  onView: (request: SupportRequest) => void;
  onToggleContacted: (request: SupportRequest) => void;
}

export function SupportRequestsTable({ requests, loading, onView, onToggleContacted }: Props) {
  if (loading) return (
    <Card padding="none">
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    </Card>
  );

  if (requests.length === 0) return (
    <Card padding="none">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
          <HeartHandshake className="w-7 h-7 text-navy/30" />
        </div>
        <p className="font-medium text-gray-500">Sin solicitudes</p>
        <p className="text-xs text-gray-400 mt-1">
          Las solicitudes de &ldquo;No estás solo&rdquo; aparecerán aquí
        </p>
      </div>
    </Card>
  );

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-navy/[3%]">
              {["Nombre", "Contacto", "Prefiere", "Recibido", "Estado", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-navy/60 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={r.id} className={`border-b border-surface-border last:border-0 hover:bg-surface transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{r.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{r.contact}</td>
                <td className="px-5 py-3.5">
                  <Badge variant="navy" size="sm">{getContactMethodLabel(r.contactMethod)}</Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDateShort(r.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={r.contacted ? "success" : "pending"} dot size="sm">
                    {r.contacted ? "Contactado" : "Pendiente"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors" title="Ver detalle" aria-label="Ver detalle">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleContacted(r)}
                      className={`p-1.5 rounded-lg transition-colors ${r.contacted ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                      title={r.contacted ? "Marcar como pendiente" : "Marcar como contactado"}
                      aria-label={r.contacted ? "Marcar como pendiente" : "Marcar como contactado"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-surface-border text-xs text-gray-400">
        {requests.length} solicitud{requests.length !== 1 ? "es" : ""}
      </div>
    </Card>
  );
}
