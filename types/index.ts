// FEATURE: Shared UI prop types — used across components/ui/* so every
// primitive (button, input, badge, card...) speaks the same vocabulary
// instead of redefining "size"/"variant" per component.

/** Standard size scale used by button, input, badge, avatar, spinner, etc. */
export type Size = "sm" | "md" | "lg";

/**
 * Standard visual-intent scale, mapped to DESIGN.md §2/§6:
 * - primary: the one committed action per view (amber)
 * - secondary: surface fill + border
 * - ghost: transparent, text-only
 * - accent: cyan-accent variant for secondary/informational actions
 * - danger: destructive actions only
 */
export type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";

/** Semantic status used by badges, chatbot status, invite status, etc. */
export type Status = "success" | "warning" | "danger" | "neutral";

/** Shared shape for any primitive that supports a pending/async state. */
export interface Loadable {
  isLoading?: boolean;
}

/** Shared shape for any primitive that supports an error/invalid state. */
export interface Validatable {
  isInvalid?: boolean;
  errorMessage?: string;
}

/**
 * Polymorphic "render as" prop, for primitives that need to render as a
 * different element/component (e.g. Button as="a" for link-styled buttons)
 * without losing prop types.
 */
export type WithAsChild<T extends React.ElementType = "button"> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;