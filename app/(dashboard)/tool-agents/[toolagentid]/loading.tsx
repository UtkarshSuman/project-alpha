// ============================================================================
// FEATURE: Tool Agent detail loading skeleton
// Matches the ToolAgentDetailClient layout: back button, header, 4 tabs, and
// tools definition cards.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ToolAgentDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Skeleton className="h-4 w-36" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-4 border-b border-line pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Main Content Area: Tools panel */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Tool Cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-6 w-14 rounded-md" />
                  <Skeleton className="h-5 w-44" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-2 flex items-center gap-3">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
