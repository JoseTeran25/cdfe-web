"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarRange, X } from "lucide-react";

/** Contenedor a pantalla completa; queda bajo el Modal (z-9999) para poder editar celdas desde aquí. */
export function RosterFullscreen({
  controls,
  children,
  onClose,
}: {
  controls: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Si hay un modal abierto encima, Escape lo cierra a él primero
      if (e.key === "Escape" && !document.querySelector("[role='dialog']")) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex flex-col bg-surface">
      <div className="shrink-0 bg-white border-b border-surface-border shadow-sm px-3 sm:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <CalendarRange className="w-5 h-5 text-navy shrink-0" />
          <h2 className="font-display font-bold text-navy text-lg truncate">Programación</h2>
        </div>
        <button
          onClick={onClose}
          className="sm:order-last p-2 rounded-xl text-gray-500 hover:text-navy hover:bg-navy/5 transition-colors"
          aria-label="Cerrar pantalla completa"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">{controls}</div>
      </div>
      <div className="flex-1 overflow-auto p-3 sm:p-6">{children}</div>
    </div>,
    document.body
  );
}
