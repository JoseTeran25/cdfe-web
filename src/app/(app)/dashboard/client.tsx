"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { NextServiceCard } from "@/components/dashboard/NextServiceCard";
import { SongsToLearnList } from "@/components/dashboard/SongsToLearnList";
import { TopSongsChart } from "@/components/dashboard/TopSongsChart";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Music2,
  CalendarDays,
  Users,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Loader,
} from "lucide-react";
import React from "react";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  iconBg: string;
  iconColor: string;
  delay: string;
}

function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon;
  return (
    <Card hover className={`animate-fade-in-up ${item.delay}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {item.label}
          </p>
          <p className="font-display font-bold text-navy text-3xl mt-1 leading-none">
            {item.value}
          </p>
          {item.trend && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {item.trend}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

export function DashboardClient() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h2 className="font-display font-bold text-2xl text-navy">
            ¡Buen día, Adorador! 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Cargando datos del ministerio...
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader className="w-6 h-6 text-navy animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h2 className="font-display font-bold text-2xl text-navy">
            ¡Buen día, Adorador! 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Resumen del ministerio de alabanza.
          </p>
        </div>
        <Card className="bg-red-50 border border-red-200">
          <div className="flex items-start gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">
                Error cargando datos
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error || "No se pudieron obtener los datos del dashboard."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      label: "Total Canciones",
      value: data.totalSongs,
      icon: Music2,
      iconBg: "bg-navy/8",
      iconColor: "text-navy",
      delay: "stagger-1",
    },
    {
      label: "Canciones Activas",
      value: data.activeSongs,
      icon: Sparkles,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      delay: "stagger-2",
    },
    {
      label: "Por Sacar",
      value: data.pendingSongs,
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      delay: "stagger-3",
    },
    {
      label: "Miembros Equipo",
      value: data.totalMembers,
      icon: Users,
      iconBg: "bg-gold/15",
      iconColor: "text-amber-600",
      delay: "stagger-4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in-up">
        <h2 className="font-display font-bold text-2xl text-navy">
          ¡Buen día, Adorador! 👋
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Aquí tienes el resumen del ministerio de alabanza.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <StatCard key={item.label} item={item} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Next Service — wider */}
        <div className="lg:col-span-2">
          {data.nextService ? (
            <NextServiceCard service={data.nextService} />
          ) : (
            <Card className="animate-fade-in-up stagger-1">
              <CardHeader>
                <CardTitle>Próximo Servicio</CardTitle>
              </CardHeader>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">
                  No hay servicios programados.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Songs to learn — wider */}
        <div className="lg:col-span-3">
          <SongsToLearnList songs={data.songsToLearn} />
        </div>
      </div>

      {/* Top Songs Chart — full width */}
      <TopSongsChart />
    </div>
  );
}
