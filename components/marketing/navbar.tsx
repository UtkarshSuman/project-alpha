// FEATURE: Marketing site navbar
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          docent<span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
          <Link href="/#how-it-works" className="hover:text-[var(--text)]">How it works</Link>
          <Link href="/#faq" className="hover:text-text">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/login" variant="ghost">Sign in</Button>
          <Button href="/register" variant="primary">Start free</Button>
        </div>
      </Container>
    </header>
  );
}