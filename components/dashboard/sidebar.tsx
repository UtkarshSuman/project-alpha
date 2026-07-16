// FEATURE: Dashboard sidebar navigation
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Bot, Settings, CreditCard } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/chatbots", label: "Chatbots", icon: Bot },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-surface md:block">
      <div className="p-5">
        <Link href="/" className="font-display text-lg font-semibold">
          docent<span className="text-accent">.</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
                active ? "bg-surface-hover text-text" : "text-muted hover:text-text"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}