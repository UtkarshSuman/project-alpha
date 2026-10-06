// FEATURE: EmptyState — used whenever a list or data view has zero items.
// Design rules (DESIGN.md §6): centered, small monochrome icon, one-line
// heading, one-line supporting copy, single primary action. Never sarcastic
// or jokey copy. Matter-of-fact and helpful.
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  /** SVG icon or any React element. Keep it monochrome — color is applied by the component. */
  icon?: React.ReactNode;
  heading: string;
  description?: string;
  /** Primary action button or link — caller passes a fully formed Button or Link. */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  heading,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-muted">
          {icon}
        </div>
      )}
      <p className="font-display text-base font-medium text-text">{heading}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
