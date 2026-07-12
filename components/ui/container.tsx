// FEATURE: Consistent max-width wrapper used on every page
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}