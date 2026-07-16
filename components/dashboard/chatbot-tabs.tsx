// FEATURE: Tab navigation within a single chatbot's pages
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatbotTabs({ chatbotid }: { chatbotid: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/chatbots/${chatbotid}`, label: "Overview" },
    { href: `/chatbots/${chatbotid}/analytics`, label: "Analytics" },
  ];

  return (
    <div className="mb-8 flex gap-1 border-b border-line">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm",
              active ? "border-accent text-text" : "border-transparent text-muted hover:text-text"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}