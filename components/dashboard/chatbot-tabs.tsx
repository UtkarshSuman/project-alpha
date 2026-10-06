// ============================================================================
// FEATURE: Tab navigation within a single chatbot's detail views
// Migrated to sliding underline indicator measured from active tab DOM position.
// Includes Overview, Playground, Analytics, and Settings.
// ============================================================================

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatbotTabs({ chatbotid }: { chatbotid: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/chatbots/${chatbotid}`, label: "Overview" },
    { href: `/chatbots/${chatbotid}/playground`, label: "Playground" },
    { href: `/chatbots/${chatbotid}/analytics`, label: "Analytics" },
    { href: `/chatbots/${chatbotid}/settings`, label: "Settings" },
  ];

  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeIndex = tabs.findIndex((t) => {
    if (t.href === `/chatbots/${chatbotid}`) {
      return pathname === t.href;
    }
    return pathname.startsWith(t.href);
  });

  const updateIndicator = useCallback(() => {
    const el = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeIndex]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, pathname]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div className="relative mb-8 flex border-b border-line">
      {tabs.map((tab, idx) => {
        const active = idx === activeIndex;
        return (
          <Link
            key={tab.href}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-sm transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2",
              active ? "text-text font-medium" : "text-muted hover:text-text"
            )}
          >
            {tab.label}
          </Link>
        );
      })}

      {/* Sliding Underline Indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-accent transition-all duration-base ease-out rounded-full"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
        }}
      />
    </div>
  );
}