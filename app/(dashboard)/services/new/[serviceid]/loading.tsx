// ============================================================================
// FEATURE: Service creation detail loading skeleton
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function NewServiceDetailLoading() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <Skeleton className="h-4 w-36" />

      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6 space-y-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6 space-y-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
