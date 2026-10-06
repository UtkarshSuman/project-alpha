"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bot, Box, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Service } from "@/data/services";

const iconMap: Record<string, LucideIcon> = {
  Bot,
  Zap,
};

export function ServiceCard({ service }: { service: Service }) {
  const { data: session } = useSession();
  const router = useRouter();

  const Icon = iconMap[service.icon] || Box;
  const isAvailable = service.status === "available";

  function handleClick() {
    if (!isAvailable) return;

    const targetUrl = `/services/new/${service.id}`;

    if (session) {
      router.push(targetUrl);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "group relative min-h-[244px] rounded-md border border-line bg-surface p-5 text-left transition duration-base",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
        isAvailable
          ? "cursor-pointer hover:-translate-y-1 hover:border-accent-2/50 hover:bg-surface-hover"
          : "cursor-default opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md"
          style={{ backgroundColor: `${service.accentColor}1A` }}
        >
          <Icon size={19} style={{ color: service.accentColor }} />
        </div>

        {service.status === "coming-soon" && (
          <span className="rounded-sm bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Soon
          </span>
        )}
        {service.status === "beta" && (
          <span className="rounded-sm bg-accent-2/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-2">
            Beta
          </span>
        )}
      </div>

      <h3 className="mt-8 font-display text-xl font-medium tracking-tight">{service.name}</h3>
      <p className="mt-2 text-sm leading-6 text-text">{service.tagline}</p>
      <p className="mt-3 text-xs leading-5 text-muted">{service.description}</p>

      {isAvailable && (
        <span className="mt-7 inline-flex text-sm font-semibold text-accent-2 transition-transform duration-fast group-hover:translate-x-1">
          Get started
        </span>
      )}
    </button>
  );
}
