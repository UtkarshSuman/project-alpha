import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { HeroSection } from "@/components/marketing/home/hero-section";
import { FeaturesTicker } from "@/components/marketing/home/features-ticker";
import { ServiceLifecycle } from "@/components/marketing/home/service-lifecycle";
import { DeveloperExperience } from "@/components/marketing/home/developer-experience";
import { CapabilitiesGrid } from "@/components/marketing/home/capabilities-grid";
import { ServiceComposer } from "@/components/marketing/home/service-composer";
import { ConversationDemo } from "@/components/marketing/home/conversation-demo";
import { ObservabilitySection } from "@/components/marketing/home/observability-section";
import { PricingSection } from "@/components/marketing/home/pricing-section";
import { CtaBanner } from "@/components/marketing/home/cta-banner";

export const metadata = {
  title: "Uveriq — Build AI services that actually do something.",
  description:
    "Build, connect, deploy, and scale AI services from one platform — from intelligent retrieval and tool-using agents to automated workflows and real-time business operations.",
};

export default async function MarketingHomePage() {
  const session = await getServerSession(authOptions);
  const ctaHref = session ? "/dashboard" : "/register";
  const ctaLabel = session ? "Go to dashboard" : "Start building";

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section: Headline, CTAs, and Interactive Central Hub Architecture Graph */}
      <HeroSection ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* 2. Features Ticker: Multi-service, API-first, Production-ready, Observable */}
      <FeaturesTicker />

      {/* 3. The Service Lifecycle: DEFINE -> CONNECT -> DEPLOY -> EXECUTE -> OBSERVE -> SCALE */}
      <ServiceLifecycle />

      {/* 4. Developer Experience: Side-by-side Live cURL and JSON Response Terminals */}
      <div id="developers">
        <DeveloperExperience />
      </div>

      {/* 5. One Platform. Many Kinds of Intelligence: 6 Bento Capability Cards */}
      <CapabilitiesGrid />

      {/* 6. Service Composer: Interactive Architecture Node Diagram (Inputs -> Core -> Endpoints) */}
      <ServiceComposer />

      {/* 7. Conversational Surface: Interactive Chat Widget with Memory Lifecycles */}
      <ConversationDemo />

      {/* 8. Observability: Real-Time Telemetry Dashboard, Hourly Latency Curve, & Logs */}
      <ObservabilitySection />

      {/* 9. Transparent Pricing: 4 Tiers (Developer, Builder, Scale, Enterprise) */}
      <PricingSection />

      {/* 10. High-Contrast Bottom CTA Banner */}
      <CtaBanner ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </div>
  );
}
