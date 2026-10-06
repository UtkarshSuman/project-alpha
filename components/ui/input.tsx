// FEATURE: Styled input — used across auth forms, dashboard settings, and dialogs.
// Adds error prop: shows danger-colored border + aria-invalid for screen readers.
// Pairs with a separate error message element (caller's responsibility) linked
// via aria-describedby for full a11y compliance.
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Error message string. When set, applies danger styling and aria-invalid. */
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={cn(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text",
        "placeholder:text-muted focus:outline-none transition-colors duration-fast",
        error
          ? "border-danger focus:border-danger"
          : "border-line focus:border-accent-2",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";