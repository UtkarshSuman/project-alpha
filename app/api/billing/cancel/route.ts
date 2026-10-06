// FEATURE: Cancel subscription — skips the real Razorpay cancel call when
// the subscription was created in mock mode (identifiable by its prefix).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { razorpay } from "@/lib/billing/razorpay";
import { PLAN_QUOTAS } from "@/lib/billing/plans";

export async function POST() {
  try {
    const { orgId } = await requireOrg();

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org?.razorpaySubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const isMockSubscription = org.razorpaySubscriptionId.startsWith("mock_sub_");
    if (!isMockSubscription) {
      await razorpay.subscriptions.cancel(org.razorpaySubscriptionId, undefined);
    }

    await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan: "FREE",
        planStatus: "cancelled",
        messageQuota: PLAN_QUOTAS.FREE,
        razorpaySubscriptionId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}