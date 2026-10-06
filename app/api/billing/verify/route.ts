// ============================================================================
// FEATURE: Verify a completed checkout — called by the frontend immediately
// after the Razorpay modal reports success. This is where we ACTUALLY trust
// the payment (via signature check), not just because the modal closed
// without error — a closed modal alone proves nothing.
//
// This updates the org optimistically for instant UI feedback; the webhook
// (below) is still the authoritative source of truth for anything that
// happens outside this exact flow (renewals, failures, cancellations).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { verifyPaymentSignature } from "@/lib/billing/verify-signature";
import { PLAN_QUOTAS } from "@/lib/billing/plans";
import { Plan } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();

    const body = await req.json().catch(() => null);
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, plan } = body ?? {};

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
    }

    const isValid = verifyPaymentSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const typedPlan = plan as Plan;

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        razorpaySubscriptionId: razorpay_subscription_id,
        plan: typedPlan,
        planStatus: "active",
        messageQuota: PLAN_QUOTAS[typedPlan],
        messagesUsedThisPeriod: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}