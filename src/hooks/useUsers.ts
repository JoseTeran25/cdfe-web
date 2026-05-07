"use client";
import { useState, useCallback } from "react";
import { usersApi } from "@/lib/api";
import type { User, CreateUserDto } from "@/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setUsers(await usersApi.getAll() as User[]); }
    finally { setLoading(false); }
  }, []);

  const create = async (data: CreateUserDto) => {
    const u = await usersApi.create(data);
    setUsers(prev => [...prev, u as User]);
    return u as User;
  };

  const update = async (id: string, data: Partial<CreateUserDto>) => {
    const u = await usersApi.update(id, data);
    setUsers(prev => prev.map(x => x.id === id ? (u as User) : x));
    return u as User;
  };

  const remove = async (id: string) => {
    await usersApi.remove(id);
    setUsers(prev => prev.filter(x => x.id !== id));
  };

  return { users, loading, fetch, create, update, remove };
}
