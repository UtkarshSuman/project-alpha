// FEATURE: Marketing site navbar
// FEATURE: Marketing navbar — now session-aware. Logged-in visitors see
// "Go to dashboard" instead of Sign in/Start free.
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          docent<span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
          <Link href="/#how-it-works" className="hover:text-text">How it works</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Button href="/chatbots" variant="primary">Go to dashboard</Button>
          ) : (
            <>
              <Button href="/login" variant="ghost">Sign in</Button>
              <Button href="/register" variant="primary">Start free</Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}