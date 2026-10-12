// ============================================================================
// FEATURE: Services catalog loading skeleton
// Mirrors the ServicesCatalogPage: header with badge, and catalog cards.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesCatalogLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Grid of service cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-line bg-surface/70 p-6 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="pt-4 border-t border-line/60">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
