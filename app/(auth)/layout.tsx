// FEATURE: Auth layout — two-column card shell (form left, visual right).
// Image panel is desktop-only (hidden < lg) — intentional per "desktop-focused"
// priority; forms alone remain fully usable on smaller screens.
import Link from "next/link";
import { AuthVisualPanel } from "@/components/features/auth/auth-visual-panel";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink px-5 py-6 text-text sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center font-display text-lg font-semibold tracking-tight transition-colors duration-fast hover:text-accent"
          >
            uveriq<span className="text-accent">.</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="grid flex-1 overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[minmax(420px,0.86fr)_minmax(0,1.14fr)]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-md">{children}</div>
          </div>
          <AuthVisualPanel className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
