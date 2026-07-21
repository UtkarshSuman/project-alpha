// FEATURE: Billing page — current usage + plan tiers
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { QuotaBar } from "@/components/dashboard/quota-bar";
import { BillingPlanSwitcher } from "@/components/dashboard/billing-plan-switcher";

export default async function BillingPage() {
  const { orgId } = await requireOrg();

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Billing</h1>

      <div className="mt-8 rounded-lg border border-line bg-surface p-5">
        <h2 className="font-display text-sm font-medium">Current usage — {org.plan} plan</h2>
        <div className="mt-4">
          <QuotaBar used={org.messagesUsedThisPeriod} quota={org.messageQuota} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-lg font-medium">Plans</h2>
        <BillingPlanSwitcher currentPlan={org.plan} />
      </div>
    </div>
  );
}