// ============================================================================
// FEATURE: Chatbot list + create
// GET  /api/chatbots   -> list all chatbots in the caller's org
// POST /api/chatbots   -> create a new chatbot (status: DRAFT until a
//                          document is uploaded and ingestion completes)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { createChatbotSchema } from "@/lib/validations/chatbot";
import { FREE_PLAN_ENABLED, FREE_PLAN_CHATBOT_LIMIT } from "@/lib/billing/config";

export async function GET() {
  try {
    const { orgId } = await requireOrg();

    const chatbots = await prisma.chatbot.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            documents: true,
            apiKeys: { where: { isActive: true } },
          },
        },
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

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { chatbots: true } } },
    });

    // Enforce free-plan limits — fully configurable via env, see
    // lib/billing/config.ts. Set FREE_PLAN_CHATBOT_LIMIT=0 (or
    // FREE_PLAN_ENABLED=false) to stop free orgs creating chatbots at all.
    if (org?.plan === "FREE") {
      if (!FREE_PLAN_ENABLED || FREE_PLAN_CHATBOT_LIMIT <= 0) {
        return NextResponse.json(
          { error: "The Free plan is currently unavailable. Please upgrade to a paid plan to create a chatbot." },
          { status: 403 }
        );
      }
      if ((org._count.chatbots ?? 0) >= FREE_PLAN_CHATBOT_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan is limited to ${FREE_PLAN_CHATBOT_LIMIT} chatbot${FREE_PLAN_CHATBOT_LIMIT === 1 ? "" : "s"}. Upgrade to create more.`,
          },
          { status: 403 }
        );
      }
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        orgId,
        name: parsed.data.name,
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