// FEATURE: Marketing Layout — responsive layout using semantic theme tokens for light & dark mode
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-text antialiased selection:bg-accent/25 selection:text-text transition-colors duration-fast">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}