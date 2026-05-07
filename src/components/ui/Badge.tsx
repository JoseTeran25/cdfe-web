"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant =
  | "navy"
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "pending";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  navy: "bg-navy/10 text-navy border-navy/20",
  gold: "bg-gold/15 text-amber-700 border-gold/30",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-violet-50 text-violet-700 border-violet-200",
};

const dotStyles: Record<BadgeVariant, string> = {
  navy: "bg-navy",
  gold: "bg-gold",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-gray-400",
  pending: "bg-violet-500",
};

export function Badge({
  variant = "neutral",
  dot = false,
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full",
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "rounded-full pulse-dot",
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            dotStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
