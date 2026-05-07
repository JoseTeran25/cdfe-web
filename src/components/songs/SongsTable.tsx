"use client";
import Link from "next/link";
import { Music2, Pencil, Trash2, Eye } from "lucide-react";
import type { Song, SongStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Props {
  songs: Song[];
  loading: boolean;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}

export function SongsTable({ songs, loading, onEdit, onDelete }: Props) {
  if (loading) return (
    <Card padding="none">
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    </Card>
  );

  if (songs.length === 0) return (
    <Card padding="none">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
          <Music2 className="w-7 h-7 text-navy/30" />
        </div>
        <p className="font-medium text-gray-500">Sin canciones</p>
        <p className="text-xs text-gray-400 mt-1">Agrega la primera canción al repertorio</p>
      </div>
    </Card>
  );

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-navy/[3%]">
              {["Título", "Artista", "Tono", "BPM", "Estado", "Acciones"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-navy/60 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {songs.map((s, i) => (
              <tr key={s.id} className={`border-b border-surface-border last:border-0 hover:bg-surface transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                <td className="px-5 py-3.5 font-semibold text-gray-800">{s.title}</td>
                <td className="px-5 py-3.5 text-gray-500">{s.artist}</td>
                <td className="px-5 py-3.5"><Badge variant="navy" size="sm">{s.key}</Badge></td>
                <td className="px-5 py-3.5 text-gray-500">{s.bpm ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={s.status === "ACTIVA" ? "success" : "pending"} dot size="sm">
                    {s.status === "ACTIVA" ? "Activa" : "Pendiente"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Link href={`/songs/${s.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors" title="Ver detalle">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors" title="Editar">
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
        {songs.length} canción{songs.length !== 1 ? "es" : ""}
      </div>
    </Card>
  );
}
