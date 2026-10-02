import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Toda la app muestra y captura horas en hora de Ecuador, sin importar dónde esté el navegador. */
export const APP_TIMEZONE = "America/Guayaquil";
const APP_UTC_OFFSET = "-05:00"; // Ecuador continental no tiene horario de verano

function zonedParts(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: APP_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
}

/** Instante ISO → valor "YYYY-MM-DDTHH:mm" en hora de Ecuador, para un <input type="datetime-local">. */
export function toEcuadorInputValue(iso: string): string {
  const p = zonedParts(new Date(iso));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Valor "YYYY-MM-DDTHH:mm" interpretado como hora de Ecuador → instante ISO (UTC). */
export function fromEcuadorInputValue(value: string): string {
  return new Date(`${value}:00${APP_UTC_OFFSET}`).toISOString();
}

/** Fecha calendario YYYY-MM-DD en Ecuador. */
export function toEcuadorDateKey(date: Date): string {
  const p = zonedParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
    timeZone: APP_TIMEZONE,
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    timeZone: APP_TIMEZONE,
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIMEZONE,
  });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrador",
    DIRECTOR: "Director",
    MUSICO: "Músico",
    VOCALISTA: "Vocalista",
    MULTIMEDIA: "Multimedia",
  };
  return labels[role] ?? role;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  GUITARRA: "Guitarra",
  GUITARRA_ELECTRICA: "Guitarra eléctrica",
  GUITARRA_ACUSTICA: "Guitarra acústica",
  BAJO: "Bajo",
  BATERIA: "Batería",
  TECLADO: "Teclado",
  PIANO: "Piano",
  VIOLIN: "Violín",
  TROMPETA: "Trompeta",
  VOZ_PRINCIPAL: "Voz Principal",
  VOZ_SECUNDARIA: "Voz Secundaria",
  VOZ_HOMBRE: "Voz (hombres)",
  VOZ_MUJER: "Voz (mujeres)",
  MEDIOS: "Medios",
  SONIDO: "Multimedia - Sonido",
  LETRAS: "Multimedia - Letras",
  APOYO_MULTIMEDIA: "Multimedia - Apoyo",
  ORACION: "Oración",
  OTRO: "Otro",
};

export const INSTRUMENT_OPTIONS = Object.entries(INSTRUMENT_LABELS).map(([value, label]) => ({ value, label }));

export function getInstrumentLabel(instrument: string): string {
  return INSTRUMENT_LABELS[instrument] ?? instrument;
}

export function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DOMINGO: "Domingo",
    MIERCOLES: "Miércoles",
    JOVENES: "Jóvenes",
  };
  return labels[type] ?? type;
}

export function getServiceTypeBadgeVariant(
  type: string
): "navy" | "gold" | "pending" {
  if (type === "DOMINGO") return "navy";
  if (type === "MIERCOLES") return "gold";
  return "pending";
}

export function getContactMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    WHATSAPP: "WhatsApp",
    LLAMADA: "Llamada",
    MENSAJE_TEXTO: "Mensaje de texto",
  };
  return labels[method] ?? method;
}

/** Extrae el video ID de un link de YouTube (watch, youtu.be, embed, shorts). null si no es de YouTube. */
export function getYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");

    if (host === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (host === "youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function getDaysUntil(dateString: string): number {
  const toUtcDay = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const today = toUtcDay(toEcuadorDateKey(new Date()));
  const target = toUtcDay(toEcuadorDateKey(new Date(dateString)));
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}
