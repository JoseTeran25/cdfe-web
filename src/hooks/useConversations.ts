"use client";
import { useState, useCallback, useEffect } from "react";
import { conversationsApi } from "@/lib/api";
import type { Conversation, CreateConversationDto } from "@/types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    const data = await conversationsApi.getAll();
    setConversations(data);
    return data;
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch().finally(() => setLoading(false));

    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  const create = async (dto: CreateConversationDto) => {
    const conversation = await conversationsApi.create(dto);
    await fetch();
    return conversation;
  };

  const markRead = async (id: string) => {
    const updated = await conversationsApi.markRead(id);
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, unreadCount: updated.unreadCount } : c)));
  };

  return { conversations, loading, fetch, create, markRead };
}
