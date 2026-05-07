"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Service } from "@/types";
import {
  CalendarDays,
  Clock,
  Music2,
  Users,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { formatDate, getDaysUntil, getServiceTypeLabel } from "@/lib/utils";

interface NextServiceCardProps {
  service: Service;
}

export function NextServiceCard({ service }: NextServiceCardProps) {
  const daysUntil = getDaysUntil(service.date);
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  const daysLabel = isToday
    ? "¡Hoy!"
    : isTomorrow
    ? "Mañana"
    : `En ${daysUntil} días`;

  return (
    <Card padding="none" className="overflow-hidden animate-fade-in-up stagger-1">
      {/* Navy gradient header */}
      <div className="bg-navy-gradient px-6 pt-5 pb-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-12 w-24 h-24 rounded-full bg-gold/10" />
        <div className="absolute right-16 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Próximo Servicio
            </p>
            <h2 className="font-display font-bold text-white text-xl leading-tight">
              {service.title ?? getServiceTypeLabel(service.type)}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {formatDate(service.date)}
            </p>
          </div>
          <Badge
            variant={isToday ? "gold" : daysUntil <= 3 ? "warning" : "neutral"}
            dot={isToday}
            size="sm"
            className={
              isToday
                ? "bg-gold/20 text-gold border-gold/30"
                : "bg-white/10 text-white border-white/20"
            }
          >
            {daysLabel}
          </Badge>
        </div>
      </div>

      {/* Content card that overlaps the header */}
      <div className="px-6 pb-5 -mt-8 relative">
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-4">
          <div className="grid grid-cols-3 divide-x divide-surface-border text-center">
            <div className="px-3">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                <Music2 className="w-3.5 h-3.5" />
                <span className="text-xs">Canciones</span>
              </div>
              <p className="font-display font-bold text-navy text-xl">
                {service.setlist.length}
              </p>
            </div>
            <div className="px-3">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">Miembros</span>
              </div>
              <p className="font-display font-bold text-navy text-xl">
                {service.team.length}
              </p>
            </div>
            <div className="px-3">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">Tipo</span>
              </div>
              <p className="font-display font-bold text-navy text-sm truncate">
                {getServiceTypeLabel(service.type)}
              </p>
            </div>
          </div>
        </div>

        {/* Setlist preview */}
        {service.setlist.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Setlist
            </p>
            <div className="space-y-2">
              {service.setlist.slice(0, 4).map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 group"
                >
                  <span className="w-5 h-5 rounded-full bg-navy/8 text-navy/50 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <Badge variant="navy" size="sm">
                    {song.key}
                  </Badge>
                </div>
              ))}
              {service.setlist.length > 4 && (
                <p className="text-xs text-gray-400 pl-8">
                  +{service.setlist.length - 4} más...
                </p>
              )}
            </div>
          </div>
        )}

        <Link href={`/services/${service.id}`}>
          <Button variant="secondary" size="sm" fullWidth className="mt-4">
            Ver Servicio Completo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
