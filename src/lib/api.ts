import type { Song, User, Service, CreateSongDto, CreateUserDto, CreateServiceDto, SongStatus, ServiceType, Instrument, SupportRequest, CreateSupportRequestDto, Conversation, Message, MessageableContact, CreateConversationDto } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface ServiceSongItem { id: string; order: number; songId: string; song: Song; }
export interface UserServiceItem { id: string; userId: string; instrument: Instrument; user: User; }
export interface ApiService extends Omit<Service, 'setlist' | 'team'> {
  setlist: ServiceSongItem[];
  team: UserServiceItem[];
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface TopPlayedSong {
  song: Song;
  count: number;
}

export const songsApi = {
  getAll: (p?: { status?: SongStatus; search?: string }) => {
    const qs = new URLSearchParams();
    if (p?.status) qs.set('status', p.status);
    if (p?.search) qs.set('search', p.search);
    const q = qs.toString();
    return http<Song[]>(`/songs${q ? `?${q}` : ''}`);
  },
  getOne: (id: string) => http<Song>(`/songs/${id}`),
  create: (d: CreateSongDto) => http<Song>('/songs', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<CreateSongDto>) => http<Song>(`/songs/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  remove: (id: string) => http<{ message: string }>(`/songs/${id}`, { method: 'DELETE' }),
  getTopPlayed: (p?: { year?: number; serviceType?: ServiceType; limit?: number }) => {
    const qs = new URLSearchParams();
    if (p?.year) qs.set('year', String(p.year));
    if (p?.serviceType) qs.set('serviceType', p.serviceType);
    if (p?.limit) qs.set('limit', String(p.limit));
    const q = qs.toString();
    return http<TopPlayedSong[]>(`/songs/top-played${q ? `?${q}` : ''}`);
  },
};

export const usersApi = {
  getAll: () => http<User[]>('/users'),
  create: (d: CreateUserDto) => http<User>('/users', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<CreateUserDto>) => http<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  remove: (id: string) => http<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

export const filesApi = {
  uploadAudio: async (file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/files/audio`, { method: 'POST', body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Error ${res.status}`);
    }
    return res.json();
  },
};

export const supportRequestsApi = {
  create: (d: CreateSupportRequestDto) =>
    http<SupportRequest>('/support-requests', { method: 'POST', body: JSON.stringify(d) }),
  getAll: () => http<SupportRequest[]>('/support-requests'),
  setContacted: (id: string, contacted: boolean) =>
    http<SupportRequest>(`/support-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ contacted }) }),
  remove: (id: string) => http<{ message: string }>(`/support-requests/${id}`, { method: 'DELETE' }),
};

export const conversationsApi = {
  getAll: () => http<Conversation[]>('/conversations'),
  getContacts: () => http<MessageableContact[]>('/conversations/contacts'),
  getMessages: (id: string) => http<Message[]>(`/conversations/${id}/messages`),
  create: (d: CreateConversationDto) =>
    http<Conversation>('/conversations', { method: 'POST', body: JSON.stringify(d) }),
  sendMessage: (id: string, content: string) =>
    http<Message>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  markRead: (id: string) => http<Conversation>(`/conversations/${id}/read`, { method: 'PATCH' }),
};

export const servicesApi = {
  getAll: () => http<ApiService[]>('/services'),
  getOne: (id: string) => http<ApiService>(`/services/${id}`),
  getNext: () => http<ApiService | null>('/services/next'),
  create: (d: CreateServiceDto) => http<ApiService>('/services', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: Partial<CreateServiceDto>) => http<ApiService>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  remove: (id: string) => http<{ message: string }>(`/services/${id}`, { method: 'DELETE' }),
  addSong: (sid: string, songId: string, order?: number) =>
    http<ApiService>(`/services/${sid}/setlist`, { method: 'POST', body: JSON.stringify({ songId, order }) }),
  removeSong: (sid: string, songId: string) =>
    http<ApiService>(`/services/${sid}/setlist/${songId}`, { method: 'DELETE' }),
  addMember: (sid: string, userId: string, instrument: Instrument) =>
    http<ApiService>(`/services/${sid}/team`, { method: 'POST', body: JSON.stringify({ userId, instrument }) }),
  removeMember: (sid: string, userId: string) =>
    http<ApiService>(`/services/${sid}/team/${userId}`, { method: 'DELETE' }),
};
