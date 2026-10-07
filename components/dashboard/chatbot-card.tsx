// ============================================================================
// FEATURE: Chatbot card with quick-actions dropdown — now parameterized with
// baseHref so simple/short-term/long-term lists all link into the correct
// route namespace (main click, AND every link inside the dropdown menu).
// ============================================================================
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MoreVertical,
  Play,
  BarChart2,
  Settings,
  ArrowUpRight,
  FileText,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatbotCardProps = {
  id: string;
  name: string;
  status: string;
  documentCount: number;
  apiKeyCount: number;
  createdAt?: string | Date;
  baseHref?: string;
};

export function ChatbotCard({
  id,
  name,
  status,
  documentCount,
  apiKeyCount,
  createdAt,
  baseHref = "/chatbots",
}: ChatbotCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      onClick={() => router.push(`${baseHref}/${id}`)}
      className="group relative flex flex-col justify-between rounded-lg border border-line bg-surface p-5 cursor-pointer transition-all duration-fast hover:border-line-hover hover:bg-surface-hover hover:shadow-elevate-sm"
    >
      <div>
        {/* Header: Icon, Status Badge, Quick Actions Menu */}
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink ring-1 ring-line group-hover:ring-accent-2 transition-colors duration-fast">
            <Bot size={18} className="text-accent" />
          </div>

          <div className="flex items-center gap-2">
            <Badge status={status} />

            {/* Quick Actions Dropdown */}
            <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Chatbot options"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-2"
              >
                <MoreVertical size={15} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-line bg-surface p-1 shadow-elevate-md text-xs"
                >
                  <Link
                    href={`${baseHref}/${id}/playground`}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
                  >
                    <Play size={13} className="text-accent" />
                    Playground
                  </Link>
                  <Link
                    href={`${baseHref}/${id}/analytics`}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
                  >
                    <BarChart2 size={13} className="text-accent-2" />
                    Analytics
                  </Link>
                  <Link
                    href={`${baseHref}/${id}/settings`}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
                  >
                    <Settings size={13} />
                    Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chatbot Name */}
        <div className="mt-4 flex items-center justify-between">
          <h3 className="font-display font-medium text-text group-hover:text-accent transition-colors duration-fast truncate pr-2">
            {name}
          </h3>
          <ArrowUpRight
            size={14}
            className="text-muted opacity-0 shrink-0 transition-opacity duration-fast group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 border-t border-line/50 pt-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FileText size={11} className="text-muted/70" />
            <span className="font-medium text-text">{documentCount}</span> doc{documentCount !== 1 ? "s" : ""}
          </span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1">
            <Key size={11} className="text-muted/70" />
            <span className="font-medium text-text">{apiKeyCount}</span> key{apiKeyCount !== 1 ? "s" : ""}
          </span>
        </div>

        {formattedDate && (
          <span className="text-[11px] text-muted/60">{formattedDate}</span>
        )}
      </div>
    </div>
  );
}