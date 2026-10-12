// ============================================================================
// FEATURE: Loading skeleton for short-term chatbot playground tab
// Matches the exact interactive playground structure.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function ShortTermChatbotPlaygroundLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Skeleton className="h-4 w-32" />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-line pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Playground Console Box */}
      <div className="flex h-[640px] flex-col rounded-2xl border border-line bg-surface shadow-sm overflow-hidden">
        {/* Playground Top Bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-hover/30">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* Notice Bar */}
        <div className="flex items-center gap-2 border-b border-line/40 px-5 py-2.5">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3.5 w-96" />
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Welcome Assistant Message */}
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-16 w-80 rounded-2xl" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="space-y-1.5 flex flex-col items-end">
              <Skeleton className="h-12 w-64 rounded-2xl" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>

          {/* Assistant Reply with Sources */}
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="space-y-2">
              <div className="rounded-2xl border border-line bg-surface-hover/80 p-4 space-y-2 w-80 sm:w-[460px]">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-4/6" />
                <div className="pt-2 flex gap-2">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-line p-3.5 bg-surface flex items-center gap-2.5">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
