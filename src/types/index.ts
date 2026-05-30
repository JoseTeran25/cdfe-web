// ============================================================
// CdFe App — Interfaces TypeScript
// ============================================================

export type Role = "ADMIN" | "DIRECTOR" | "MUSICO" | "VOCALISTA";

export type SongStatus = "ACTIVA" | "PENDIENTE";

export type SongCategory = "ALABANZA" | "ADORACION";

export type ServiceType = "DOMINGO" | "MIERCOLES";

export type Instrument =
  | "GUITARRA"
  | "BAJO"
  | "BATERIA"
  | "TECLADO"
  | "PIANO"
  | "VIOLIN"
  | "TROMPETA"
  | "VOZ_PRINCIPAL"
  | "VOZ_SECUNDARIA"
  | "OTRO";

// ---- Modelos Base ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  instrument?: Instrument;
  createdAt: string;
  updatedAt: string;
}

export interface TrackItem {
  name: string;
  url: string;
  type: "click" | "guide" | "full" | "stems";
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string; // tono: e.g. "Am", "G", "C#"
  lyrics?: string; // Markdown / ChordPro
  bpm?: number;
  status: SongStatus;
  category?: SongCategory;
  sequenceUrl?: TrackItem[]; // JSON con tracks
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserService {
  id: string;
  userId: string;
  serviceId: string;
  instrument: Instrument;
  user?: User;
}

export interface Service {
  id: string;
  date: string; // ISO date
  type: ServiceType;
  title?: string; // e.g. "Servicio Domingo Mañana"
  notes?: string;
  setlist: Song[];
  team: UserService[];
  createdAt: string;
  updatedAt: string;
}

// ---- DTOs / Payloads ----

export interface CreateSongDto {
  title: string;
  artist: string;
  key: string;
  lyrics?: string;
  bpm?: number;
  status?: SongStatus;
  category?: SongCategory;
  sequenceUrl?: TrackItem[];
  tags?: string[];
}

export interface CreateServiceDto {
  date: string;
  type: ServiceType;
  title?: string;
  notes?: string;
  songIds?: string[];
  team?: { userId: string; instrument: Instrument }[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: Role;
  instrument?: Instrument;
  avatarUrl?: string;
}

// ---- Dashboard ----

export interface DashboardStats {
  totalSongs: number;
  activeSongs: number;
  pendingSongs: number;
  totalMembers: number;
  nextService?: Service;
  songsToLearn: Song[];
}
