"use client";
import { MessageCircle, UserPlus } from "lucide-react";
import type { Conversation } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateShort } from "@/lib/utils";

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationList({ conversations, selectedId, loading, onSelect, onNewConversation }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-border shrink-0">
        <h2 className="font-display font-bold text-navy text-base">Mensajes</h2>
        <button
          onClick={onNewConversation}
          className="cursor-pointer p-2 rounded-xl text-navy hover:bg-navy/5 transition-colors"
          title="Nueva conversación"
          aria-label="Nueva conversación"
        >
          <UserPlus className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-navy/30" />
            </div>
            <p className="text-sm font-medium text-gray-500">Sin conversaciones</p>
            <p className="text-xs text-gray-400 mt-1">Inicia una desde &ldquo;Nueva conversación&rdquo;</p>
          </div>
        ) : (
          conversations.map(c => {
            const lastMessage = c.messages?.[0];
            const active = c.id === selectedId;
            const unread = c.unreadCount > 0;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={cn(
                  "cursor-pointer w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-surface-border transition-colors",
                  active ? "bg-navy/5" : "hover:bg-surface"
                )}
              >
                <div className={cn(
                  "w-10 h-10 shrink-0 rounded-full bg-navy flex items-center justify-center text-gold font-display font-bold text-sm",
                  unread && "ring-2 ring-gold ring-offset-2 ring-offset-white"
                )}>
                  {c.contactName.trim().charAt(0).toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm truncate", unread ? "font-bold text-navy" : "font-semibold text-gray-800")}>
                      {c.contactName}
                    </p>
                    {c.lastMessageAt && (
                      <span className={cn("text-[11px] shrink-0", unread ? "text-navy font-semibold" : "text-gray-400")}>
                        {formatDateShort(c.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={c.contactSource === "TEAM" ? "gold" : "navy"} size="sm">
                      {c.contactSource === "TEAM" ? "Equipo" : "Solicitud"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    {lastMessage && (
                      <p className={cn("text-xs truncate", unread ? "text-gray-700 font-medium" : "text-gray-400")}>
                        {lastMessage.direction === "OUTBOUND" ? "Tú: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                    {unread && (
                      <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gold text-navy-950 text-[11px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
