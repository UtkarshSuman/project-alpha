// ============================================================================
// FEATURE: Stripe webhook handler — the actual source of truth for plan
// changes. plan changes must ONLY happen here, verified via Stripe's
// signature, never via a directly-callable route a user could hit themselves.
//
// Events handled:
// - checkout.session.completed   -> first-time subscribe: set plan + customer
// - customer.subscription.updated -> plan change (upgrade/downgrade), or
//                                     Stripe-side status changes
// - customer.subscription.deleted -> cancellation -> revert to FREE
// - invoice.payment_succeeded     -> renewal -> reset monthly usage counter
// - invoice.payment_failed        -> mark past_due so we can show a warning
// ============================================================================

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db/prisma";
import { planFromPriceId, PLAN_QUOTAS } from "@/lib/billing/plans";
import { Plan } from "@prisma/client";

async function getOrgIdFromCustomer(customerId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({ where: { stripeCustomerId: customerId } });
  return org?.id ?? null;
}

export async function POST(req: Request) {
  const body = await req.text(); // raw body required for signature verification
  const signature = (await headers()).get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        const subscriptionId = session.subscription as string;
        if (!orgId || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId) ?? "STARTER";

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            stripeSubscriptionId: subscriptionId,
            plan,
            planStatus: subscription.status,
            messageQuota: PLAN_QUOTAS[plan],
            messagesUsedThisPeriod: 0,
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId =
          subscription.metadata?.orgId ?? (await getOrgIdFromCustomer(subscription.customer as string));
        if (!orgId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId);
        if (!plan) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan,
            planStatus: subscription.status,
            messageQuota: PLAN_QUOTAS[plan],
            currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId =
          subscription.metadata?.orgId ?? (await getOrgIdFromCustomer(subscription.customer as string));
        if (!orgId) break;

        await prisma.organization.update({
          where: { id: orgId },
          data: {
            plan: "FREE" as Plan,
            planStatus: "canceled",
            messageQuota: PLAN_QUOTAS.FREE,
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const orgId = await getOrgIdFromCustomer(customerId);
        if (!orgId) break;

        // Renewal: reset the monthly usage counter for the new billing period
        await prisma.organization.update({
          where: { id: orgId },
          data: { messagesUsedThisPeriod: 0 },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const orgId = await getOrgIdFromCustomer(customerId);
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
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}