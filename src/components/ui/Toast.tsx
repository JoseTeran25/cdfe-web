"use client";
import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData { type: "success" | "error"; message: string; }

interface Props extends ToastData { onClose: () => void; }

export function Toast({ type, message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[60] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-fade-in-up max-w-sm",
      type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
    )}>
      {type === "success"
        ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
      <p className={cn("text-sm font-medium flex-1", type === "success" ? "text-emerald-800" : "text-red-800")}>
        {message}
      </p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
