// ============================================================================
// FEATURE: Chatbot list + create
// GET  /api/chatbots   -> list all SIMPLE chatbots in the caller's org
// POST /api/chatbots   -> create a new chatbot (status: DRAFT until a
//                          document is uploaded and ingestion completes)
//
// Free-plan cap counts FREE-plan Services across ALL types (RAG, Tool Agent,
// Automation), not just chatbots — see Service model. Plan/quota now live
// on Service, not Organization (per-service billing migration).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { createChatbotSchema } from "@/lib/validations/chatbot";
import { checkServiceCreationLimit } from "@/lib/billing/service-limits";
import { PLAN_QUOTAS } from "@/lib/billing/plans";

export async function GET() {
  try {
    const { orgId } = await requireOrg();

    const chatbots = await prisma.chatbot.findMany({
      where: { orgId, memoryType: "simple" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { documents: true } },
        service: { include: { _count: { select: { apiKeys: { where: { isActive: true } } } } } },
      },
    });

    return NextResponse.json({ chatbots });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();

    const body = await req.json().catch(() => null);
    const parsed = createChatbotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Enforce plan limits based on caller org's plan (PRO/SCALE are unlimited)
    const limitCheck = await checkServiceCreationLimit(orgId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error }, { status: 403 });
    }

    const service = await prisma.service.create({
      data: {
        orgId,
        type: "RAG",
        name: parsed.data.name,
        plan: limitCheck.plan,
        messageQuota: PLAN_QUOTAS[limitCheck.plan],
      },
    });

    const chatbot = await prisma.chatbot.create({
      data: {
        orgId,
        serviceId: service.id,
        name: parsed.data.name,
        memoryType: parsed.data.memoryType,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ chatbot }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}