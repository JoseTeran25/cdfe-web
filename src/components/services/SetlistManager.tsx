"use client";
import { useState } from "react";
import { Plus, Trash2, Music2, GripVertical } from "lucide-react";
import type { Song } from "@/types";
import type { ApiService, ServiceSongItem } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toast, type ToastData } from "@/components/ui/Toast";

interface Props {
  service: ApiService;
  availableSongs: Song[];
  onAddSong: (songId: string) => Promise<void>;
  onRemoveSong: (songId: string) => Promise<void>;
}

export function SetlistManager({ service, availableSongs, onAddSong, onRemoveSong }: Props) {
  const [selectedSongId, setSelectedSongId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleAdd = async () => {
    if (!selectedSongId) return;
    setLoading(true);
    try {
      await onAddSong(selectedSongId);
      setSelectedSongId("");
      setToast({ type: "success", message: "Canción agregada al setlist" });
    } catch (e: any) {
      setToast({ type: "error", message: e.message ?? "Error al agregar canción" });
    } finally { setLoading(false); }
  };

  const handleRemove = async (songId: string) => {
    setLoading(true);
    try {
      await onRemoveSong(songId);
      setToast({ type: "success", message: "Canción eliminada del setlist" });
    } catch (e: any) {
      setToast({ type: "error", message: e.message ?? "Error" });
    } finally { setLoading(false); }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-navy/10 flex items-center justify-center">
          <Music2 className="w-4 h-4 text-navy" />
        </div>
        <h3 className="font-display font-semibold text-navy">
          Setlist <span className="text-gray-400 font-normal text-sm">({service.setlist.length} canciones)</span>
        </h3>
      </div>

      {/* Songs list */}
      <div className="space-y-2 mb-4">
        {service.setlist.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-surface-border rounded-xl">
            El setlist está vacío. Agrega canciones abajo.
          </p>
        ) : (
          service.setlist.map((ss: ServiceSongItem, idx: number) => (
            <div key={ss.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-white group hover:border-navy/20 transition-colors">
              <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
              <span className="w-6 h-6 rounded-full bg-navy/8 text-navy/60 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{ss.song.title}</p>
                <p className="text-xs text-gray-400 truncate">{ss.song.artist}</p>
              </div>
              <Badge variant="navy" size="sm">{ss.song.key}</Badge>
              {ss.song.bpm && <span className="text-xs text-gray-400 hidden sm:block">{ss.song.bpm} BPM</span>}
              <button
                onClick={() => handleRemove(ss.songId)}
                disabled={loading}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add song */}
      {availableSongs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedSongId}
            onChange={e => setSelectedSongId(e.target.value)}
            className="flex-1 text-sm px-3.5 py-2.5 border border-surface-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy/40"
          >
            <option value="">Seleccionar canción para agregar...</option>
            {availableSongs.map(s => (
              <option key={s.id} value={s.id}>{s.title} — {s.artist} ({s.key})</option>
            ))}
          </select>
          <Button variant="primary" size="sm" onClick={handleAdd} loading={loading} disabled={!selectedSongId}
            className="sm:shrink-0">
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        </div>
      )}
      {availableSongs.length === 0 && service.setlist.length > 0 && (
        <p className="text-xs text-gray-400 text-center">Todas las canciones disponibles están en el setlist.</p>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </section>
  );
}
