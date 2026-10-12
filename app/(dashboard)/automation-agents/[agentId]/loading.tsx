// ============================================================================
// FEATURE: Automation Agent detail loading skeleton
// Mirrors the AutomationOverviewPage layout: header, lead feed, and keys section.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function AutomationAgentDetailLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Lead Activity Feed Card */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Feed rows */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-lg border border-line/60 bg-surface-hover/30"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Keys Section */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-line/60 bg-surface-hover/20"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32 font-mono" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
