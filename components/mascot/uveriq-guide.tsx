// ============================================================================
// FEATURE: UveriqGuide — floating mascot orchestrator (client component).
// Manages the floating button, panel open/close, reaction state, and tooltip.
// Renders the appropriate panel based on active mode.
// SSR-safe: mounts via dynamic import with ssr:false in the root layout.
// ============================================================================
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, Settings } from "lucide-react";
import { UveriqMascot } from "./uveriq-mascot";
import { GuideTooltip } from "./guide-tooltip";
import { GuidedTour } from "./guided-tour";
import { MascotModeIntro } from "./mascot-mode-intro";
import { MascotChatPanel } from "./mascot-chat-panel";
import { MascotGuidePanel } from "./mascot-guide-panel";
import { useGuideContext } from "./guide-context";
import { useGlobalGuideListener } from "./use-guide";

// Bottom-right offset from viewport edge
const OFFSET_RIGHT = 24;
const OFFSET_BOTTOM = 24;

export function UveriqGuide() {
  const {
    mode,
    setMode,
    isOpen,
    open,
    close,
    toggle,
    tooltip,
    idleMessage,
    isTourActive,
  } = useGuideContext();

  // Wire up global data-guide attribute listener (only active in guide mode)
  useGlobalGuideListener();

  // Show idle bubble after 8s of no interaction, only when panel is closed.
  // We avoid synchronous setState in the effect body by clearing the timer
  // and letting the state naturally reset via the conditional render below.
  const [isReacting, setIsReacting] = useState(false);
  const showIdleBubbleRef = useRef(false);
  const [showIdleBubble, setShowIdleBubble] = useState(false);
  const idleBubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (idleBubbleTimer.current) clearTimeout(idleBubbleTimer.current);
    if (isOpen || isTourActive) {
      // Clear via timer callback — avoids synchronous setState in effect body
      if (showIdleBubbleRef.current) {
        showIdleBubbleRef.current = false;
        setShowIdleBubble(false);
      }
      return;
    }
    idleBubbleTimer.current = setTimeout(() => {
      showIdleBubbleRef.current = true;
      setShowIdleBubble(true);
    }, 8_000);
    return () => {
      if (idleBubbleTimer.current) clearTimeout(idleBubbleTimer.current);
    };
  }, [isOpen, isTourActive, idleMessage]);

  // Hide idle bubble when user opens panel
  const handleToggle = useCallback(() => {
    setShowIdleBubble(false);
    if (mode === "reactive") {
      setIsReacting(true);
      setTimeout(() => setIsReacting(false), 600);
      return;
    }
    toggle();
  }, [mode, toggle]);

  // Trigger reaction animation
  const triggerReaction = useCallback(() => {
    setIsReacting(true);
    setTimeout(() => setIsReacting(false), 600);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    // Delay so the opening click doesn't immediately close
    const t = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  // Pause float animation when tab is hidden
  useEffect(() => {
    function handleVisibility() {
      const els = document.querySelectorAll<HTMLElement>(".mascot-float");
      els.forEach((el) => {
        el.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Don't render during active tour (tour has its own overlay)
  if (isTourActive) return <GuidedTour />;

  const tooltipMessage = tooltip ?? (showIdleBubble ? idleMessage : null);
  const showContextualMarker = !!tooltip;

  return (
    <>
      {/* Guided tour overlay (separate portal) */}
      <GuidedTour />

      {/* Floating widget container */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          bottom: OFFSET_BOTTOM,
          right: OFFSET_RIGHT,
          zIndex: 9000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {/* Tooltip / speech bubble */}
        <GuideTooltip message={tooltipMessage} isContextual={showContextualMarker} />

        {/* Open panel */}
        {isOpen && (
          <>
            {mode === null && <MascotModeIntro />}
            {mode === "guide" && <MascotGuidePanel onClose={close} />}
            {mode === "chat" && <MascotChatPanel onClose={close} />}
            {mode === "reactive" && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 14px)",
                  right: 0,
                  width: 230,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "var(--shadow-elevate-lg)",
                  padding: "14px 16px",
                  animation: "fade-in 220ms cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text)" }}>
                  Hi! I&apos;m Uveriq&apos;s mascot. Click me to make me react, or switch to a
                  more helpful mode:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    onClick={() => setMode("guide")}
                    style={modeButtonStyle}
                  >
                    🧭 Switch to Guide mode
                  </button>
                  <button
                    onClick={() => setMode("chat")}
                    style={modeButtonStyle}
                  >
                    💬 Switch to Chat mode
                  </button>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: -7,
                    right: 28,
                    width: 13,
                    height: 13,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderTop: "none",
                    borderLeft: "none",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Mascot button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Mode badge / settings button */}
          {mode && !isOpen && (
            <button
              onClick={open}
              aria-label="Open assistant settings"
              title={`${mode} mode — click to open`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "5px 9px",
                fontSize: 11,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                boxShadow: "var(--shadow-elevate-sm)",
                transition: "background 140ms ease",
              }}
            >
              <Settings size={11} />
              {mode}
            </button>
          )}

          {/* Close button when open */}
          {isOpen && (
            <button
              onClick={close}
              aria-label="Close assistant"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "50%",
                cursor: "pointer",
                color: "var(--muted)",
                boxShadow: "var(--shadow-elevate-sm)",
              }}
            >
              <X size={13} />
            </button>
          )}

          {/* Main mascot button */}
          <button
            onClick={handleToggle}
            onDoubleClick={triggerReaction}
            aria-label={
              isOpen
                ? "Close Uveriq assistant"
                : `Open Uveriq assistant (${mode ?? "setup"} mode)`
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "50%",
              padding: 4,
              cursor: "pointer",
              boxShadow: "var(--shadow-elevate-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "box-shadow 200ms ease, border-color 200ms ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent), var(--shadow-elevate-md)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-elevate-md)";
            }}
          >
            <UveriqMascot size={56} isReacting={isReacting} />
          </button>
        </div>
      </div>
    </>
  );
}

const modeButtonStyle: React.CSSProperties = {
  background: "var(--surface-hover)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-md)",
  padding: "7px 10px",
  fontSize: 12,
  color: "var(--text)",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "var(--font-sans)",
};
