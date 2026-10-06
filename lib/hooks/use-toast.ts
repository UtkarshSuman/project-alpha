// FEATURE: Toast notification system — module-level singleton store.
// Supports both signature styles:
// 1. toast("Saved successfully", "success")
// 2. toast({ title: "Saved", description: "All changes committed", variant: "success" })
// 3. const { toast } = useToast();
"use client";

import { useState, useEffect } from "react";
import type { Toast, ToastType } from "@/types/ui";

// ---------- module-level store ----------
type Subscriber = (toasts: Toast[]) => void;

let _toasts: Toast[] = [];
const _subscribers = new Set<Subscriber>();

function _notify() {
  _subscribers.forEach((s) => s([..._toasts]));
}

export function dismissToast(id: string) {
  _toasts = _toasts.filter((t) => t.id !== id);
  _notify();
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

// ---------- public API ----------
export function toast(
  messageOrOptions: string | ToastOptions,
  type: ToastType = "success",
  duration = 3500
) {
  let message = "";
  let finalType: ToastType = type;
  let finalDuration = duration;

  if (typeof messageOrOptions === "object" && messageOrOptions !== null) {
    const { title, description, variant, duration: d } = messageOrOptions;
    message = title && description ? `${title}: ${description}` : (title || description || "");
    if (variant) finalType = variant;
    if (d !== undefined) finalDuration = d;
  } else {
    message = String(messageOrOptions);
  }

  const id = Math.random().toString(36).slice(2, 9);
  _toasts = [..._toasts, { id, message, type: finalType, duration: finalDuration }];
  _notify();

  if (finalDuration !== Infinity) {
    setTimeout(() => dismissToast(id), finalDuration);
  }
}

// Convenience wrappers
toast.success = (msg: string, duration?: number) => toast(msg, "success", duration);
toast.error = (msg: string, duration?: number) => toast(msg, "error", duration);
toast.info = (msg: string, duration?: number) => toast(msg, "info", duration);
toast.warning = (msg: string, duration?: number) => toast(msg, "warning", duration);

// Hook returning standard toast dispatch
export function useToast() {
  return { toast, dismiss: dismissToast };
}

// Hook for the <Toaster /> component
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>(_toasts);

  useEffect(() => {
    setToasts([..._toasts]);
    _subscribers.add(setToasts);
    return () => {
      _subscribers.delete(setToasts);
    };
  }, []);

  return { toasts, dismiss: dismissToast };
}
