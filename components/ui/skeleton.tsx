// FEATURE: Base skeleton primitive — pulsing placeholder block used to build
// every page-specific loading state below. Restyle this one file later
// (e.g. shimmer instead of pulse) and every loading.tsx updates for free.
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-hover", className)} />;
}