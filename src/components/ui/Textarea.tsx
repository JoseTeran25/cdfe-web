"use client";
import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}{props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white transition-all duration-150 outline-none resize-y",
            "placeholder:text-gray-400 text-gray-900",
            error
              ? "border-red-400 ring-1 ring-red-400"
              : "border-surface-border focus:border-navy/40 focus:ring-2 focus:ring-navy/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
