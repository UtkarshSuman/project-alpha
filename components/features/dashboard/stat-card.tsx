// ============================================================================
// FEATURE: StatCard component for dashboard metrics
// Displays key operational indicators with count-up animation, icons, and trends.
// Accepts icon as a serializable string identifier for RSC compatibility.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bot,
  Zap,
  MessageSquare,
  Key,
  Sparkles,
  Clock,
  HelpCircle,
  FileText,
  Layers,
  Users,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  bot: Bot,
  zap: Zap,
  message: MessageSquare,
  messages: MessageSquare,
  key: Key,
  keys: Key,
  sparkles: Sparkles,
  clock: Clock,
  help: HelpCircle,
  document: FileText,
  documents: FileText,
  layers: Layers,
  users: Users,
};

export type StatIcon =
  | "bot"
  | "zap"
  | "message"
  | "messages"
  | "key"
  | "keys"
  | "sparkles"
  | "clock"
  | "help"
  | "document"
  | "documents"
  | "layers"
  | "users"
  | string;

export type StatCardProps = {
  label: string;
  value: number | string;
  icon?: StatIcon;
  subtext?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
};

export function StatCard({
  label,
  value,
  icon = "bot",
  subtext,
  trend,
  className,
}: StatCardProps) {
  const isNumber = typeof value === "number";
  const [displayValue, setDisplayValue] = useState(isNumber ? 0 : value);

  // Determine icon component from serializable string
  const IconComponent =
    typeof icon === "string" ? ICON_MAP[icon.toLowerCase()] || Bot : Bot;

  // Smooth count-up effect for numeric metrics
  useEffect(() => {
    if (!isNumber) {
      setDisplayValue(value);
      return;
    }

    const target = value as number;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 600; // ms
    const steps = 24;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isNumber]);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-5",
        "transition-all duration-fast hover:border-line/80 hover:shadow-elevate-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted tracking-wide uppercase">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink ring-1 ring-line text-muted group-hover:text-accent transition-colors duration-fast">
          <IconComponent size={16} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-2xl font-bold text-text tracking-tight">
            {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
          </p>
          {trend && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                trend.positive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-muted/20 text-muted"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtext && <p className="mt-1 text-xs text-muted truncate">{subtext}</p>}
      </div>
    </div>
  );
}
