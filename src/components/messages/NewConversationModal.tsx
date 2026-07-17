"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { conversationsApi } from "@/lib/api";
import type { MessageableContact } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenExisting: (conversationId: string) => void;
  onCreate: (contact: MessageableContact, initialMessage: string) => Promise<void>;
}

export function NewConversationModal({ open, onClose, onOpenExisting, onCreate }: Props) {
  const [contacts, setContacts] = useState<MessageableContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<MessageableContact | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPending(null);
    setInitialMessage("");
    setSearch("");
    setError("");
    setLoading(true);
    conversationsApi
      .getContacts()
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = contacts.filter(c =>
    c.contactName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handlePick = (contact: MessageableContact) => {
    if (contact.conversationId) {
      onOpenExisting(contact.conversationId);
      onClose();
      return;
    }
    setPending(contact);
  };

  const handleCreate = async () => {
    if (!pending || !initialMessage.trim()) return;
    setSending(true);
    setError("");
    try {
      await onCreate(pending, initialMessage.trim());
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar la conversación");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={pending ? pending.contactName : "Nueva conversación"} size="md">
      {pending ? (
        <div className="space-y-4">
          <button
            onClick={() => setPending(null)}
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Elegir otro contacto
          </button>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Mensaje inicial</span>
            <textarea
              value={initialMessage}
              onChange={e => setInitialMessage(e.target.value)}
              placeholder={`Escribe el primer mensaje para ${pending.contactName}...`}
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-border rounded-xl bg-white outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10 transition-shadow duration-150 resize-y"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button variant="gold" fullWidth loading={sending} disabled={!initialMessage.trim()} onClick={handleCreate}>
            Enviar y crear conversación
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o número..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-surface-border rounded-xl bg-white outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10 transition-shadow duration-150"
            />
          </div>

          <div className="max-h-80 overflow-y-auto -mx-1 px-1">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="w-6 h-6 text-navy/20 mb-2" />
                <p className="text-xs text-gray-400">Sin contactos que coincidan</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map(c => (
                  <button
                    key={`${c.contactSource}-${c.sourceId}`}
                    onClick={() => handlePick(c)}
                    className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-navy/5 transition-colors text-left"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-full bg-navy flex items-center justify-center text-gold font-display font-bold text-xs">
                      {c.contactName.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{c.contactName}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </div>
                    <Badge variant={c.contactSource === "TEAM" ? "gold" : "navy"} size="sm">
                      {c.contactSource === "TEAM" ? "Equipo" : "Solicitud"}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
