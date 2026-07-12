// FEATURE: Auth layout — centered card, no navbar/footer distraction during signup
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-lg font-semibold">
          docent<span className="text-accent">.</span>
        </Link>
        <div className="rounded-lg border border-line bg-surface p-8">{children}</div>
      </div>
    </div>
  );
}