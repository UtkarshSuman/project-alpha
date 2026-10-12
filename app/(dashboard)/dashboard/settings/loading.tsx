// ============================================================================
// FEATURE: Loading state for workspace settings page
// Matches the real SettingsForm layout: header, Organization profile card, and
// Account information card.
// ============================================================================

import { Skeleton } from "@/components/ui/skeleton";

export default function OrgSettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6 mt-6">
        {/* Organization Card */}
        <div className="rounded-2xl border border-line bg-surface p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-line/60">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-44" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>

            <div className="pt-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="rounded-2xl border border-line bg-surface p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-line/60">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-36" />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}