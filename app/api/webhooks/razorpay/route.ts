// ============================================================================
// FEATURE: Razorpay webhook handler — authoritative source of truth for
// subscription state, same reasoning as the Stripe version: renewals,
// failures, and cancellations initiated from Razorpay's side (or dashboard)
// need to reach us even when the user isn't actively in a checkout flow.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/billing/verify-signature";
import { planFromRazorpayPlanId, PLAN_QUOTAS } from "@/lib/billing/plans";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const subscription = event.payload.subscription.entity;
        const orgId = subscription.notes?.orgId;
        if (!orgId) break;

        const plan = planFromRazorpayPlanId(subscription.plan_id) ?? "STARTER";

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            razorpaySubscriptionId: subscription.id,
            plan,
            planStatus: "active",
            messageQuota: PLAN_QUOTAS[plan],
            // Reset usage on each successful charge (renewal), not on activation-only
            ...(event.event === "subscription.charged" ? { messagesUsedThisPeriod: 0 } : {}),
            currentPeriodEnd: subscription.current_end ? new Date(subscription.current_end * 1000) : undefined,
          },
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.completed": {
        const subscription = event.payload.subscription.entity;
        const orgId = subscription.notes?.orgId;
        if (!orgId) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: "FREE",
            planStatus: "cancelled",
            messageQuota: PLAN_QUOTAS.FREE,
            razorpaySubscriptionId: null,
          },
        });
        break;
      }

      case "subscription.pending":
      case "payment.failed": {
        const entity = event.payload.subscription?.entity ?? event.payload.payment?.entity;
        const orgId = entity?.notes?.orgId;
        if (!orgId) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: { planStatus: "past_due" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}