import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-line py-12">
      <Container className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">
            uveriq<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">
            &copy; {new Date().getFullYear()} Uveriq. AI services for retrieval, tool agents, and enterprise search.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/#services" className="hover:text-text">
            Services
          </Link>
          <Link href="/pricing" className="hover:text-text">
            Pricing
          </Link>
          <a href="mailto:uveriq@gmail.com" className="hover:text-text">
            Contact
          </a>
        </div>
      </Container>
    </footer>
  );
}
