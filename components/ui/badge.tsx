// FEATURE: Small status badge — used for chatbot status (DRAFT/READY/etc)
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  READY: "bg-accent-2/10 text-accent-2",
  DRAFT: "bg-muted/10 text-muted",
  INGESTING: "bg-accent/10 text-accent",
  ERROR: "bg-red-500/10 text-red-400",
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status] ?? styles.DRAFT)}>
      {status.toLowerCase()}
    </span>
  );
}