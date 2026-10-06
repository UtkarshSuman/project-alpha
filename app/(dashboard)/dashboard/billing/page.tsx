// FEATURE: Billing page — passes billing mode + free-plan config down
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { QuotaBar } from "@/components/dashboard/quota-bar";
import { BillingPlanSwitcher } from "@/components/dashboard/billing-plan-switcher";
import { BILLING_MODE, FREE_PLAN_ENABLED, FREE_PLAN_MESSAGE_QUOTA } from "@/lib/billing/config";
import { CreditCard, AlertTriangle, Calendar, Layers } from "lucide-react";

export default async function BillingPage() {
  const { orgId } = await requireOrg();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  const used = org.messagesUsedThisPeriod;
  const quota = org.messageQuota;
  const percent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-accent" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text">
              Billing & Subscription
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Manage your organization tier, message quotas, and subscription details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-mono text-muted">
            Org: <span className="text-text font-semibold">{org.name}</span>
          </span>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold font-mono text-accent uppercase">
            {org.plan} Tier
          </span>
        </div>
      </div>

      {/* Past due alert */}
      {org.planStatus === "past_due" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-200">Payment Past Due</p>
            <p className="text-xs text-red-300/80">
              Your last subscription renewal charge was unsuccessful. Please update your payment method or retry payment to maintain continuous high-capacity LLM routing.
            </p>
          </div>
        </div>
      )}

      {/* Usage Telemetry Overview */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink border border-line text-accent">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-text">
                Current Period Message Quota
              </h2>
              <p className="text-xs text-muted">
                Counts user interactions, RAG embeddings, and tool executions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-lg font-bold text-text">{used.toLocaleString()}</span>
              <span className="text-muted"> / {quota.toLocaleString()} msgs</span>
            </div>
            <div className="rounded-lg border border-line bg-ink px-2.5 py-1 text-xs font-semibold text-accent">
              {percent}% consumed
            </div>
          </div>
        </div>

        <div className="mt-5">
          <QuotaBar used={used} quota={quota} />
        </div>

        {org.currentPeriodEnd && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5 text-muted" />
            <span>
              Next billing cycle reset on{" "}
              <strong className="text-text font-medium">
                {new Date(org.currentPeriodEnd).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Plan Switcher Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-text">Available Subscription Tiers</h2>
          <p className="text-xs text-muted">
            Upgrade or switch plans as your query volume and tool complexity scale.
          </p>
        </div>

        <BillingPlanSwitcher
          currentPlan={org.plan}
          billingMode={BILLING_MODE}
          hasActiveSubscription={!!org.razorpaySubscriptionId}
          freePlanEnabled={FREE_PLAN_ENABLED}
          freePlanQuota={FREE_PLAN_MESSAGE_QUOTA}
        />
      </div>
    </div>
  );
}