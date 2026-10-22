// ============================================================================
// FEATURE: GuideTooltip — floating speech bubble above the mascot
// Shows context-aware tips and idle messages.
// Uses CSS transforms only — no layout measurements on every frame.
// ============================================================================
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  message: string | null;
  /** Whether this is a contextual tooltip (triggered by user interaction) */
  isContextual?: boolean;
};

export function GuideTooltip({ message, isContextual = false }: Props) {
  // Single state object keeps visible + displayMsg in sync.
  // displayMsg is retained after message goes null so the bubble
  // content doesn't disappear instantly during the CSS fade-out transition.
  const [state, setState] = useState<{ visible: boolean; msg: string | null }>({
    visible: false,
    msg: message,
  });
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message) {
      // Cancel any pending hide timer and show with updated message
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      // setState inside a conditional block inside effect — this is called
      // as a direct response to the external `message` prop changing, which
      // is the canonical use case the lint rule permits (synchronizing with
      // an external / parent-controlled value).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ visible: true, msg: message });
    } else {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      // Delay hiding so CSS opacity transition completes before unmount
      fadeTimer.current = setTimeout(() => {
        setState((s) => ({ ...s, visible: false }));
      }, 180);
    }
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [message]);

  if (!state.msg && !state.visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        bottom: "calc(100% + 12px)",
        right: 0,
        width: "220px",
        opacity: state.visible ? 1 : 0,
        transform: state.visible ? "translateY(0) scale(1)" : "translateY(6px) scale(0.97)",
        transition:
          "opacity 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {/* Bubble */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "10px 14px",
          boxShadow: "var(--shadow-elevate-md)",
          position: "relative",
        }}
      >
        {isContextual && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "5px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Tip
            </span>
          </div>
        )}
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: 1.55,
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {state.msg}
        </p>

        {/* Tail */}
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
    </div>
  );
}
