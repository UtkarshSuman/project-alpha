// FEATURE: Dashboard sidebar — desktop collapsible rail + mobile off-canvas drawer.
// Desktop: toggles between full (w-56) and icon-rail (w-14) modes.
// Mobile: off-canvas drawer (fixed overlay, slides in from left).
// Branding updated to "Uveriq" per product name decision (2026-10-02).
// Active state: bg-surface-hover + accent-colored icon — no colored left stripe
// (prohibited by DESIGN.md §11).
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Bot,
  Zap,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
};

const navSections = [
  {
    label: "Platform",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutGrid },
      { href: "/chatbots", label: "Chatbots", icon: Bot },
      { href: "/tool-agents", label: "Tool Agents", icon: Zap },
    ],
  },
  {
    label: "Workspace",
    links: [
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-md transition-colors duration-fast outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-1",
        collapsed ? "h-9 w-9 justify-center" : "h-9 gap-2.5 px-3",
        active
          ? "bg-surface-hover text-text"
          : "text-muted hover:bg-surface-hover hover:text-text"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "shrink-0 transition-colors duration-fast",
          active ? "text-accent" : "text-muted group-hover:text-text"
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <span className="truncate text-sm">{label}</span>
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onCollapseToggle,
  onClose,
  isMobile,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header: logo + mobile close */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-line",
          collapsed && !isMobile ? "justify-center px-0" : "justify-between px-4"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "font-display font-semibold transition-colors duration-fast hover:text-accent",
            collapsed && !isMobile ? "text-lg" : "text-base"
          )}
        >
          {collapsed && !isMobile ? (
            <span>
              U<span className="text-accent">.</span>
            </span>
          ) : (
            <span>
              Uveriq<span className="text-accent">.</span>
            </span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-fast hover:bg-surface-hover hover:text-text"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed || isMobile ? (
              <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted/60">
                {section.label}
              </p>
            ) : (
              <div className="mb-1 h-px mx-2 bg-line" />
            )}
            <div
              className={cn(
                "space-y-0.5",
                collapsed && !isMobile ? "px-2.5" : "px-2"
              )}
            >
              {section.links.map(({ href, label, icon }) => (
                <NavItem
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={isActive(href)}
                  collapsed={collapsed && !isMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <div className="shrink-0 border-t border-line p-2">
          <button
            onClick={onCollapseToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-8 items-center rounded-md text-muted transition-colors duration-fast",
              "hover:bg-surface-hover hover:text-text",
              collapsed ? "w-8 justify-center" : "w-full gap-2 px-2"
            )}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onCollapseToggle,
}: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-line bg-surface",
          "transition-all duration-base",
          collapsed ? "w-14" : "w-56"
        )}
        aria-label="Sidebar"
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapseToggle={onCollapseToggle}
        />
      </aside>

      {/* ── Mobile: backdrop + drawer ────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink/60 md:hidden"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface md:hidden"
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            <SidebarContent
              collapsed={false}
              onCollapseToggle={onCollapseToggle}
              onClose={onMobileClose}
              isMobile
            />
          </aside>
        </>
      )}
    </>
  );
}