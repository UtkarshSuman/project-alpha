// ============================================================================
// FEATURE: DEV-ONLY plan switcher — lets you test different plan tiers and
// their quota/rate-limit behavior right now, without Stripe set up.
//
// ⚠️ REMOVE OR GATE THIS ROUTE before going to production. Once billing.ts
// section is built with real Stripe checkout + webhooks, plan changes must
// ONLY happen via a verified Stripe webhook (checkout.session.completed /
// customer.subscription.updated), never via a direct client-callable route
// like this one — otherwise any logged-in user could grant themselves a
// paid plan for free by just calling this endpoint.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { Plan } from "@prisma/client";

const PLAN_QUOTAS: Record<Plan, number> = {
  FREE: 100,
  STARTER: 2000,
  PRO: 10000,
  SCALE: 100000,
};

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();

    const body = await req.json().catch(() => null);
    const plan = body?.plan as Plan | undefined;

    if (!plan || !(plan in PLAN_QUOTAS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan,
        messageQuota: PLAN_QUOTAS[plan],
        messagesUsedThisPeriod: 0, // reset on plan change for clean dev testing
      },
    });

    return NextResponse.json({ organization: org });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}