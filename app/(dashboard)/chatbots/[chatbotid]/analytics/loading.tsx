// ============================================================================
// FEATURE: Chatbot Analytics loading skeleton
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotAnalyticsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-line pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="rounded-lg border border-line bg-surface p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-md" />
      </div>

      {/* Two columns / tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}