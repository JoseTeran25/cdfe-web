// ============================================================
// CdFe App — Interfaces TypeScript
// ============================================================

export type Role = "ADMIN" | "DIRECTOR" | "MUSICO" | "VOCALISTA" | "MULTIMEDIA";

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
  | "MEDIOS"
  | "OTRO";

// ---- Modelos Base ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  instrument?: Instrument;
  phone?: string;
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
  referenceUrl?: string; // Link de referencia: YouTube, Drive, etc.
  notes?: string;
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
  referenceUrl?: string | null;
  notes?: string | null;
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
  phone?: string;
}

// ---- No estás solo (landing de acompañamiento) ----

export type ContactMethod = "WHATSAPP" | "LLAMADA" | "MENSAJE_TEXTO";

export interface SupportRequest {
  id: string;
  name: string;
  contact: string;
  contactMethod: ContactMethod;
  situation?: string;
  consent: boolean;
  contacted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportRequestDto {
  name: string;
  contact: string;
  contactMethod: ContactMethod;
  situation?: string;
  consent: boolean;
}

// ---- WhatsApp (Nexo) ----

export type ContactSource = "SUPPORT_REQUEST" | "TEAM";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface Conversation {
  id: string;
  phone: string;
  lid?: string;
  contactName: string;
  contactSource: ContactSource;
  lastMessageAt?: string;
  unreadCount: number;
  messages?: Message[]; // último mensaje, cuando viene incluido en el listado
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  content: string;
  status: MessageStatus;
  externalId?: string;
  createdAt: string;
}

export interface MessageableContact {
  contactName: string;
  phone: string;
  contactSource: ContactSource;
  sourceId: string;
  conversationId: string | null;
}

export interface CreateConversationDto {
  phone: string;
  contactName: string;
  contactSource: ContactSource;
  initialMessage?: string;
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
