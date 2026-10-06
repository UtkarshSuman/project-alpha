// FEATURE: Pricing page — plans mirror the Plan enum in prisma/schema.prisma and dashboard billing
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_ENABLED, FREE_PLAN_MESSAGE_QUOTA } from "@/lib/billing/config";
import { Check, Sparkles, Shield, Rocket, ArrowRight } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  cadence: string;
  quota: string;
  features: string[];
  highlighted?: boolean;
  unavailable?: boolean;
  description: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    cadence: "/month",
    quota: `${FREE_PLAN_MESSAGE_QUOTA.toLocaleString()} messages/mo`,
    description: "Ideal for experimenting with grounded RAG and custom tools.",
    features: [
      "1 Chatbot or Tool Agent",
      "Standard document ingestion",
      "Community support",
      "Basic API access",
    ],
    unavailable: !FREE_PLAN_ENABLED,
  },
  {
    name: "Starter",
    price: "₹2,400",
    cadence: "/month",
    quota: "2,000 messages/mo",
    description: "For startups shipping their first customer-facing AI agents.",
    features: [
      "5 Chatbots & Tool Agents",
      "2,000 messages per month",
      "Fast vector indexing",
      "Tool function calling",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "₹8,200",
    cadence: "/month",
    quota: "10,000 messages/mo",
    description: "Production teams scaling AI retrieval, tools, and analytics.",
    features: [
      "Unlimited Chatbots & Agents",
      "10,000 messages per month",
      "Hybrid RAG & re-ranking",
      "Custom domain & widget styling",
      "Team collaboration (unlimited)",
      "Priority response support",
    ],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "₹24,800",
    cadence: "/month",
    quota: "100,000 messages/mo",
    description: "High-volume workloads requiring dedicated capacity and SLAs.",
    features: [
      "100,000 messages per month",
      "Dedicated high-throughput index",
      "Custom LLM endpoints",
      "SSO & advanced audit logs",
      "99.9% uptime SLA",
      "Dedicated account manager",
    ],
  },
];

export default function PricingPage() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Predictable, Transparent Pricing
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-text">
          Plans built to scale with your AI services
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          Pay for the messages and tool runs your users actually make. No hidden seat fees, no lock-in. Switch or cancel anytime.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
              plan.highlighted
                ? "border-accent bg-surface shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                : "border-line bg-surface/50 hover:border-line/80 hover:bg-surface"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm">
                Most Popular
              </div>
            )}

            <div>
              <h3 className="font-display text-xl font-bold text-text">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed min-h-[32px]">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-text tracking-tight">{plan.price}</span>
                <span className="text-xs text-muted">{plan.cadence}</span>
              </div>

              <p className="mt-2 font-mono text-xs font-semibold text-accent">{plan.quota}</p>

              <div className="my-5 border-t border-line" />

              <div className="space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
                  Included capabilities
                </p>
                <ul className="space-y-2.5 text-xs text-muted">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-accent-2 mt-0.5" />
                      <span className="leading-snug text-text/80">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-line/60">
              {plan.unavailable ? (
                <p className="text-center text-xs text-red-400">Unavailable for new signups</p>
              ) : (
                <Button
                  href="/register"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full gap-2 text-xs font-semibold"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise callout */}
      <div className="mt-16 rounded-2xl border border-line bg-surface/60 p-8 text-center sm:p-10">
        <div className="mx-auto max-w-xl space-y-3">
          <Shield className="mx-auto h-8 w-8 text-accent-2" />
          <h2 className="font-display text-2xl font-bold text-text">Need custom volume or enterprise hosting?</h2>
          <p className="text-sm text-muted">
            We provide on-premise VPC deployments, HIPAA BAA agreements, custom LLM fine-tuning, and dedicated vector infrastructure for enterprise teams.
          </p>
          <div className="pt-2">
            <Button href="mailto:enterprise@uveriq.ai" variant="secondary" className="gap-2">
              Speak with Enterprise Team
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}