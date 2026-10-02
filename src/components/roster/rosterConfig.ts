import type { RosterRole, ServiceType, User } from "@/types";
import { toEcuadorDateKey } from "@/lib/utils";

export interface RosterColumn {
  role: RosterRole;
  label: string;
}

export interface RosterColumnGroup {
  label: string | null;
  columns: RosterColumn[];
}

/** Mismo orden de columnas que el calendario de Google Sheets del ministerio. */
export const ROSTER_GROUPS: RosterColumnGroup[] = [
  {
    label: "Banda",
    columns: [
      { role: "BATERIA", label: "Batería" },
      { role: "BAJO", label: "Bajo" },
      { role: "GUITARRA_ELECTRICA", label: "Guitarra eléctrica" },
      { role: "GUITARRA_ACUSTICA_1", label: "Guitarra acústica 1" },
      { role: "GUITARRA_ACUSTICA_2", label: "Guitarra acústica 2" },
      { role: "PIANO", label: "Piano" },
    ],
  },
  {
    label: "Voces",
    columns: [
      { role: "VOCES_HOMBRES", label: "Hombres" },
      { role: "VOCES_MUJERES", label: "Mujeres" },
    ],
  },
  {
    label: "Multimedia",
    columns: [
      { role: "SONIDO", label: "Sonido" },
      { role: "LETRAS", label: "Letras" },
      { role: "APOYO_MULTIMEDIA", label: "Apoyo" },
    ],
  },
  { label: null, columns: [{ role: "ORACION", label: "Oración" }] },
];

export const ROSTER_COLUMNS = ROSTER_GROUPS.flatMap((g) => g.columns);

export function getRosterRoleLabel(role: RosterRole): string {
  const group = ROSTER_GROUPS.find((g) => g.columns.some((c) => c.role === role));
  const column = ROSTER_COLUMNS.find((c) => c.role === role);
  if (!column) return role;
  return group?.label && group.label !== "Banda" ? `${group.label} · ${column.label}` : column.label;
}

export interface RosterRow {
  date: string; // YYYY-MM-DD
  serviceType: ServiceType;
}

// Día de la semana (UTC, sin desfase porque la fecha es calendario puro) → servicio recurrente
const RECURRING: Record<number, ServiceType> = { 3: "MIERCOLES", 6: "JOVENES", 0: "DOMINGO" };
const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const SERVICE_LABELS: Record<ServiceType, string> = {
  DOMINGO: "Domingo",
  MIERCOLES: "Miércoles",
  JOVENES: "Jóvenes",
};

export const rowKey = (date: string, type: ServiceType) => `${date}|${type}`;

function parseKey(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Filas del mes: cada miércoles, sábado (Jóvenes) y domingo, más cualquier fecha extra con datos. */
export function buildRows(month: string, extra: RosterRow[]): RosterRow[] {
  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const rows = new Map<string, RosterRow>();

  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(Date.UTC(year, m - 1, day)).getUTCDay();
    const type = RECURRING[weekday];
    if (!type) continue;
    const date = `${month}-${String(day).padStart(2, "0")}`;
    rows.set(rowKey(date, type), { date, serviceType: type });
  }
  for (const r of extra) {
    if (r.date.startsWith(month)) rows.set(rowKey(r.date, r.serviceType), r);
  }

  return [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function formatRowDate(date: string): string {
  const d = parseKey(date);
  return `${String(d.getUTCDate()).padStart(2, "0")}-${MONTHS_SHORT[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}

export function formatRowService(date: string, type: ServiceType): string {
  const weekday = WEEKDAYS[parseKey(date).getUTCDay()];
  const label = SERVICE_LABELS[type];
  return weekday === label ? weekday : `${weekday} - ${label}`;
}

export function todayKey(): string {
  return toEcuadorDateKey(new Date());
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthTitle(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const name = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

/** Primer nombre, como en el calendario; agrega la inicial del apellido si se repite. */
export function shortName(user: { id: string; name: string }, users: User[]): string {
  const [first, ...rest] = user.name.trim().split(/\s+/);
  const clash = users.some((u) => u.id !== user.id && u.name.trim().split(/\s+/)[0] === first);
  return clash && rest.length ? `${first} ${rest[0][0]}.` : first;
}

export const TYPE_ACCENT_CLASS: Record<ServiceType, string> = {
  DOMINGO: "bg-navy",
  MIERCOLES: "bg-gold",
  JOVENES: "bg-violet-500",
};
