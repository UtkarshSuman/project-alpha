// ============================================================================
// FEATURE: Stripe Customer Portal — lets customers manage/cancel their
// subscription, update payment method, view invoices, all hosted by Stripe.
// POST /api/billing/portal
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { stripe } from "@/lib/billing/stripe";

export async function POST() {
  try {
    const { orgId } = await requireOrg();

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account yet — subscribe to a plan first" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

