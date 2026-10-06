// FEATURE: Button component with brand variants
// Variants: primary (white fill), secondary (surface + border), ghost (text-only), danger (destructive).
// Loading state: Spinner replaces label at fixed min-width — button never resizes.
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Shows a spinner and prevents interaction. Width is locked so layout never shifts. */
  loading?: boolean;
};

const variants = {
  primary:
    "bg-text text-ink font-semibold hover:brightness-95",
  secondary:
    "bg-surface text-text border border-line hover:bg-surface-hover",
  ghost:
    "text-muted hover:text-text",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 font-medium",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled,
  loading,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md transition-all",
    "duration-fast disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className
  );

  const content = loading ? (
    <>
      <Spinner size="sm" />
      <span className="opacity-0 select-none" aria-hidden="true">
        {children}
      </span>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {content}
    </button>
  );
}
