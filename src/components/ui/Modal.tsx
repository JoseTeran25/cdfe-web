"use client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof sizes;
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: Props) {
  // Portal requires the DOM to be mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  /*
    Rendered via Portal into document.body — completely outside the app
    layout tree, so no parent stacking context can clip or constrain it.
  */
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-navy-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal
          aria-labelledby="modal-title"
          onClick={e => e.stopPropagation()}
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-2xl border border-surface-border",
            "my-4 flex flex-col",
            sizes[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-surface-border shrink-0">
            <h2
              id="modal-title"
              className="font-display font-bold text-navy text-base sm:text-lg leading-snug"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-3 shrink-0 p-1.5 rounded-xl text-gray-400 hover:text-navy hover:bg-navy/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body — scrolls independently when content is tall */}
          <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 max-h-[calc(100vh-12rem)]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-5 sm:px-6 py-4 border-t border-surface-border flex flex-wrap items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
