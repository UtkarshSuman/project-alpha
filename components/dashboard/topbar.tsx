// FEATURE: Dashboard topbar — breadcrumb, hamburger (mobile), user menu.
// Breadcrumb is derived from the current pathname — no data fetches needed
// for segment labels (dynamic IDs show as the parent section name).
// User menu: initials avatar + dropdown with sign-out.
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, ChevronRight, LogOut, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Breadcrumb helpers ───────────────────────────────────────────────────────

const segmentLabels: Record<string, string> = {
  dashboard: "Overview",
  chatbots: "Chatbots",
  "tool-agents": "Tool Agents",
  team: "Team",
  billing: "Billing",
  settings: "Settings",
  analytics: "Analytics",
  playground: "Playground",
  services: "Services",
  new: "Deploy",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
};

type Crumb = { label: string; href: string };

function buildBreadcrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let pathSoFar = "";

  for (const part of parts) {
    pathSoFar += `/${part}`;
    const label = segmentLabels[part];
    if (!label) {
      // Dynamic segment (e.g. a chatbot ID) — skip, parent label covers it
      continue;
    }
    crumbs.push({ label, href: pathSoFar });
  }

  return crumbs;
}

// ── Avatar helpers ───────────────────────────────────────────────────────────

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

// ── User menu dropdown ───────────────────────────────────────────────────────

type UserMenuProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = getInitials(user.name, user.email);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-text ring-1 ring-line transition-all duration-fast hover:ring-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User avatar"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby="user-menu-trigger"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface p-1 shadow-elevate-md"
        >
          {/* User info */}
          <div className="border-b border-line px-3 py-2.5">
            {user.name && (
              <p className="text-sm font-medium text-text truncate">{user.name}</p>
            )}
            {user.email && (
              <p className="text-xs text-muted truncate">{user.email}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="mt-1 space-y-0.5">
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
            >
              <User size={14} aria-hidden="true" />
              Account settings
            </Link>
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-danger"
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Topbar ───────────────────────────────────────────────────────────────────

type TopbarProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
  onMenuOpen: () => void;
};

export function Topbar({ user, onMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text md:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            {crumbs.length === 0 ? (
              <li className="text-text font-medium">Dashboard</li>
            ) : (
              crumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight
                      size={12}
                      className="text-muted/50"
                      aria-hidden="true"
                    />
                  )}
                  {i === crumbs.length - 1 ? (
                    <span
                      className="font-medium text-text"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className={cn(
                        "text-muted transition-colors duration-fast hover:text-text",
                        "hidden sm:inline"
                      )}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))
            )}
          </ol>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Link
          href="/services/new"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-hover px-2.5 py-1.5 text-xs font-semibold text-text transition-colors hover:border-accent hover:text-accent"
        >
          <Plus size={13} className="text-accent" />
          <span>New Service</span>
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  );
}