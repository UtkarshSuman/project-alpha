// ============================================================================
// FEATURE: MascotModeIntro — first-visit intro screen that lets user pick mode.
// Shown only when mode === null (not yet selected).
// Appears as an overlay panel above the mascot button.
// ============================================================================
"use client";

import { Zap, Compass, MessageSquare } from "lucide-react";
import { useGuideContext } from "./guide-context";
import type { MascotMode } from "./guide-config";

type ModeOption = {
  id: MascotMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
};

const OPTIONS: ModeOption[] = [
  {
    id: "reactive",
    icon: <Zap size={20} />,
    title: "Reactive",
    description: "Fun idle mascot. Click me to see reactions and animations.",
    accentColor: "var(--warning)",
  },
  {
    id: "guide",
    icon: <Compass size={20} />,
    title: "Guide",
    description: "Hover over elements for tips. Run step-by-step onboarding tours.",
    accentColor: "var(--accent)",
  },
  {
    id: "chat",
    icon: <MessageSquare size={20} />,
    title: "Chat",
    description: "Ask me anything about Uveriq — instant answers from our FAQ.",
    accentColor: "var(--accent-2)",
  },
];

export function MascotModeIntro() {
  const { setMode } = useGuideContext();

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 14px)",
        right: 0,
        width: 300,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-elevate-lg)",
        overflow: "hidden",
        animation: "fade-in 220ms cubic-bezier(0.16,1,0.3,1) both",
      }}
      role="dialog"
      aria-label="Choose mascot mode"
      aria-modal="true"
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 12px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface-hover)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--accent)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 4,
          }}
        >
          Uveriq Assistant
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          How can I help?
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
          Choose how you&apos;d like the mascot to behave. You can change this anytime.
        </p>
      </div>

      {/* Mode options */}
      <div style={{ padding: "10px 10px 14px" }}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id)}
            aria-label={`Activate ${opt.title} mode: ${opt.description}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              width: "100%",
              background: "none",
              border: "1px solid transparent",
              borderRadius: "var(--radius-lg)",
              padding: "10px 12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 140ms ease, border-color 140ms ease",
              marginBottom: 4,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-hover)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            }}
          >
            {/* Icon badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: `color-mix(in srgb, ${opt.accentColor} 12%, var(--surface))`,
                color: opt.accentColor,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {opt.icon}
            </span>

            {/* Text */}
            <span>
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: 2,
                }}
              >
                {opt.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                {opt.description}
              </span>
            </span>
          </button>
        ))}
      </div>

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
  );
}
