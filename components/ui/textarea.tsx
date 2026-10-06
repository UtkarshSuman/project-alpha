// FEATURE: Textarea — styled to match Input exactly so form sections feel
// cohesive. Accepts same error prop pattern as Input for consistent validation UX.
import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Error message. When set, applies danger border styling and aria-invalid. */
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={cn(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text",
        "placeholder:text-muted focus:outline-none transition-colors duration-fast",
        "resize-y min-h-[80px]",
        error
          ? "border-danger focus:border-danger"
          : "border-line focus:border-accent-2",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
