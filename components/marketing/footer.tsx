// FEATURE: Marketing site footer
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-muted md:flex-row">
        <p>&copy; {new Date().getFullYear()} Docent. Built for people who write good docs.</p>
        <div className="flex gap-6">
          <a href="/pricing" className="hover:text-text">Pricing</a>
          <a href="mailto:hello@docent.chat" className="hover:text-text">Contact</a>
        </div>
      </Container>
    </footer>
  );
}