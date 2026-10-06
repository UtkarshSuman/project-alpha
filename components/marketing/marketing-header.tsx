"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          uveriq<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/#services" className="transition-colors duration-fast hover:text-text">
            Services
          </Link>
          <Link href="/pricing" className="transition-colors duration-fast hover:text-text">
            Pricing
          </Link>
          <Link href="/#how-it-works" className="transition-colors duration-fast hover:text-text">
            Platform
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Button href="/chatbots" variant="primary">
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </Button>
              <Button href="/register" variant="primary">
                Start free
              </Button>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-muted md:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className={cn("block h-px w-4 bg-current transition duration-fast", open && "translate-y-[5px] rotate-45")} />
              <span className={cn("block h-px w-4 bg-current transition duration-fast", open && "opacity-0")} />
              <span className={cn("block h-px w-4 bg-current transition duration-fast", open && "-translate-y-[5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </Container>

      {open && (
        <div id="marketing-mobile-nav" className="border-t border-line bg-ink md:hidden">
          <Container className="flex flex-col gap-4 py-4 text-sm">
            <Link href="/#services" onClick={() => setOpen(false)} className="text-muted hover:text-text">
              Services
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-muted hover:text-text">
              Pricing
            </Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)} className="text-muted hover:text-text">
              Platform
            </Link>
            {!signedIn && (
              <Link href="/login" onClick={() => setOpen(false)} className="text-muted hover:text-text">
                Sign in
              </Link>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
