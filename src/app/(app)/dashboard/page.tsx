import type { Metadata } from "next";
import { NextServiceCard } from "@/components/dashboard/NextServiceCard";
import { SongsToLearnList } from "@/components/dashboard/SongsToLearnList";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardStats, Service, Song } from "@/types";
import {
  Music2,
  CalendarDays,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Mock Data ─────────────────────────────────────────────────────────────
// TODO: Reemplazar con fetch real a la API NestJS
const mockNextService: Service = {
  id: "svc-001",
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
  type: "DOMINGO",
  title: "Servicio Dominical",
  notes: "Énfasis en adoración profunda",
  setlist: [
    {
      id: "s1",
      title: "Majestad",
      artist: "Marcos Barrientos",
      key: "G",
      bpm: 72,
      status: "ACTIVA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "s2",
      title: "Buen Dios",
      artist: "Elevation Worship",
      key: "D",
      bpm: 68,
      status: "ACTIVA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "s3",
      title: "Te Alabo",
      artist: "Hillsong",
      key: "A",
      bpm: 80,
      status: "ACTIVA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "s4",
      title: "Cristo Me Ama",
      artist: "Phil Wickham",
      key: "C",
      bpm: 75,
      status: "ACTIVA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "s5",
      title: "Hallelujah",
      artist: "Bethel Music",
      key: "E",
      bpm: 70,
      status: "ACTIVA",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  team: [
    {
      id: "us1",
      userId: "u1",
      serviceId: "svc-001",
      instrument: "GUITARRA",
    },
    {
      id: "us2",
      userId: "u2",
      serviceId: "svc-001",
      instrument: "BATERIA",
    },
    {
      id: "us3",
      userId: "u3",
      serviceId: "svc-001",
      instrument: "BAJO",
    },
    {
      id: "us4",
      userId: "u4",
      serviceId: "svc-001",
      instrument: "VOZ_PRINCIPAL",
    },
    {
      id: "us5",
      userId: "u5",
      serviceId: "svc-001",
      instrument: "TECLADO",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSongsToLearn: Song[] = [
  {
    id: "p1",
    title: "Reckless Love",
    artist: "Cory Asbury",
    key: "C",
    bpm: 76,
    status: "PENDIENTE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    title: "Goodness of God",
    artist: "Bethel Music",
    key: "B",
    bpm: 69,
    status: "PENDIENTE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p3",
    title: "Way Maker",
    artist: "Sinach",
    key: "F",
    bpm: 84,
    status: "PENDIENTE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockStats: DashboardStats = {
  totalSongs: 47,
  activeSongs: 44,
  pendingSongs: 3,
  totalMembers: 12,
  nextService: mockNextService,
  songsToLearn: mockSongsToLearn,
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
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
    <Card
      hover
      className={`animate-fade-in-up ${item.delay}`}
    >
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

// ─── Page ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const stats = mockStats;

  const statItems: StatItem[] = [
    {
      label: "Total Canciones",
      value: stats.totalSongs,
      icon: Music2,
      trend: "+3 este mes",
      iconBg: "bg-navy/8",
      iconColor: "text-navy",
      delay: "stagger-1",
    },
    {
      label: "Canciones Activas",
      value: stats.activeSongs,
      icon: Sparkles,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      delay: "stagger-2",
    },
    {
      label: "Por Sacar",
      value: stats.pendingSongs,
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      delay: "stagger-3",
    },
    {
      label: "Miembros Equipo",
      value: stats.totalMembers,
      icon: Users,
      trend: "2 nuevos",
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
          ¡Buen día, José Daniel! 👋
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
          {stats.nextService ? (
            <NextServiceCard service={stats.nextService} />
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
          <SongsToLearnList songs={stats.songsToLearn} />
        </div>
      </div>
    </div>
  );
}
