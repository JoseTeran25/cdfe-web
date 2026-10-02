import type { RosterAssignment, ServiceType, User } from "@/types";
import { APP_TIMEZONE } from "@/lib/utils";
import {
  ROSTER_COLUMNS,
  ROSTER_GROUPS,
  formatMonthTitle,
  formatRowDate,
  formatRowService,
  rowKey,
  shortName,
  type RosterRow,
} from "./rosterConfig";

type RGB = [number, number, number];

const NAVY: RGB = [0, 31, 63];
const NAVY_SOFT: RGB = [28, 61, 142];
const BORDER: RGB = [226, 230, 236];
const ACCENT: Record<ServiceType, RGB> = {
  DOMINGO: NAVY,
  MIERCOLES: [201, 168, 76],
  JOVENES: [139, 92, 246],
};
const LEGEND: { type: ServiceType; label: string }[] = [
  { type: "DOMINGO", label: "Domingo" },
  { type: "MIERCOLES", label: "Miércoles" },
  { type: "JOVENES", label: "Sábado - Jóvenes" },
];
const EMPTY = "—";

interface Params {
  month: string;
  rows: RosterRow[];
  cells: Map<string, RosterAssignment[]>;
  users: User[];
  /** Si hay filtro por integrante: se titula con su nombre y se resaltan sus celdas. */
  highlight?: { userId: string; name: string };
}

/** Genera y descarga la programación del mes en A4 horizontal. */
export async function exportRosterPdf({ month, rows, cells, users, highlight }: Params) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const DATE_WIDTH = 22;
  const SERVICE_WIDTH = 25;
  const roleWidth = (pageWidth - margin * 2 - DATE_WIDTH - SERVICE_WIDTH) / ROSTER_COLUMNS.length;

  // ── Encabezado ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(
    `Programación del equipo — ${formatMonthTitle(month)}${highlight ? ` · ${highlight.name}` : ""}`,
    margin,
    14
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text("Comunidad de Fe Sur · Ministerio de alabanza", margin, 19.5);

  // Leyenda alineada a la derecha
  let x = pageWidth - margin;
  for (const item of [...LEGEND].reverse()) {
    const width = doc.getTextWidth(item.label);
    x -= width;
    doc.text(item.label, x, 19.5);
    x -= 3.2;
    doc.setFillColor(...ACCENT[item.type]);
    doc.rect(x, 17.2, 2.2, 2.2, "F");
    x -= 5;
  }

  // ── Tabla ──
  const head = [
    [
      { content: "Fecha", rowSpan: 2 },
      { content: "Día / Servicio", rowSpan: 2 },
      ...ROSTER_GROUPS.map((g) =>
        g.label
          ? { content: g.label, colSpan: g.columns.length }
          : { content: g.columns[0].label, rowSpan: 2 }
      ),
    ],
    ROSTER_GROUPS.filter((g) => g.label).flatMap((g) => g.columns.map((c) => c.label)),
  ];

  const highlighted = new Set<string>(); // "fila|columna" donde aparece la persona filtrada
  const body = rows.map((row, r) => {
    const key = rowKey(row.date, row.serviceType);
    return [
      formatRowDate(row.date),
      formatRowService(row.date, row.serviceType),
      ...ROSTER_COLUMNS.map((col, c) => {
        const people = cells.get(`${key}|${col.role}`) ?? [];
        if (highlight && people.some((a) => a.userId === highlight.userId)) highlighted.add(`${r}|${c + 2}`);
        return people.map((a) => shortName(a.user, users)).join(", ") || EMPTY;
      }),
    ];
  });

  autoTable(doc, {
    startY: 24,
    head,
    body,
    theme: "grid",
    margin: { left: margin, right: margin, bottom: 12 },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 1.8,
      valign: "middle",
      halign: "center",
      lineColor: BORDER,
      lineWidth: 0.2,
      textColor: [40, 40, 40],
    },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: DATE_WIDTH, cellPadding: { top: 1.8, bottom: 1.8, left: 3.6, right: 1.8 } },
      1: { halign: "left", cellWidth: SERVICE_WIDTH, textColor: [90, 90, 90] },
      // Columnas de rol con el mismo ancho, como en la hoja original
      ...Object.fromEntries(ROSTER_COLUMNS.map((_, i) => [i + 2, { cellWidth: roleWidth }])),
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.row.index === 1) data.cell.styles.fillColor = NAVY_SOFT;
      if (data.section === "body" && data.cell.raw === EMPTY) data.cell.styles.textColor = [200, 200, 200];
      if (data.section === "body" && highlighted.has(`${data.row.index}|${data.column.index}`)) {
        data.cell.styles.fillColor = [250, 240, 200];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = NAVY;
      }
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 0) return;
      doc.setFillColor(...ACCENT[rows[data.row.index].serviceType]);
      doc.rect(data.cell.x + 1, data.cell.y + 1.2, 1, data.cell.height - 2.4, "F");
    },
    didDrawPage: () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      const generated = new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: APP_TIMEZONE,
      });
      doc.text(`Generado el ${generated}`, margin, pageHeight - 6);
      doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 6, { align: "right" });
    },
  });

  doc.save(`programacion-${month}.pdf`);
}
