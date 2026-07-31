// ============================================================================
// FEATURE: Create a Stripe Checkout session for upgrading to a paid plan
// POST /api/billing/checkout  body: { plan: "STARTER" | "PRO" | "SCALE" }
//
// - Reuses an existing Stripe customer if the org already has one
//   (e.g. downgrading then re-upgrading), otherwise creates one
// - orgId is attached as metadata on BOTH the session and the subscription,
//   so the webhook handler can look up which org this belongs to regardless
//   of which event type it receives first
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";
import { PLAN_TO_PRICE_ID } from "@/lib/billing/plans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Plan } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();
    const session = await getServerSession(authOptions);

    const body = await req.json().catch(() => null);
    const plan = body?.plan as Plan | undefined;

    if (!plan || !PLAN_TO_PRICE_ID[plan]) {
      return NextResponse.json({ error: "Invalid or unpurchasable plan" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let stripeCustomerId = org.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session?.user?.email ?? undefined,
        metadata: { orgId },
      });
      stripeCustomerId = customer.id;
      await prisma.organization.update({ where: { id: orgId }, data: { stripeCustomerId } });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: PLAN_TO_PRICE_ID[plan]!, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
      metadata: { orgId, plan },
      subscription_data: { metadata: { orgId, plan } },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
