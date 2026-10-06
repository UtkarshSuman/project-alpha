// FEATURE: Toast notification system.
// <Toaster /> renders at the bottom-right of the viewport. Individual toasts
// animate in with .toast-enter and are dismissed after their duration.
// Import toast() from lib/hooks/use-toast and call it from any Client Component.
//
// Usage:
//   import { toast } from "@/lib/hooks/use-toast";
//   toast("Chatbot created");
//   toast.error("Something went wrong");
//
// Mount <Toaster /> once in app/(dashboard)/layout.tsx or root layout.
"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToasts, dismissToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Toast, ToastType } from "@/types/ui";

// Icon and color per toast type
const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; containerClass: string; iconClass: string }
> = {
  success: {
    icon: <CheckCircle2 size={15} />,
    containerClass: "border-success/20 bg-surface",
    iconClass: "text-success",
  },
  error: {
    icon: <AlertCircle size={15} />,
    containerClass: "border-danger/30 bg-surface",
    iconClass: "text-danger",
  },
  warning: {
    icon: <AlertTriangle size={15} />,
    containerClass: "border-accent/30 bg-surface",
    iconClass: "text-accent",
  },
  info: {
    icon: <Info size={15} />,
    containerClass: "border-accent-2/20 bg-surface",
    iconClass: "text-accent-2",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const [exiting, setExiting] = useState(false);
  const type = toast.type ?? "success";
  const config = typeConfig[type];

  const handleDismiss = useCallback(() => {
    setExiting(true);
    // Wait for exit animation before removing from state
    setTimeout(() => dismissToast(toast.id), 150);
  }, [toast.id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-elevate-sm",
        "text-sm text-text",
        config.containerClass,
        exiting ? "toast-exit" : "toast-enter"
      )}
    >
      <span className={cn("mt-0.5 shrink-0", config.iconClass)}>
        {config.icon}
      </span>
      <p className="flex-1 leading-5">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-muted transition-colors duration-fast hover:text-text"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Mount this once in the root/dashboard layout. Renders into a fixed portal
// at bottom-right. Toasts stack upward with a small gap.
export function Toaster() {
  const { toasts } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
