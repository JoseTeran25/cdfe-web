import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
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

export function getInstrumentLabel(instrument: string): string {
  const labels: Record<string, string> = {
    GUITARRA: "Guitarra",
    BAJO: "Bajo",
    BATERIA: "Batería",
    TECLADO: "Teclado",
    PIANO: "Piano",
    VIOLIN: "Violín",
    TROMPETA: "Trompeta",
    VOZ_PRINCIPAL: "Voz Principal",
    VOZ_SECUNDARIA: "Voz Secundaria",
    MEDIOS: "Medios",
    OTRO: "Otro",
  };
  return labels[instrument] ?? instrument;
}

export function getServiceTypeLabel(type: string): string {
  return type === "DOMINGO" ? "Domingo" : "Miércoles";
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
