// ============================================================================
// FEATURE: Chatbot Settings loading skeleton
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotSettingsLoading() {
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

      {/* Form sections */}
      <div className="space-y-6 max-w-4xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-64" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}