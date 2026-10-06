// ============================================================================
// FEATURE: Create a Razorpay subscription — or, in mock mode, activate the
// plan directly without touching Razorpay at all. See lib/billing/config.ts.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { razorpay } from "@/lib/billing/razorpay";
import { PLAN_TO_RAZORPAY_PLAN_ID, PLAN_QUOTAS } from "@/lib/billing/plans";
import { BILLING_MODE } from "@/lib/billing/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Plan } from "@prisma/client";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();
    const session = await getServerSession(authOptions);

    const body = await req.json().catch(() => null);
    const plan = body?.plan as Plan | undefined;

    if (!plan || !PLAN_TO_RAZORPAY_PLAN_ID[plan]) {
      return NextResponse.json({ error: "Invalid or unpurchasable plan" }, { status: 400 });
    }

    // --- MOCK MODE: activate directly, no Razorpay call at all. Only
    // reachable when BILLING_MODE=mock, which is itself forced to
    // "razorpay" in production — see lib/billing/config.ts.
    if (BILLING_MODE === "mock") {
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          razorpaySubscriptionId: `mock_sub_${nanoid()}`,
          plan,
          planStatus: "active",
          messageQuota: PLAN_QUOTAS[plan],
          messagesUsedThisPeriod: 0,
        },
      });
      return NextResponse.json({ mock: true });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: PLAN_TO_RAZORPAY_PLAN_ID[plan]!,
      customer_notify: 1,
      total_count: 12,
      notes: { orgId, plan },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      email: session?.user?.email,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}