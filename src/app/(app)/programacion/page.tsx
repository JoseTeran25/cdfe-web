"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, AlertCircle, FileDown, Maximize2 } from "lucide-react";
import { useRoster } from "@/hooks/useRoster";
import { useUsers } from "@/hooks/useUsers";
import { rosterApi } from "@/lib/api";
import type { RosterRole } from "@/types";
import { Toast, type ToastData } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { RosterCellModal } from "@/components/roster/RosterCellModal";
import { RosterTable } from "@/components/roster/RosterTable";
import { RosterCards } from "@/components/roster/RosterCards";
import { RosterFullscreen } from "@/components/roster/RosterFullscreen";
import { RosterPersonSummary } from "@/components/roster/RosterPersonSummary";
import { MonthNav, PersonFilter } from "@/components/roster/RosterControls";
import { exportRosterPdf } from "@/components/roster/exportRosterPdf";
import type { RosterViewProps } from "@/components/roster/types";
import {
  buildRows,
  formatMonthTitle,
  formatRowDate,
  formatRowService,
  getRosterRoleLabel,
  rowKey,
  todayKey,
  type RosterRow,
} from "@/components/roster/rosterConfig";

const PERSON_FILTER_KEY = "cdfe_roster_person";

export default function ProgramacionPage() {
  const [month, setMonth] = useState(() => todayKey().slice(0, 7));
  const { assignments, services, loading, error, setCell } = useRoster(month);
  const { users, fetch: fetchUsers } = useUsers();
  const [editing, setEditing] = useState<{ row: RosterRow; role: RosterRole } | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // El filtro se recuerda por dispositivo: cada integrante suele buscarse a sí mismo
  useEffect(() => {
    if (users.length === 0) return;
    try {
      const saved = localStorage.getItem(PERSON_FILTER_KEY);
      if (saved && users.some((u) => u.id === saved)) setPersonId(saved);
    } catch {
      // sin almacenamiento disponible
    }
  }, [users]);

  const changePerson = (id: string | null) => {
    setPersonId(id);
    try {
      if (id) localStorage.setItem(PERSON_FILTER_KEY, id);
      else localStorage.removeItem(PERSON_FILTER_KEY);
    } catch {
      // sin almacenamiento disponible
    }
  };

  const cells = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const key = `${rowKey(a.date, a.serviceType)}|${a.role}`;
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [assignments]);

  const serviceByRow = useMemo(() => new Map(services.map((s) => [rowKey(s.date, s.type), s])), [services]);

  const rows = useMemo(
    () =>
      buildRows(month, [
        ...assignments.map((a) => ({ date: a.date, serviceType: a.serviceType })),
        ...services.map((s) => ({ date: s.date, serviceType: s.type })),
      ]),
    [month, assignments, services]
  );

  // Días distintos (fecha + servicio) en que sirve cada persona este mes
  const dayCounts = useMemo(() => {
    const days = new Map<string, Set<string>>();
    for (const a of assignments) {
      const set = days.get(a.userId) ?? new Set<string>();
      set.add(rowKey(a.date, a.serviceType));
      days.set(a.userId, set);
    }
    return new Map([...days].map(([id, set]) => [id, set.size]));
  }, [assignments]);

  const visibleRows = useMemo(() => {
    if (!personId) return rows;
    return rows.filter((r) =>
      assignments.some((a) => a.userId === personId && a.date === r.date && a.serviceType === r.serviceType)
    );
  }, [rows, assignments, personId]);

  const person = users.find((u) => u.id === personId) ?? null;
  const today = todayKey();

  const editingIds = useMemo(() => {
    if (!editing) return [];
    const key = `${rowKey(editing.row.date, editing.row.serviceType)}|${editing.role}`;
    return (cells.get(key) ?? []).map((a) => a.userId);
  }, [editing, cells]);

  const handleSaveCell = async (userIds: string[]) => {
    if (!editing) return;
    try {
      await setCell(editing.row.date, editing.row.serviceType, editing.role, userIds);
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo guardar" });
      throw e;
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRosterPdf({
        month,
        rows: visibleRows,
        cells,
        users,
        highlight: person ? { userId: person.id, name: person.name } : undefined,
      });
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo generar el PDF" });
    } finally {
      setExporting(false);
    }
  };

  const handleApply = async (serviceId: string) => {
    setApplying(serviceId);
    try {
      const { added } = await rosterApi.applyToService(serviceId);
      setToast({
        type: "success",
        message:
          added > 0
            ? `${added} asignacion${added !== 1 ? "es" : ""} agregada${added !== 1 ? "s" : ""} al servicio`
            : "El equipo del servicio ya incluía esta programación",
      });
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "No se pudo aplicar" });
    } finally {
      setApplying(null);
    }
  };

  const viewProps: RosterViewProps = {
    rows: visibleRows,
    cells,
    serviceByRow,
    users,
    today,
    highlightUserId: personId,
    applying,
    onEditCell: (row, role) => setEditing({ row, role }),
    onApply: handleApply,
  };

  const monthNav = <MonthNav month={month} today={today} onChange={setMonth} className="w-full sm:w-auto" />;
  const personFilter = (
    <PersonFilter
      users={users}
      value={personId}
      counts={dayCounts}
      onChange={changePerson}
      className="w-full sm:w-64"
    />
  );
  const summary = person && (
    <RosterPersonSummary
      name={person.name}
      days={dayCounts.get(person.id) ?? 0}
      monthTitle={formatMonthTitle(month)}
      onClear={() => changePerson(null)}
    />
  );

  /** Tabla en pantallas medianas/grandes, tarjetas en celular. */
  const renderRoster = (large: boolean) =>
    visibleRows.length === 0 ? null : (
      <>
        <div className="hidden md:block bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <RosterTable {...viewProps} large={large} />
        </div>
        <div className="md:hidden">
          <RosterCards {...viewProps} large={large} />
        </div>
      </>
    );

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
          <CalendarRange className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-navy leading-tight">Programación del equipo</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Al crear el servicio de una fecha, su equipo se asigna automáticamente desde aquí.
          </p>
        </div>
      </div>

      {/* Herramientas: se apilan en celular */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        {monthNav}
        {personFilter}
        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFullscreen(true)}
            id="roster-fullscreen"
            className="flex-1 sm:flex-none h-10"
          >
            <Maximize2 className="w-4 h-4" />
            Pantalla completa
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            loading={exporting}
            disabled={loading || visibleRows.length === 0}
            id="export-roster-pdf"
            className="flex-1 sm:flex-none h-10"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {users.length === 0 && !loading && (
        <div className="flex items-center gap-2 text-sm bg-gold/10 border border-gold/30 text-amber-800 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Aún no hay integrantes registrados.{" "}
            <Link href="/team" className="font-semibold underline underline-offset-2">
              Agrégalos en Equipo
            </Link>{" "}
            para poder asignarlos.
          </span>
        </div>
      )}

      {summary}

      {error ? (
        <div className="flex items-center justify-center gap-2 text-red-600 text-sm py-10 bg-white rounded-2xl border border-surface-border">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      ) : (
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {renderRoster(false)}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-navy" />Domingo</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" />Miércoles</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />Sábado - Jóvenes</span>
      </div>

      {fullscreen && (
        <RosterFullscreen
          onClose={() => setFullscreen(false)}
          controls={
            <>
              {monthNav}
              {personFilter}
            </>
          }
        >
          <div className="space-y-3 max-w-[1800px] mx-auto">
            {summary}
            {renderRoster(true)}
          </div>
        </RosterFullscreen>
      )}

      {editing && (
        <RosterCellModal
          key={`${rowKey(editing.row.date, editing.row.serviceType)}|${editing.role}`}
          open
          title={getRosterRoleLabel(editing.role)}
          subtitle={`${formatRowService(editing.row.date, editing.row.serviceType)} · ${formatRowDate(editing.row.date)}`}
          users={users}
          selectedIds={editingIds}
          onClose={() => setEditing(null)}
          onSave={handleSaveCell}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
