import { prisma } from "@/lib/db/prisma";
import { Plan } from "@prisma/client";
import { FREE_PLAN_ENABLED, FREE_PLAN_CHATBOT_LIMIT } from "./config";
import { PLAN_QUOTAS } from "./plans";

export type ServiceLimitCheckResult =
  | { allowed: true; plan: Plan }
  | { allowed: false; error: string; plan: Plan };

/**
 * Checks whether an organization is permitted to create a new service (chatbot, tool agent, automation agent).
 *
 * Rules:
 * - PRO & SCALE: Unlimited services across all types.
 * - STARTER: Up to 5 services total.
 * - FREE: Up to FREE_PLAN_CHATBOT_LIMIT (default: 1) services total.
 *
 * Also ensures any existing services under the organization inherit the organization's current plan.
 */
export async function checkServiceCreationLimit(orgId: string): Promise<ServiceLimitCheckResult> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  });

  const plan: Plan = org?.plan ?? "FREE";

  // If the organization is on a paid plan, ensure all existing services are aligned with that plan
  if (plan !== "FREE") {
    await prisma.service.updateMany({
      where: { orgId, plan: { not: plan } },
      data: { plan, messageQuota: PLAN_QUOTAS[plan] },
    });
  }

  // PRO and SCALE tiers have unlimited services
  if (plan === "PRO" || plan === "SCALE") {
    return { allowed: true, plan };
  }

  // STARTER tier: up to 5 services
  if (plan === "STARTER") {
    const totalServices = await prisma.service.count({ where: { orgId } });
    const limit = 5;
    if (totalServices >= limit) {
      return {
        allowed: false,
        plan,
        error: `Starter plan is limited to ${limit} services total. Upgrade to Pro for unlimited services.`,
      };
    }
    return { allowed: true, plan };
  }

  // FREE tier
  if (!FREE_PLAN_ENABLED) {
    return {
      allowed: false,
      plan: "FREE",
      error: "The Free plan is currently unavailable. Please upgrade to a paid plan to create a service.",
    };
  }

  const totalServices = await prisma.service.count({ where: { orgId } });
  if (totalServices >= FREE_PLAN_CHATBOT_LIMIT) {
    return {
      allowed: false,
      plan: "FREE",
      error: `Free plan is limited to ${FREE_PLAN_CHATBOT_LIMIT} free service${FREE_PLAN_CHATBOT_LIMIT === 1 ? "" : "s"} total across all types. Upgrade to Pro for unlimited services.`,
    };
  }

  return { allowed: true, plan: "FREE" };
}

/**
 * Synchronizes all services of an organization to a specific plan and quota.
 */
export async function syncOrgServicesPlan(orgId: string, plan: Plan) {
  await prisma.service.updateMany({
    where: { orgId },
    data: {
      plan,
      messageQuota: PLAN_QUOTAS[plan],
    },
  });
}
