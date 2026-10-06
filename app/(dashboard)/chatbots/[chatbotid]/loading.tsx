// ============================================================================
// FEATURE: Chatbot detail loading skeleton
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button + Header */}
      <div>
        <Skeleton className="h-4 w-28 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex gap-4 border-b border-line pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Documents section */}
      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Embed snippet section */}
      <div className="space-y-3 pt-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}