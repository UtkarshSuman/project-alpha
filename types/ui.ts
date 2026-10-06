// FEATURE: Shared UI type definitions — used across components/ui/* and
// any feature component that needs these primitives. Adding types here once
// means every component gets them without redefining.

export type Size = "sm" | "md" | "lg";
export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type ToastType = "success" | "error" | "info" | "warning";

// Toast record — created by toast() helper, consumed by <Toaster />
export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  /** Auto-dismiss delay in ms. Default 3500. Pass Infinity to never dismiss. */
  duration?: number;
}

// Generic polymorphic-helper type used by components that accept an `as` prop
export type WithAsChild<T extends object = {}> = T & {
  asChild?: boolean;
};
