"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Music2,
  CalendarDays,
  Users,
  HeartHandshake,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { supportRequestsApi } from "@/lib/api";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Canciones", href: "/songs", icon: Music2 },
  { label: "Servicios", href: "/services", icon: CalendarDays },
  { label: "Equipo", href: "/team", icon: Users },
  { label: "No estás solo", href: "/support-requests", icon: HeartHandshake },
  { label: "Mensajes", href: "/mensajes", icon: MessageCircle },
];

const bottomNavItems: NavItem[] = [
  { label: "Configuración", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [pendingSupportCount, setPendingSupportCount] = useState(0);

  useEffect(() => {
    supportRequestsApi
      .getAll()
      .then(reqs => setPendingSupportCount(reqs.filter(r => !r.contacted).length))
      .catch(() => {});
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col bg-navy-gradient sidebar-transition shadow-sidebar",
          // Desktop behavior
          "lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          // Mobile behavior
          mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-white/10 shrink-0",
            collapsed && !mobileOpen ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 group",
              collapsed && !mobileOpen && "justify-center"
            )}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center group-hover:bg-gold/30 transition-colors overflow-hidden">
              <Image 
                src="/images/logo.jpg" 
                alt="CdFe Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <p className="font-display font-bold text-white text-sm leading-none">
                  Worship Sur
                </p>
                <p className="text-white/50 text-[10px] mt-0.5 truncate">
                  Comunidad de Fe Sur
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            onClick={onMobileClose}
            aria-label="Cerrar menú"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const badge =
              item.href === "/support-requests" && pendingSupportCount > 0
                ? String(pendingSupportCount)
                : item.badge;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/[8%] hover:text-white/90"
                )}
                aria-current={active ? "page" : undefined}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gold rounded-r-full" />
                )}

                <Icon
                  className={cn(
                    "shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-gold" : "text-white/50",
                    collapsed && !mobileOpen ? "w-5 h-5" : "w-4.5 h-4.5"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />

                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}

                {badge && (!collapsed || mobileOpen) && (
                  <span className="ml-auto text-[10px] bg-gold text-navy-950 font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}

                {/* Tooltip on collapsed */}
                {collapsed && !mobileOpen && (
                  <span className="absolute left-14 bg-navy-950 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 shadow-lg border border-white/10 z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:bg-white/[8%] hover:text-white/80"
                )}
              >
                <Icon className="shrink-0 w-4 h-4" strokeWidth={2} />
                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
                {collapsed && !mobileOpen && (
                  <span className="absolute left-14 bg-navy-950 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity shadow-lg border border-white/10 z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* User Avatar */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 mt-1 bg-white/[8%]",
              collapsed && !mobileOpen && "justify-center px-2"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gold/30 border border-gold/40 flex items-center justify-center flex-shrink-0">
              <span className="text-gold font-bold text-xs">JD</span>
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  Cdfe Worship Sur
                </p>
                <p className="text-white/40 text-[10px] truncate">Director</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-surface-border rounded-full shadow-card items-center justify-center text-navy/60 hover:text-navy hover:shadow-card-hover transition-all z-50"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}
