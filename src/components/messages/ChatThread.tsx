"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, CheckCheck, Clock, MessageCircle, Send } from "lucide-react";
import type { Conversation, Message, MessageStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  onSend: (content: string) => Promise<unknown>;
  onBack: () => void;
}

const STATUS_ICON: Record<MessageStatus, React.ElementType> = {
  PENDING: Clock,
  SENT: Check,
  DELIVERED: CheckCheck,
  READ: CheckCheck,
  FAILED: AlertCircle,
};

function StatusIcon({ status }: { status: MessageStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <Icon
      className={cn(
        "w-3.5 h-3.5",
        status === "READ" ? "text-gold" : status === "FAILED" ? "text-red-300" : "text-white/60"
      )}
    />
  );
}

export function ChatThread({ conversation, messages, loading, sending, onSend, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation?.id]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    await onSend(content);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
          <MessageCircle className="w-7 h-7 text-navy/30" />
        </div>
        <p className="font-medium text-gray-500">Selecciona una conversación</p>
        <p className="text-xs text-gray-400 mt-1">O inicia una nueva desde &ldquo;Nueva conversación&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border shrink-0">
        <button
          onClick={onBack}
          className="cursor-pointer sm:hidden p-1.5 -ml-1 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-gold font-display font-bold text-sm shrink-0">
          {conversation.contactName.trim().charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{conversation.contactName}</p>
          <p className="text-xs text-gray-400">{conversation.phone}</p>
        </div>
        <Badge variant={conversation.contactSource === "TEAM" ? "gold" : "navy"} size="sm" className="ml-auto">
          {conversation.contactSource === "TEAM" ? "Equipo" : "Solicitud"}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-10">Aún no hay mensajes en esta conversación.</p>
        ) : (
          messages.map(m => {
            const outbound = m.direction === "OUTBOUND";
            return (
              <div key={m.id} className={cn("flex", outbound ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    outbound
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-surface-border rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <div className={cn("flex items-center gap-1 mt-1", outbound ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", outbound ? "text-white/60" : "text-gray-400")}>
                      {new Date(m.createdAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {outbound && <StatusIcon status={m.status} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-surface-border shrink-0">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 resize-none px-3.5 py-2.5 text-sm border border-surface-border rounded-xl bg-white outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10 transition-shadow duration-150 max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className={cn(
            "cursor-pointer shrink-0 p-2.5 rounded-xl transition-colors duration-150",
            draft.trim() && !sending
              ? "bg-navy text-white hover:bg-navy-800"
              : "bg-navy/10 text-navy/30 cursor-not-allowed"
          )}
          aria-label="Enviar mensaje"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
