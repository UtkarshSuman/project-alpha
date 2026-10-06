// FEATURE: Sliding segmented switch between "Log in" / "Sign up" at the top
// of the auth card — local state only, arrow-key navigable (DESIGN.md §6:
// tabs use a sliding indicator, not a fade).
"use client";

type AuthMode = "login" | "register";

interface AuthTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") onChange("login");
    if (e.key === "ArrowRight") onChange("register");
  }

  return (
    <div
      role="tablist"
      aria-label="Sign in or create an account"
      onKeyDown={handleKeyDown}
      className="relative grid grid-cols-2 rounded-md border border-line bg-ink p-1"
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-sm border border-line bg-surface-hover transition-transform duration-base ease-in-out"
        style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(calc(100% + 0.5rem))" }}
      />
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        aria-controls="auth-panel"
        tabIndex={mode === "login" ? 0 : -1}
        onClick={() => onChange("login")}
        className="relative z-10 rounded-sm py-2 text-sm font-medium text-text transition-colors duration-fast"
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "register"}
        aria-controls="auth-panel"
        tabIndex={mode === "register" ? 0 : -1}
        onClick={() => onChange("register")}
        className="relative z-10 rounded-sm py-2 text-sm font-medium text-text transition-colors duration-fast"
      >
        Create account
      </button>
    </div>
  );
}
