// FEATURE: Pricing page — plans mirror the Plan enum in prisma/schema.prisma
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FREE_PLAN_ENABLED, FREE_PLAN_MESSAGE_QUOTA } from "@/lib/billing/config";

type Plan = {
  name: string;
  price: string;
  quota: string;
  features: string[];
  highlighted?: boolean;
  unavailable?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    quota: `${FREE_PLAN_MESSAGE_QUOTA.toLocaleString()} messages/mo`,
    features: ["1 chatbot", "1 document", "Community support"],
    unavailable: !FREE_PLAN_ENABLED,
  },
  { name: "Starter", price: "$29", quota: "2,000 messages/mo", features: ["5 chatbots", "10 documents each", "Email support", "Remove branding"] },
  { name: "Pro", price: "$99", quota: "10,000 messages/mo", features: ["Unlimited chatbots", "Unlimited documents", "Priority support", "Analytics dashboard"], highlighted: true },
  { name: "Scale", price: "Custom", quota: "Custom volume", features: ["Dedicated infra", "SLA", "SSO", "Custom model routing"] },
];


export default function PricingPage() {
  return (
    <Container className="py-24">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold">Simple, usage-based pricing</h1>
        <p className="mt-4 text-muted">Pay for what your chatbots actually talk to. Upgrade anytime.</p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border p-6 ${plan.highlighted
                ? "border-[var(--accent)] bg-surface"
                : "border-line bg-surface"
              }`}
          >
            <h3 className="font-display text-lg font-medium">{plan.name}</h3>
            <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
            <p className="text-xs text-muted">{plan.quota}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {plan.features.map((f) => (
                <li key={f}>&bull; {f}</li>
              ))}
            </ul>
            {plan.unavailable ? (
              <p className="mt-8 text-center text-xs text-red-400">Currently unavailable for new signups</p>
            ) : (
              <Button href="/register" variant={plan.highlighted ? "primary" : "secondary"} className="mt-8 w-full">
                {plan.name === "Scale" ? "Contact sales" : "Get started"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}