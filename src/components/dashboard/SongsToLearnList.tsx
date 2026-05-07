"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Song } from "@/types";
import { Music2, Gauge, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface SongsToLearnListProps {
  songs: Song[];
}

export function SongsToLearnList({ songs }: SongsToLearnListProps) {
  if (songs.length === 0) {
    return (
      <Card className="animate-fade-in-up stagger-2">
        <CardHeader>
          <CardTitle>Canciones por Sacar</CardTitle>
          <Badge variant="success" dot size="sm">
            Al día
          </Badge>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
            <BookOpen className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            ¡Excelente! No hay canciones pendientes.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            El equipo está al día con el repertorio.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up stagger-2">
      <CardHeader>
        <CardTitle>Canciones por Sacar</CardTitle>
        <Badge variant="pending" dot size="sm">
          {songs.length} pendiente{songs.length !== 1 ? "s" : ""}
        </Badge>
      </CardHeader>

      <div className="space-y-2">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors group cursor-pointer"
            style={{ animationDelay: `${(index + 3) * 0.05}s` }}
          >
            {/* Music icon with index */}
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
              <Music2 className="w-4 h-4 text-violet-500" />
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-navy transition-colors">
                {song.title}
              </p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {song.bpm && (
                <div className="hidden sm:flex items-center gap-1 text-gray-400">
                  <Gauge className="w-3.5 h-3.5" />
                  <span className="text-xs">{song.bpm}</span>
                </div>
              )}
              <Badge variant="navy" size="sm">
                {song.key}
              </Badge>
              <Badge variant="pending" size="sm">
                Pendiente
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-surface-border">
        <Link href="/songs?status=PENDIENTE">
          <Button variant="ghost" size="sm" fullWidth>
            Ver todas las canciones pendientes
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
