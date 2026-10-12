// ============================================================================
// FEATURE: Automation Agents list loading skeleton
// Mirrors the AutomationClient layout: header and automation cards.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function AutomationAgentsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80 sm:w-96" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Grid of Automation Agent Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5 space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-3 pt-3 border-t border-line/60">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
