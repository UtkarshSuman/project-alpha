"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-text transition-colors hover:text-accent"
        >
          uveriq<span className="text-accent">.</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <Link
            href="/#composer"
            className="transition-colors hover:text-text"
          >
            Platform
          </Link>
          <Link
            href="/services/new"
            className="transition-colors hover:text-text"
          >
            Services
          </Link>
          <Link
            href="/#developers"
            className="transition-colors hover:text-text"
          >
            Developers
          </Link>
          <Link
            href="/#composer"
            className="transition-colors hover:text-text"
          >
            Architecture
          </Link>
          <Link
            href="/#pricing"
            className="transition-colors hover:text-text"
          >
            Pricing
          </Link>
          <Link
            href="/chatbots"
            className="transition-colors hover:text-text"
          >
            Docs
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3.5 md:flex">
          <ThemeToggle />

          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-accent px-4 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
            >
              Go to dashboard
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted transition-colors hover:text-text"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-accent px-4 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Start building
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-text"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-line bg-surface px-4 pt-2 pb-6 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-3 pt-2 text-sm font-medium text-text">
            <Link
              href="/#composer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Platform
            </Link>
            <Link
              href="/services/new"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Services
            </Link>
            <Link
              href="/#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Developers
            </Link>
            <Link
              href="/#composer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Architecture
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Pricing
            </Link>
            <Link
              href="/chatbots"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-hover hover:text-text"
            >
              Docs
            </Link>

            <div className="pt-3 border-t border-line flex flex-col gap-2">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-accent text-xs font-semibold text-white shadow-sm"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-line bg-surface text-xs font-semibold text-text"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-accent text-xs font-semibold text-white shadow-sm"
                  >
                    Start building
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
