// ============================================================================
// FEATURE: Reusable quota usage progress indicator
// Color shifts as quota approaches exhaustion (<75% accent, 75-90% warning, >=90% danger).
// Smooth animated transition on mount and value changes.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertCircle, ArrowUpRight } from "lucide-react";

type QuotaBarProps = {
  used: number;
  quota: number;
  showDetails?: boolean;
  plan?: string;
  className?: string;
};

export function QuotaBar({
  used,
  quota,
  showDetails = true,
  plan,
  className,
}: QuotaBarProps) {
  const [mounted, setMounted] = useState(false);
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  useEffect(() => {
    // Slight delay to trigger CSS transition on first render
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const isWarning = pct >= 75 && pct < 90;
  const isDanger = pct >= 90;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-text">
          <span>
            {used.toLocaleString()} / {quota.toLocaleString()} messages
          </span>
          {plan && (
            <span className="text-muted font-normal">
              ({plan.toLowerCase()} plan)
            </span>
          )}
        </div>
        <span
          className={cn(
            "font-mono font-semibold",
            isDanger ? "text-danger" : isWarning ? "text-amber-400" : "text-muted"
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-ink/60 ring-1 ring-line">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-slow ease-out",
            isDanger
              ? "bg-danger"
              : isWarning
              ? "bg-amber-400"
              : "bg-accent"
          )}
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>

      {/* Status Details / Warning CTA */}
      {showDetails && (
        <div className="flex items-center justify-between pt-0.5 text-[11px]">
          {isDanger ? (
            <p className="flex items-center gap-1 text-danger font-medium">
              <AlertCircle size={12} />
              Quota exceeded or critically low
            </p>
          ) : isWarning ? (
            <p className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle size={12} />
              Approaching monthly limit
            </p>
          ) : (
            <p className="text-muted">Good standing for current billing cycle</p>
          )}

          {pct >= 75 && (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
            >
              Upgrade plan <ArrowUpRight size={11} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}