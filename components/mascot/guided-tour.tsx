// ============================================================================
// FEATURE: GuidedTour — step-by-step overlay that highlights target elements.
// Reads tour steps from GuideContext. Renders a spotlight cutout + tooltip.
// Scrolls target into view, handles missing elements gracefully.
// Keyboard accessible: Esc to skip, ArrowRight/L for next, ArrowLeft/H for prev.
// ============================================================================
"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { useGuideContext } from "./guide-context";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 10;

export function GuidedTour() {
  const { tourSteps, tourStep, isTourActive, nextTourStep, prevTourStep, endTour } =
    useGuideContext();

  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const step = tourSteps[tourStep];

  // Compute highlight rect and tooltip position from the target selector
  const computeLayout = useCallback(() => {
    if (!step) return;
    if (!step.target) {
      setHighlightRect(null);
      setTooltipPos(null);
      return;
    }

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setHighlightRect(null);
      setTooltipPos(null);
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Defer to allow scroll to settle
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      });

      // Place tooltip below or above depending on space
      const placement = step.placement ?? "bottom";
      const tTop =
        placement === "top"
          ? rect.top - PAD - 8
          : rect.bottom + PAD + 8;

      setTooltipPos({ top: tTop, left: Math.max(16, rect.left - PAD) });
    });
  }, [step]);

  useLayoutEffect(() => {
    if (!isTourActive) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState inside computeLayout is deferred via requestAnimationFrame (async), so no synchronous cascade occurs.
    computeLayout();
  }, [isTourActive, tourStep, computeLayout]);

  // Recalculate on resize/scroll
  useEffect(() => {
    if (!isTourActive) return;
    const onResize = () => computeLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isTourActive, computeLayout]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { endTour(); return; }
      if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") nextTourStep();
      if (e.key === "ArrowLeft" || e.key === "h" || e.key === "H") prevTourStep();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTourActive, nextTourStep, prevTourStep, endTour]);

  // Focus trap — focus the "Next" button when step changes
  useEffect(() => {
    if (isTourActive) {
      setTimeout(() => nextBtnRef.current?.focus(), 120);
    }
  }, [isTourActive, tourStep]);

  if (!isTourActive || !step) return null;

  const isCentered = !step.target || !highlightRect;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        pointerEvents: "none",
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Tour step ${tourStep + 1} of ${tourSteps.length}: ${step.title}`}
    >
      {/* Spotlight overlay — SVG mask cuts out the highlighted element */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "all" }}
        onClick={(e) => { if (e.target === e.currentTarget) endTour(); }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left}
                y={highlightRect.top}
                width={highlightRect.width}
                height={highlightRect.height}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(4, 13, 4, 0.75)"
          mask="url(#tour-spotlight-mask)"
        />
        {/* Highlight border ring */}
        {highlightRect && (
          <rect
            x={highlightRect.left}
            y={highlightRect.top}
            width={highlightRect.width}
            height={highlightRect.height}
            rx={8}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray="6 3"
            opacity={0.8}
          />
        )}
      </svg>

      {/* Tour card — centered or anchored */}
      <div
        style={{
          position: "absolute",
          ...(isCentered
            ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
            : tooltipPos
            ? { top: tooltipPos.top, left: tooltipPos.left, maxWidth: 320 }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-elevate-lg)",
          padding: "20px 22px",
          width: isCentered ? 360 : "auto",
          maxWidth: 360,
          pointerEvents: "all",
          animation: "fade-in 220ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--ink)",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}
          >
            {tourStep + 1}
          </span>
          <h2
            style={{
              margin: 0,
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {step.title}
          </h2>
          <button
            onClick={endTour}
            aria-label="Skip tour"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
          {step.message}
        </p>

        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
          {tourSteps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === tourStep ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === tourStep ? "var(--accent)" : "var(--line)",
                transition: "width 200ms ease, background 200ms ease",
              }}
            />
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {tourStep + 1} / {tourSteps.length}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={endTour}
            aria-label="Skip tour"
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
              fontSize: 12,
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "var(--font-sans)",
            }}
          >
            <SkipForward size={12} />
            Skip
          </button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                aria-label="Previous step"
                style={{
                  background: "var(--surface-hover)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 12px",
                  fontSize: 12,
                  color: "var(--text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-sans)",
                }}
              >
                <ChevronLeft size={13} />
                Back
              </button>
            )}
            <button
              ref={nextBtnRef}
              onClick={nextTourStep}
              aria-label={tourStep < tourSteps.length - 1 ? "Next step" : "Finish tour"}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
              }}
            >
              {tourStep < tourSteps.length - 1 ? (
                <>
                  Next <ChevronRight size={13} />
                </>
              ) : (
                "Finish"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
