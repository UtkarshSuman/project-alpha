// ============================================================================
// FEATURE: Plan display — handles both mock mode (instant activation, no
// Razorpay modal) and real mode (Checkout.js). This replaces the earlier
// ad-hoc "Switch (dev)" button entirely — mock mode now covers that need
// in a way that's structurally identical to the real flow, so there's only
// one upgrade code path to reason about, not two parallel systems.
// ============================================================================
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plan } from "@prisma/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans: { id: Plan; name: string; price: string; quota: string; purchasable: boolean }[] = [
  { id: "FREE", name: "Free", price: "₹0", quota: "varies", purchasable: false },
  { id: "STARTER", name: "Starter", price: "₹2,400", quota: "2,000 messages/mo", purchasable: true },
  { id: "PRO", name: "Pro", price: "₹8,200", quota: "10,000 messages/mo", purchasable: true },
  { id: "SCALE", name: "Scale", price: "₹24,800", quota: "100,000 messages/mo", purchasable: true },
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
  const [scriptLoaded, setScriptLoaded] = useState(billingMode === "mock"); // no script needed in mock mode
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

    const res = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoadingPlan(null);
      alert(data.error ?? "Something went wrong");
      return;
    }

    // Mock mode: the org was already updated server-side, nothing more to do.
    if (data.mock) {
      window.location.reload();
      return;
    }

    if (!scriptLoaded) {
      setLoadingPlan(null);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "Docent",
      description: `${plan} plan subscription`,
      prefill: { email: data.email },
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/billing/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, plan }),
        });
        if (verifyRes.ok) window.location.reload();
        else alert("Payment succeeded but verification failed — contact support.");
      },
      modal: { ondismiss: () => setLoadingPlan(null) },
      theme: { color: "#f2a93b" },
    });
    rzp.open();
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You'll be moved to the Free plan.")) return;
    setCancelling(true);
    await fetch("/api/billing/cancel", { method: "POST" });
    setCancelling(false);
    window.location.reload();
  }

  return (
    <div>
      {billingMode === "mock" && (
        <div className="mb-4 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-accent">
          Mock billing mode — no real payments are processed. Set BILLING_MODE=razorpay once your account is activated (always real in production).
        </div>
      )}

      {hasActiveSubscription && (
        <div className="mb-4">
          <Button onClick={handleCancel} variant="secondary" disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel subscription"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isFreeDisabled = plan.id === "FREE" && !freePlanEnabled;

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-4 ${isCurrent ? "border-accent bg-surface" : "border-line bg-surface"}`}
            >
              <h3 className="font-display font-medium">{plan.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
              <p className="text-xs text-muted">
                {plan.id === "FREE" ? `${freePlanQuota.toLocaleString()} messages/mo` : plan.quota}
              </p>
              {isFreeDisabled && (
                <p className="mt-2 text-xs text-red-400">Unavailable for new signups</p>
              )}

              {plan.purchasable && (
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loadingPlan === plan.id || (billingMode === "razorpay" && !scriptLoaded)}
                  variant={isCurrent ? "secondary" : "primary"}
                  className="mt-4 w-full"
                >
                  {isCurrent ? "Current plan" : loadingPlan === plan.id ? "Processing..." : "Upgrade"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}