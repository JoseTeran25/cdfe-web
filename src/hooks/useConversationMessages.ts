"use client";
import { useState, useCallback, useEffect } from "react";
import { conversationsApi } from "@/lib/api";
import type { Message } from "@/types";

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetch = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessages(await conversationsApi.getMessages(conversationId));
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    fetch().finally(() => setLoading(false));

    if (!conversationId) return;
    const interval = setInterval(fetch, 4000);
    return () => clearInterval(interval);
  }, [conversationId, fetch]);

  const send = async (content: string) => {
    if (!conversationId) return;
    setSending(true);
    try {
      const message = await conversationsApi.sendMessage(conversationId, content);
      setMessages(prev => [...prev, message]);
      return message;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, send, refetch: fetch };
}
