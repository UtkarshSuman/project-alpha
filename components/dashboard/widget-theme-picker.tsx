// ============================================================================
// FEATURE: Visual theme + position picker — 5 preset click-to-select cards
// instead of a full design editor. Each card renders a small mock preview
// using real CSS so customers see an approximation before saving.
// ============================================================================
// ============================================================================
// FEATURE: Visual theme + position + size picker — preset click-to-select
// cards instead of a full design editor.
// ============================================================================
"use client";

import { cn } from "@/lib/utils";

const THEMES = [
  { id: "classic", label: "Classic", radius: "10px", desc: "Rounded corners, soft shadow" },
  { id: "minimal", label: "Minimal", radius: "3px", desc: "Flat, thin border, sharp edges" },
  { id: "rounded", label: "Rounded", radius: "20px", desc: "Extra-soft, pill-like corners" },
  { id: "compact", label: "Compact", radius: "8px", desc: "Smaller panel, tighter spacing" },
  { id: "bold", label: "Bold", radius: "12px", desc: "Larger header, stronger shadow" },
] as const;

const POSITIONS = [
  { id: "bottom-right", label: "Bottom right" },
  { id: "bottom-left", label: "Bottom left" },
] as const;

const SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
] as const;

export function WidgetThemePicker({
  theme,
  position,
  size,
  color,
  onThemeChange,
  onPositionChange,
  onSizeChange,
}: {
  theme: string;
  position: string;
  size: string;
  color: string;
  onThemeChange: (theme: string) => void;
  onPositionChange: (position: string) => void;
  onSizeChange: (size: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-text">Style</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onThemeChange(t.id)}
            className={cn(
              "rounded-md border p-3 text-left transition-colors",
              theme === t.id ? "border-accent bg-surface" : "border-line bg-surface hover:bg-surface-hover"
            )}
          >
            <div
              className="mb-2 h-8 w-full"
              style={{ borderRadius: t.radius, background: color, opacity: 0.85 }}
            />
            <p className="text-xs font-medium text-text">{t.label}</p>
            <p className="text-[11px] text-muted">{t.desc}</p>
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-sm text-text">Position</p>
      <div className="flex gap-3">
        {POSITIONS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPositionChange(p.id)}
            className={cn(
              "rounded-md border px-4 py-2 text-xs",
              position === p.id ? "border-accent bg-surface text-text" : "border-line bg-surface text-muted hover:text-text"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-sm text-text">Size</p>
      <p className="mb-2 text-xs text-muted">Applies across desktop, tablet, and mobile — each scales proportionally.</p>
      <div className="flex gap-3">
        {SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSizeChange(s.id)}
            className={cn(
              "rounded-md border px-4 py-2 text-xs",
              size === s.id ? "border-accent bg-surface text-text" : "border-line bg-surface text-muted hover:text-text"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}