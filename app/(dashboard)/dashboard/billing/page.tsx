// FEATURE: Billing page — passes billing mode + free-plan config down
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { QuotaBar } from "@/components/dashboard/quota-bar";
import { BillingPlanSwitcher } from "@/components/dashboard/billing-plan-switcher";
import { BILLING_MODE, FREE_PLAN_ENABLED, FREE_PLAN_MESSAGE_QUOTA } from "@/lib/billing/config";

export default async function BillingPage() {
  const { orgId } = await requireOrg();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Billing</h1>

      {org.planStatus === "past_due" && (
        <div className="mt-4 rounded-md border border-red-900/50 bg-red-950/10 px-4 py-3 text-sm text-red-400">
          Your last payment failed. Please retry payment to avoid service interruption.
        </div>
      )}

      <div className="mt-8 rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-sm font-medium">Current usage — {org.plan} plan</h2>
        <div className="mt-4">
          <QuotaBar used={org.messagesUsedThisPeriod} quota={org.messageQuota} />
        </div>
        {org.currentPeriodEnd && (
          <p className="mt-2 text-xs text-muted">Renews {new Date(org.currentPeriodEnd).toLocaleDateString()}</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-lg font-medium">Plans</h2>
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