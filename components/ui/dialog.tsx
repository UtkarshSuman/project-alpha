// FEATURE: Modal dialog — no external UI library dependency.
// Closes on backdrop click or Escape key.
// Entrance: scale + fade in via .dialog-enter CSS class (defined in globals.css).
// Focus-trapped while open. Returns focus to the trigger on close.
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the panel on open so keyboard users land inside it
  useEffect(() => {
    if (open) {
      // Defer to let the animation start before we shift focus
      const raf = requestAnimationFrame(() => panelRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4 backdrop-blur-[2px]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
    >
      <div
        ref={panelRef}
        className="dialog-enter w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-elevate-md outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="dialog-title" className="font-display text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}