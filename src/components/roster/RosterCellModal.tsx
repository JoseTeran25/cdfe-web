"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn, getInstrumentLabel } from "@/lib/utils";

interface Props {
  open: boolean;
  title: string;
  subtitle: string;
  users: User[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (userIds: string[]) => Promise<void>;
}

export function RosterCellModal({ open, title, subtitle, users, selectedIds, onClose, onSave }: Props) {
  // El padre monta este modal con un `key` por celda, así que el estado inicial basta.
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...users]
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .filter((u) => !q || u.name.toLowerCase().includes(q));
  }, [users, query]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <p className="text-xs text-gray-400 -mt-1 mb-3">{subtitle}</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar integrante..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-surface-border rounded-xl outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No hay integrantes registrados. Agrégalos primero en la sección Equipo.
        </p>
      ) : (
        <ul className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1">
          {filtered.map((u) => {
            const checked = selected.includes(u.id);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => toggle(u.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors",
                    checked ? "bg-navy/5" : "hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-navy border-navy" : "border-gray-300 bg-white"
                    )}
                  >
                    {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-gray-800 truncate">{u.name}</span>
                    {u.instrument && (
                      <span className="block text-[11px] text-gray-400">{getInstrumentLabel(u.instrument)}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">Sin resultados para “{query}”</li>
          )}
        </ul>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          {selected.length} seleccionado{selected.length !== 1 ? "s" : ""}
        </p>
      )}
    </Modal>
  );
}
