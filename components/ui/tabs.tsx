// FEATURE: Tabs with a sliding underline indicator.
// The indicator element is absolutely positioned and moves via inline style
// (left + width) measured from the active tab's DOM position. This gives a
// smooth slide effect without a CSS-only workaround.
// Keyboard: arrow keys navigate between tabs per ARIA tablist pattern.
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, tabs]);

  // Update on active tab change and on mount
  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Also update on window resize so the indicator doesn't drift
  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  function handleKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    if (e.key === "ArrowRight") {
      const next = (currentIndex + 1) % tabs.length;
      onChange(tabs[next].id);
      tabRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev = (currentIndex - 1 + tabs.length) % tabs.length;
      onChange(tabs[prev].id);
      tabRefs.current[prev]?.focus();
    }
  }

  return (
    <div
      role="tablist"
      className={cn("relative flex border-b border-line", className)}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative px-3 py-2.5 text-sm transition-colors duration-fast outline-none",
              isActive ? "text-text" : "text-muted hover:text-text"
            )}
          >
            {tab.label}
          </button>
        );
      })}

      {/* Sliding underline indicator */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 h-[2px] rounded-full bg-accent transition-all duration-base"
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />
    </div>
  );
}

// Convenience wrapper for a tab panel region
export function TabPanel({
  id,
  activeTab,
  children,
  className,
}: {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (id !== activeTab) return null;
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={className}
    >
      {children}
    </div>
  );
}
