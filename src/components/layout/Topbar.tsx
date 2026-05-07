"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/songs": "Canciones",
  "/services": "Servicios",
  "/team": "Equipo",
  "/settings": "Configuración",
};

export function Topbar({ onMenuClick, sidebarCollapsed }: TopbarProps) {
  const pathname = usePathname();

  const title =
    Object.entries(pageTitles).find(([key]) =>
      pathname.startsWith(key)
    )?.[1] ?? "CdFe App";

  return (
    <header
      id="topbar"
      className={cn(
        "fixed top-0 right-0 h-16 z-20 flex items-center gap-3 px-4 lg:px-6",
        "bg-white/80 backdrop-blur-md border-b border-surface-border shadow-sm",
        "transition-all duration-300",
        sidebarCollapsed
          ? "lg:left-[72px]"
          : "lg:left-[260px]",
        "left-0"
      )}
    >
      {/* Mobile Hamburger */}
      <button
        id="hamburger-btn"
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-navy hover:bg-navy/5 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="font-display font-semibold text-navy text-lg leading-none">
          {title}
        </h1>
        <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">
          Comunidad de Fe Sur
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          id="search-btn"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-surface border border-surface-border rounded-xl hover:border-navy/30 hover:text-navy transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline text-xs">Buscar...</span>
          <kbd className="hidden md:inline text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="relative p-2 rounded-xl text-gray-500 hover:text-navy hover:bg-navy/5 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full border-2 border-white pulse-dot" />
        </button>

        {/* Avatar */}
        <button
          id="user-avatar-btn"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-navy/5 transition-colors group"
          aria-label="Perfil de usuario"
        >
          <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center">
            <span className="text-gold font-bold text-xs">JD</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-navy leading-none">
              Jose Daniel
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Director</p>
          </div>
        </button>
      </div>
    </header>
  );
}
