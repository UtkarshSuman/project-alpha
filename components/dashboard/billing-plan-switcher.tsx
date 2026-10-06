"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plan } from "@prisma/client";
import { useToast } from "@/lib/hooks/use-toast";
import { Check, Zap, Sparkles, Shield, Rocket, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanDefinition {
  id: Plan;
  name: string;
  price: string;
  cadence: string;
  quota: string;
  popular?: boolean;
  features: string[];
  purchasable: boolean;
}

const plans: PlanDefinition[] = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    cadence: "/month",
    quota: "100 messages/mo",
    purchasable: false,
    features: [
      "1 Chatbot or Tool Agent",
      "Standard document ingestion",
      "Community support",
      "Basic API access",
    ],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "₹2,400",
    cadence: "/month",
    quota: "2,000 messages/mo",
    purchasable: true,
    features: [
      "5 Chatbots & Tool Agents",
      "2,000 messages per month",
      "Fast vector indexing",
      "Tool function calling",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹8,200",
    cadence: "/month",
    quota: "10,000 messages/mo",
    popular: true,
    purchasable: true,
    features: [
      "Unlimited Chatbots & Agents",
      "10,000 messages per month",
      "Hybrid RAG & re-ranking",
      "Custom domain & widget styling",
      "Team collaboration (unlimited)",
      "Priority response support",
    ],
  },
  {
    id: "SCALE",
    name: "Scale",
    price: "₹24,800",
    cadence: "/month",
    quota: "100,000 messages/mo",
    purchasable: true,
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

export function BillingPlanSwitcher({
  currentPlan,
  billingMode,
  hasActiveSubscription,
  freePlanEnabled,
  freePlanQuota,
}: {
  currentPlan: Plan;
  billingMode: "mock" | "razorpay";
  hasActiveSubscription: boolean;
  freePlanEnabled: boolean;
  freePlanQuota: number;
}) {
  const { toast } = useToast();
  const [scriptLoaded, setScriptLoaded] = useState(billingMode === "mock");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (billingMode !== "razorpay") return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [billingMode]);

  async function handleUpgrade(plan: Plan) {
    setLoadingPlan(plan);

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoadingPlan(null);
        toast({
          title: "Subscription failed",
          description: data.error ?? "Failed to initialize checkout",
          variant: "error",
        });
        return;
      }

      // Mock mode: org was updated server-side
      if (data.mock) {
        toast({
          title: "Plan upgraded",
          description: `Successfully upgraded to the ${plan} plan (Mock mode).`,
          variant: "success",
        });
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      if (!scriptLoaded) {
        setLoadingPlan(null);
        toast({
          title: "Gateway loading",
          description: "Razorpay payment checkout is still loading. Please try again.",
          variant: "warning",
        });
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Uveriq",
        description: `${plan} Plan Subscription`,
        prefill: { email: data.email },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan }),
          });
          if (verifyRes.ok) {
            toast({
              title: "Payment confirmed",
              description: `You are now on the ${plan} plan!`,
              variant: "success",
            });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast({
              title: "Verification issue",
              description: "Payment captured but verification failed. Please contact support.",
              variant: "error",
            });
            setLoadingPlan(null);
          }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
        theme: { color: "#f59e0b" },
      });
      rzp.open();
    } catch {
      setLoadingPlan(null);
      toast({
        title: "Network error",
        description: "Could not contact billing service.",
        variant: "error",
      });
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your active subscription? You will retain access until the end of your billing cycle.")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: "Cancellation failed",
          description: data.error ?? "Failed to cancel subscription",
          variant: "error",
        });
        setCancelling(false);
        return;
      }

      toast({
        title: "Subscription cancelled",
        description: "Your workspace has been moved to the Free plan.",
        variant: "success",
      });
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast({
        title: "Error",
        description: "Network error while cancelling subscription.",
        variant: "error",
      });
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      {billingMode === "mock" && (
        <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-xs text-accent">
          <Zap className="h-4 w-4 shrink-0 text-accent" />
          <div className="flex-1">
            <span className="font-semibold uppercase tracking-wider">Mock Billing Active:</span>{" "}
            Instant tier simulation without payment gateway charges. Production deployments automatically connect to Razorpay.
          </div>
        </div>
      )}

      {hasActiveSubscription && (
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface/50 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent-2" />
            <div>
              <p className="text-sm font-medium text-text">Active Recurring Subscription</p>
              <p className="text-xs text-muted">Manage your renewal or downgrade your workspace.</p>
            </div>
          </div>
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            loading={cancelling}
            className="text-muted hover:text-red-400 hover:bg-red-500/10 text-xs"
          >
            Cancel Subscription
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isFreeDisabled = plan.id === "FREE" && !freePlanEnabled;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                plan.popular
                  ? "border-accent bg-surface/80 shadow-[0_0_24px_rgba(245,158,11,0.08)]"
                  : isCurrent
                  ? "border-accent-2 bg-surface/80 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
                  : "border-line bg-surface/40 hover:border-line/80 hover:bg-surface/70"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-text">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-accent-2/15 border border-accent-2/30 px-2 py-0.5 text-[10px] font-semibold text-accent-2 uppercase">
                      Current
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-text">{plan.price}</span>
                  <span className="text-xs text-muted">{plan.cadence}</span>
                </div>

                <p className="mt-2 text-xs font-mono text-accent">
                  {plan.id === "FREE" ? `${freePlanQuota.toLocaleString()} messages/mo` : plan.quota}
                </p>

                {isFreeDisabled && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Unavailable for new workspaces</span>
                  </div>
                )}

                <div className="my-5 border-t border-line" />

                <div className="space-y-2.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
                    What's included
                  </p>
                  <ul className="space-y-2 text-xs text-muted">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 text-accent-2 mt-0.5" />
                        <span className="leading-snug text-text/80">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60">
                {plan.purchasable ? (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || isLoading || (billingMode === "razorpay" && !scriptLoaded)}
                    loading={isLoading}
                    variant={isCurrent ? "secondary" : plan.popular ? "primary" : "secondary"}
                    className="w-full gap-2 text-xs font-semibold"
                  >
                    {isCurrent ? (
                      "Current Plan"
                    ) : (
                      <>
                        <Rocket className="h-3.5 w-3.5" />
                        Upgrade to {plan.name}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={true}
                    variant="ghost"
                    className="w-full text-xs text-muted cursor-default border border-line/40"
                  >
                    {isCurrent ? "Active Plan" : "Default Starter"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}