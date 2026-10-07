// FEATURE: Dashboard sidebar — desktop collapsible rail + mobile off-canvas drawer.
// Desktop: toggles between full (w-56) and icon-rail (w-14) modes.
// Mobile: off-canvas drawer (fixed overlay, slides in from left).
// Branding updated to "Uveriq" per product name decision (2026-10-02).
// Active state: bg-surface-hover + accent-colored icon — no colored left stripe
// (prohibited by DESIGN.md §11).
"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  X,
  Workflow,
  MessageSquare,
  Clock,
  Database,
} from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
};

type NavSubItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
};

const navSections: { label: string; links: NavLink[] }[] = [
  {
    label: "Platform",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutGrid },
      {
        href: "/chatbots",
        label: "Chatbots",
        icon: Bot,
        subItems: [
          { href: "/chatbots", label: "Simple", icon: MessageSquare },
          { href: "/chatbots/short-term", label: "Short-term", icon: Clock },
          { href: "/chatbots/long-term", label: "Long-term", icon: Database },
        ],
      },
      { href: "/tool-agents", label: "Tool Agents", icon: Zap },
      { href: "/automation-agents", label: "Automations", icon: Workflow },
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

function isSubItemActive(subHref: string, currentPath: string): boolean {
  if (subHref === "/chatbots/short-term") {
    return (
      currentPath === "/chatbots/short-term" ||
      currentPath.startsWith("/chatbots/short-term/")
    );
  }
  if (subHref === "/chatbots/long-term") {
    return (
      currentPath === "/chatbots/long-term" ||
      currentPath.startsWith("/chatbots/long-term/")
    );
  }
  if (subHref === "/chatbots") {
    return (
      currentPath === "/chatbots" ||
      (currentPath.startsWith("/chatbots/") &&
        !currentPath.startsWith("/chatbots/short-term") &&
        !currentPath.startsWith("/chatbots/long-term") &&
        !currentPath.startsWith("/chatbots/overview"))
    );
  }
  return currentPath === subHref || currentPath.startsWith(subHref + "/");
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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

function NavDropdownItem({
  item,
  collapsed,
  currentPath,
  onClose,
}: {
  item: NavLink;
  collapsed: boolean;
  currentPath: string;
  onClose?: () => void;
}) {
  const isParentActive = currentPath.startsWith(item.href);
  const [isOpen, setIsOpen] = useState(() => isParentActive);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentPath.startsWith(item.href)) {
      setIsOpen(true);
    }
  }, [currentPath, item.href]);

  useEffect(() => {
    setPopoverOpen(false);
  }, [collapsed]);

  const handleRailClick = () => {
    if (!popoverOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverPos({
        top: Math.max(8, rect.top),
        left: rect.right + 8,
      });
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  };

  const Icon = item.icon;

  if (collapsed) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleRailClick}
          title={item.label}
          aria-label={item.label}
          aria-haspopup="true"
          aria-expanded={popoverOpen}
          className={cn(
            "group flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-fast outline-none",
            "focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-1",
            isParentActive
              ? "bg-surface-hover text-text"
              : "text-muted hover:bg-surface-hover hover:text-text"
          )}
        >
          <Icon
            size={16}
            className={cn(
              "shrink-0 transition-colors duration-fast",
              isParentActive ? "text-accent" : "text-muted group-hover:text-text"
            )}
            aria-hidden="true"
          />
        </button>

        {popoverOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setPopoverOpen(false)}
            />
            <div
              style={{ top: popoverPos.top, left: popoverPos.left }}
              className="fixed z-50 w-44 rounded-lg border border-line bg-surface p-1.5 shadow-xl animate-in fade-in zoom-in-95"
            >
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                {item.label}
              </div>
              <div className="space-y-0.5">
                {item.subItems?.map((sub) => {
                  const active = isSubItemActive(sub.href, currentPath);
                  const SubIcon = sub.icon;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => {
                        setPopoverOpen(false);
                        onClose?.();
                      }}
                      className={cn(
                        "group flex h-8 items-center gap-2 rounded-md px-2 text-xs transition-colors duration-fast outline-none",
                        "focus-visible:ring-2 focus-visible:ring-accent-2",
                        active
                          ? "bg-surface-hover text-accent font-medium"
                          : "text-muted hover:bg-surface-hover hover:text-text"
                      )}
                    >
                      <SubIcon
                        size={13}
                        className={cn(
                          "shrink-0 transition-colors duration-fast",
                          active ? "text-accent" : "text-muted group-hover:text-text"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "group flex w-full items-center rounded-md transition-colors duration-fast outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-1",
          "h-9 gap-2.5 px-3",
          isParentActive
            ? "bg-surface-hover text-text"
            : "text-muted hover:bg-surface-hover hover:text-text"
        )}
      >
        <Icon
          size={16}
          className={cn(
            "shrink-0 transition-colors duration-fast",
            isParentActive ? "text-accent" : "text-muted group-hover:text-text"
          )}
          aria-hidden="true"
        />
        <span className="truncate text-sm">{item.label}</span>
        <ChevronDown
          size={14}
          className={cn(
            "ml-auto shrink-0 text-muted transition-transform duration-200 group-hover:text-text",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && item.subItems && (
        <div
          role="group"
          aria-label={`${item.label} services`}
          className="ml-4 pl-3.5 border-l border-line/60 space-y-0.5 py-1"
        >
          {item.subItems.map((sub) => {
            const active = isSubItemActive(sub.href, currentPath);
            const SubIcon = sub.icon;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onClose}
                className={cn(
                  "group flex h-7 items-center gap-2 rounded-md px-2 text-xs transition-colors duration-fast outline-none",
                  "focus-visible:ring-2 focus-visible:ring-accent-2",
                  active
                    ? "bg-surface-hover text-accent font-medium"
                    : "text-muted hover:bg-surface-hover hover:text-text"
                )}
              >
                <SubIcon
                  size={12}
                  className={cn(
                    "shrink-0 transition-colors duration-fast",
                    active ? "text-accent" : "text-muted/70 group-hover:text-text"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{sub.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
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
              {section.links.map((link) =>
                link.subItems ? (
                  <NavDropdownItem
                    key={link.href}
                    item={link}
                    collapsed={collapsed && !isMobile}
                    currentPath={pathname}
                    onClose={onClose}
                  />
                ) : (
                  <NavItem
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    active={isActive(link.href)}
                    collapsed={collapsed && !isMobile}
                    onClick={onClose}
                  />
                )
              )}
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