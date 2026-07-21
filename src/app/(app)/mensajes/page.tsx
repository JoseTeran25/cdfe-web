"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { NewConversationModal } from "@/components/messages/NewConversationModal";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Conversation, MessageableContact } from "@/types";

export default function MensajesPage() {
  const { conversations, loading, create, markRead } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const { messages, loading: messagesLoading, sending, send } = useConversationMessages(selectedId);

  const selectedConversation: Conversation | null =
    conversations.find(c => c.id === selectedId) ?? null;

  const handleSelect = (conversation: Conversation) => {
    setSelectedId(conversation.id);
    if (conversation.unreadCount > 0) markRead(conversation.id);
  };

  const handleSend = async (content: string) => {
    try {
      await send(content);
    } catch (e: unknown) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo enviar el mensaje" });
    }
  };

  const handleCreate = async (contact: MessageableContact, initialMessage: string) => {
    const conversation = await create({
      phone: contact.phone,
      contactName: contact.contactName,
      contactSource: contact.contactSource,
      initialMessage,
    });
    setSelectedId(conversation.id);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h2 className="font-display font-bold text-2xl text-navy">Mensajes</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Conversaciones de WhatsApp con solicitudes de &ldquo;No estás solo&rdquo; y el equipo, vía Nexo
        </p>
      </div>

      <div className="h-[calc(100vh-13rem)] min-h-[420px] bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden flex">
        <aside className={cn("w-full sm:w-80 shrink-0 border-r border-surface-border", selectedId && "hidden sm:flex sm:flex-col", !selectedId && "flex flex-col")}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            loading={loading}
            onSelect={handleSelect}
            onNewConversation={() => setNewConversationOpen(true)}
          />
        </aside>

        <div className={cn("flex-1 flex", !selectedId && "hidden sm:flex")}>
          <ChatThread
            conversation={selectedConversation}
            messages={messages}
            loading={messagesLoading}
            sending={sending}
            onSend={handleSend}
            onBack={() => setSelectedId(null)}
          />
        </div>
      </div>

      <NewConversationModal
        open={newConversationOpen}
        onClose={() => setNewConversationOpen(false)}
        onOpenExisting={id => {
          setSelectedId(id);
          markRead(id);
        }}
        onCreate={handleCreate}
      />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
