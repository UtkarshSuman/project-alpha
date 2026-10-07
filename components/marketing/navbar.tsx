"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-blue-600"
        >
          uveriq<span className="text-blue-600">.</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/#composer"
            className="transition-colors hover:text-slate-900"
          >
            Platform
          </Link>
          <Link
            href="/services/new"
            className="transition-colors hover:text-slate-900"
          >
            Services
          </Link>
          <Link
            href="/#developers"
            className="transition-colors hover:text-slate-900"
          >
            Developers
          </Link>
          <Link
            href="/#composer"
            className="transition-colors hover:text-slate-900"
          >
            Architecture
          </Link>
          <Link
            href="/#pricing"
            className="transition-colors hover:text-slate-900"
          >
            Pricing
          </Link>
          <Link
            href="/chatbots"
            className="transition-colors hover:text-slate-900"
          >
            Docs
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              Go to dashboard
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                Start building
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-6 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-3 pt-2 text-sm font-medium text-slate-700">
            <Link
              href="/#composer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Platform
            </Link>
            <Link
              href="/services/new"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Services
            </Link>
            <Link
              href="/#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Developers
            </Link>
            <Link
              href="/#composer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Architecture
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Pricing
            </Link>
            <Link
              href="/chatbots"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Docs
            </Link>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {session ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm"
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
