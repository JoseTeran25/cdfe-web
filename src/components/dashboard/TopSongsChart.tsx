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
import { Music2, TrendingUp, Filter, AlertCircle } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

const BAR_COLORS = [
  "#4F46E5", // indigo-600
  "#7C3AED", // violet-600
  "#2563EB", // blue-600
  "#0891B2", // cyan-600
  "#059669", // emerald-600
  "#D97706", // amber-600
  "#DC2626", // red-600
  "#9333EA", // purple-600
  "#0D9488", // teal-600
  "#EA580C", // orange-600
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  payload: { artist: string; title: string };
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
      <p className="font-semibold text-gray-800">{data.title}</p>
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
    <div className="animate-pulse space-y-3 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="h-3 bg-gray-200 rounded"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
          <div className="h-3 bg-gray-100 rounded w-8" />
        </div>
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
  const [serviceType, setServiceType] = useState<ServiceType | undefined>(
    undefined
  );

  const { data, loading, error } = useTopSongs({ year, serviceType });

  // Transform data for Recharts
  const chartData = data.map((item) => ({
    title: item.song.title.length > 22 ? item.song.title.slice(0, 22) + "…" : item.song.title,
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
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />

          {/* Year filter */}
          <div className="flex items-center gap-1">
            <FilterBtn active={year === undefined} onClick={() => setYear(undefined)}>
              Todos
            </FilterBtn>
            {YEARS.map((y) => (
              <FilterBtn key={y} active={year === y} onClick={() => setYear(y)}>
                {y}
              </FilterBtn>
            ))}
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
            <FilterBtn
              active={serviceType === "DOMINGO"}
              onClick={() => setServiceType("DOMINGO")}
            >
              Domingo
            </FilterBtn>
            <FilterBtn
              active={serviceType === "MIERCOLES"}
              onClick={() => setServiceType("MIERCOLES")}
            >
              Miércoles
            </FilterBtn>
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
              No hay canciones en servicios{year ? ` del ${year}` : ""}{serviceType ? ` (${serviceType === "DOMINGO" ? "Domingo" : "Miércoles"})` : ""}.
            </p>
          </div>
        </div>
      ) : (
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
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
