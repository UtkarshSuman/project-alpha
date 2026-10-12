// ============================================================================
// FEATURE: Loading state for billing page
// Mirrors the real BillingClient layout: header, quota bar card, and 4 plan cards.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>

      {/* Usage card skeleton */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Plans grid skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-3.5 w-36" />
                </div>
                <div className="pt-2 flex items-baseline gap-1.5">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="space-y-2.5 pt-3 border-t border-line/60">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3.5 w-36" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}