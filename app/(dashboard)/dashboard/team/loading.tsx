// ============================================================================
// FEATURE: Loading state for team page
// Mirrors the TeamPageClient layout: header, invite button, and members list.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-4 w-80 sm:w-96" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Members List Table Card */}
      <div className="rounded-xl border border-line bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-line/60">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="divide-y divide-line/40">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}