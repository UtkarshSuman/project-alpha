// FEATURE: Button component with brand variants
// Built in Frontend Section
import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

const variants = {
  primary:
    "text-accent text-ink font-semibold hover:brightness-110",
  secondary:
    "bg-surface text-text border border-line hover:bg-surface-hover",
  ghost:
    "text-muted hover:text-text",
};

export function Button({ children, href, variant = "primary", className, onClick, type = "button" }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm transition-colors",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}