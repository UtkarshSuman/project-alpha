// FEATURE: Styled input used across auth forms and dashboard settings
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text",
        "placeholder:text-muted focus:border-accent-2 focus:outline-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";