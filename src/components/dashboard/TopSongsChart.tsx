"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTopSongs } from "@/hooks/useTopSongs";
import type { ServiceType } from "@/types";
import {
  Music2,
  TrendingUp,
  Filter,
  AlertCircle,
  ChevronDown,
  BarChart3,
  BarChartHorizontal,
} from "lucide-react";

type Orientation = "vertical" | "horizontal";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "DOMINGO", label: "Domingo" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JOVENES", label: "Jóvenes" },
];

const BAR_FILL = "#4F46E5"; // indigo-600 — hue sequential, magnitude ya la codifica la altura
const BAR_FILL_TOP = "#3730A3"; // indigo-800 — acento para el puesto #1

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  payload: { artist: string; fullTitle: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800">{data.fullTitle}</p>
      <p className="text-gray-500 text-xs mt-0.5">{data.artist}</p>
      <p className="mt-2 font-bold text-indigo-600">
        {value} {value === 1 ? "vez" : "veces"}
      </p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex items-end gap-3 h-64 px-2 pb-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t-lg"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}

// ── Filter Button ─────────────────────────────────────────────────────────────

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TopSongsChart() {
  const [year, setYear] = useState<number | undefined>(CURRENT_YEAR);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [serviceType, setServiceType] = useState<ServiceType | undefined>(
    undefined
  );
  const [orientation, setOrientation] = useState<Orientation>("vertical");

  const { data, loading, error } = useTopSongs({ year, month, serviceType });

  const handleYearChange = (y: number | undefined) => {
    setYear(y);
    if (y === undefined) setMonth(undefined);
  };

  // Transform data for Recharts — más espacio disponible por etiqueta en horizontal
  const maxTitleLength = orientation === "horizontal" ? 22 : 14;
  const chartData = data.map((item) => ({
    title:
      item.song.title.length > maxTitleLength
        ? item.song.title.slice(0, maxTitleLength) + "…"
        : item.song.title,
    fullTitle: item.song.title,
    artist: item.song.artist,
    count: item.count,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in-up stagger-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-sm leading-tight">
              Canciones más tocadas
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Top 10 en servicios</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Orientation toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setOrientation("vertical")}
              title="Barras verticales"
              className={`p-1.5 rounded-md transition-all duration-150 ${
                orientation === "vertical"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOrientation("horizontal")}
              title="Barras horizontales"
              className={`p-1.5 rounded-md transition-all duration-150 ${
                orientation === "horizontal"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BarChartHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-gray-200" />

          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />

          {/* Year filter */}
          <div className="flex items-center gap-1">
            <FilterBtn active={year === undefined} onClick={() => handleYearChange(undefined)}>
              Todos
            </FilterBtn>
            {YEARS.map((y) => (
              <FilterBtn key={y} active={year === y} onClick={() => handleYearChange(y)}>
                {y}
              </FilterBtn>
            ))}
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Month filter */}
          <div className="relative">
            <select
              value={month ?? ""}
              disabled={year === undefined}
              onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed outline-none cursor-pointer hover:bg-gray-200 transition-colors duration-150"
            >
              <option value="">Todos los meses</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Service type filter */}
          <div className="flex items-center gap-1">
            <FilterBtn
              active={serviceType === undefined}
              onClick={() => setServiceType(undefined)}
            >
              Todos
            </FilterBtn>
            {SERVICE_TYPE_OPTIONS.map((opt) => (
              <FilterBtn
                key={opt.value}
                active={serviceType === opt.value}
                onClick={() => setServiceType(opt.value)}
              >
                {opt.label}
              </FilterBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 text-sm py-6 justify-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sin datos para este filtro</p>
            <p className="text-xs text-gray-400 mt-1">
              No hay canciones en servicios
              {year ? ` del ${month ? `${MONTHS.find((m) => m.value === month)?.label} de ` : ""}${year}` : ""}
              {serviceType ? ` (${SERVICE_TYPE_OPTIONS.find((o) => o.value === serviceType)?.label})` : ""}.
            </p>
          </div>
        </div>
      ) : orientation === "horizontal" ? (
        <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 42)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={140}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28} isAnimationActive={true} animationDuration={600}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? BAR_FILL_TOP : BAR_FILL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="title"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              allowDecimals={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={600}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? BAR_FILL_TOP : BAR_FILL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
