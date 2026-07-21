// ============================================================================
// FEATURE: Plan display + DEV-ONLY switcher
// Shows all 4 plans with current one highlighted. "Switch" buttons call the
// dev-only /api/organization/plan route directly — clearly labeled so it's
// obvious this needs to become a real Stripe Checkout redirect later.
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plan } from "@prisma/client";

const plans: { id: Plan; name: string; price: string; quota: string }[] = [
  { id: "FREE", name: "Free", price: "$0", quota: "100 messages/mo" },
  { id: "STARTER", name: "Starter", price: "$29", quota: "2,000 messages/mo" },
  { id: "PRO", name: "Pro", price: "$99", quota: "10,000 messages/mo" },
  { id: "SCALE", name: "Scale", price: "Custom", quota: "100,000 messages/mo" },
];

export function BillingPlanSwitcher({ currentPlan }: { currentPlan: Plan }) {
  const router = useRouter();
  const [switching, setSwitching] = useState<Plan | null>(null);

  async function handleSwitch(plan: Plan) {
    setSwitching(plan);
    await fetch("/api/organization/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setSwitching(null);
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-accent">
        Dev mode: plan switching below is a placeholder for testing quotas — Stripe checkout replaces this before launch.
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-4 ${isCurrent ? "border-accent bg-surface" : "border-line bg-surface"}`}
            >
              <h3 className="font-display font-medium">{plan.name}</h3>
              <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
              <p className="text-xs text-muted">{plan.quota}</p>
              <Button
                onClick={() => handleSwitch(plan.id)}
                disabled={isCurrent || switching === plan.id}
                variant={isCurrent ? "secondary" : "primary"}
                className="mt-4 w-full"
              >
                {isCurrent ? "Current plan" : switching === plan.id ? "Switching..." : "Switch (dev)"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}