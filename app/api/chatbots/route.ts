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

export async function GET() {
  try {
    const { orgId } = await requireOrg();

    const chatbots = await prisma.chatbot.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { documents: true, apiKeys: true } },
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

    if (org?.plan === "FREE" && (org._count.chatbots ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Free plan is limited to 1 chatbot. Upgrade to create more." },
        { status: 403 }
      );
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