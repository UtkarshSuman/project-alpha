// ============================================================================
// FEATURE: MascotGuidePanel — Guide mode panel
// Shown when mode === "guide". Offers tour launch buttons + live tooltip.
// ============================================================================
"use client";

import { Map, RotateCcw, X, Compass } from "lucide-react";
import { useGuideContext } from "./guide-context";
import { dashboardTour, chatbotCreationTour } from "./guide-config";
import { usePathname } from "next/navigation";

type Props = {
  onClose: () => void;
};

export function MascotGuidePanel({ onClose }: Props) {
  const { startTour, setMode, tooltip } = useGuideContext();
  const pathname = usePathname();

  const isOnChatbots = pathname?.startsWith("/chatbots");
  const isOnDashboard = pathname?.startsWith("/dashboard");

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 14px)",
        right: 0,
        width: 290,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-elevate-lg)",
        overflow: "hidden",
        animation: "fade-in 220ms cubic-bezier(0.16,1,0.3,1) both",
      }}
      role="dialog"
      aria-label="Uveriq guide assistant"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 14px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface-hover)",
        }}
      >
        <Compass size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            color: "var(--text)",
          }}
        >
          Guide Mode
        </span>
        <button
          onClick={onClose}
          aria-label="Close guide"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            padding: 4,
            display: "flex",
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Active tooltip indicator */}
        {tooltip && (
          <div
            style={{
              background: "var(--surface-hover)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              padding: "8px 10px",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              {tooltip}
            </p>
          </div>
        )}

        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>
          Hover over buttons, inputs, or sections for instant tips. Or launch a guided tour:
        </p>

        {/* Tour buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TourButton
            icon={<Map size={14} />}
            label="Dashboard Tour"
            description="Overview of the sidebar, navigation, and main features."
            onClick={() => { startTour(dashboardTour); onClose(); }}
            disabled={false}
          />
          <TourButton
            icon={<Map size={14} />}
            label="Chatbot Setup Tour"
            description="Creating a chatbot, uploading documents, and embedding."
            onClick={() => { startTour(chatbotCreationTour); onClose(); }}
            disabled={!isOnChatbots && !isOnDashboard}
            disabledReason="Navigate to Chatbots first"
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--line)", margin: "2px 0" }} />

        {/* Switch mode */}
        <button
          onClick={() => setMode("chat")}
          style={{
            background: "none",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "7px 10px",
            fontSize: 12,
            color: "var(--muted)",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-sans)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <RotateCcw size={12} />
          Switch to Chat mode
        </button>
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

// ---------------------------------------------------------------------------
// Sub-component: Tour Button
// ---------------------------------------------------------------------------
type TourButtonProps = {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
};

function TourButton({ icon, label, description, onClick, disabled, disabledReason }: TourButtonProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled && disabledReason ? disabledReason : undefined}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: "var(--surface-hover)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        transition: "background 140ms ease",
        width: "100%",
      }}
    >
      <span style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <span>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 11, color: "var(--muted)", lineHeight: 1.45 }}>
          {disabled && disabledReason ? disabledReason : description}
        </span>
      </span>
    </button>
  );
}
