// ============================================================================
// FEATURE: Mascot — useGuide hook
// Drop this on any client component to register a contextual tip.
// Usage: spread the returned handlers onto the element, or use data-guide attr.
//
// <button {...guide("upload-document")} …>Upload</button>
// or: <button data-guide="Upload a PDF to add knowledge." …>Upload</button>
// ============================================================================
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGuideContext } from "./guide-context";
import { contextualMessages } from "./guide-config";

/**
 * Returns hover/focus handlers that show a contextual tooltip via the Guide.
 * Pass either a key from guide-config.contextualMessages, or an inline string.
 */
export function useGuide(keyOrMessage: string) {
  const { mode, showTooltip, hideTooltip } = useGuideContext();
  const enabled = mode === "guide";

  const message = contextualMessages[keyOrMessage] ?? keyOrMessage;

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    hoverTimer.current = setTimeout(() => showTooltip(message), 500);
  }, [enabled, message, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (enabled) hideTooltip();
  }, [enabled, hideTooltip]);

  const handleFocus = useCallback(() => {
    if (!enabled) return;
    showTooltip(message);
  }, [enabled, message, showTooltip]);

  const handleBlur = useCallback(() => {
    if (enabled) hideTooltip();
  }, [enabled, hideTooltip]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
}

// ---------------------------------------------------------------------------
// Global data-guide listener
// Attaches to the document body to handle any element with data-guide="..."
// without requiring every component to import useGuide.
// ---------------------------------------------------------------------------
export function useGlobalGuideListener() {
  const { mode, showTooltip, hideTooltip } = useGuideContext();
  const enabled = mode === "guide";
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function getTarget(e: Event): HTMLElement | null {
      const el = (e.target as HTMLElement)?.closest("[data-guide]") as HTMLElement | null;
      return el;
    }

    function onEnter(e: MouseEvent) {
      const el = getTarget(e);
      if (!el) return;
      const msg = el.getAttribute("data-guide");
      if (!msg) return;
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => showTooltip(msg), 500);
    }

    function onLeave(e: MouseEvent) {
      const el = getTarget(e);
      if (!el) return;
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hideTooltip();
    }

    function onFocus(e: FocusEvent) {
      const el = (e.target as HTMLElement)?.closest("[data-guide]") as HTMLElement | null;
      if (!el) return;
      const msg = el.getAttribute("data-guide");
      if (msg) showTooltip(msg);
    }

    function onBlur(e: FocusEvent) {
      const el = (e.target as HTMLElement)?.closest("[data-guide]") as HTMLElement | null;
      if (!el) return;
      hideTooltip();
    }

    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("focusout", onBlur, true);

    return () => {
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("focusout", onBlur, true);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, [enabled, showTooltip, hideTooltip]);
}
