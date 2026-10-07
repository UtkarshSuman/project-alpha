// ============================================================================
// FEATURE: Short-term chatbots list loading skeleton
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ShortTermChatbotsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Grid of chatbot cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <div className="border-t border-line/40 pt-3 flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
