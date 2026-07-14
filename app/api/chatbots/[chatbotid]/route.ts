// ============================================================================
// FEATURE: Single chatbot — get / update settings / delete
// GET    /api/chatbots/:chatbotid
// PATCH  /api/chatbots/:chatbotid   -> update name, system prompt, branding,
//                                       guardrails (used by the settings page)
// DELETE /api/chatbots/:chatbotid   -> cascades to documents, chunks, keys
//                                       (see schema onDelete: Cascade)
//
// SECURITY: every handler verifies the chatbot belongs to the caller's org
// before returning/mutating it — never trust the :chatbotid path param alone,
// or org A could read/edit org B's chatbot just by guessing an id.
// ============================================================================
// ============================================================================
// FEATURE: Single chatbot — get / update settings / delete
// GET    /api/chatbots/:chatbotid
// PATCH  /api/chatbots/:chatbotid
// DELETE /api/chatbots/:chatbotid   -> cascades to documents, chunks, keys
//
// Next.js 15+/16: dynamic route params are now async (Promise-wrapped) in
// route handlers too, not just pages — must `await params` before use.
//
// SECURITY: every handler verifies the chatbot belongs to the caller's org
// before returning/mutating it — never trust the :chatbotid path param alone.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { updateChatbotSchema } from "@/lib/validations/chatbot";

type RouteParams = { params: Promise<{ chatbotid: string }> };

async function getOwnedChatbot(chatbotid: string, orgId: string) {
  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId) return null;
  return chatbot;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();

    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotid },
      include: {
        documents: true,
        apiKeys: {
          select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true },
        },
      },
    });

    if (!chatbot || chatbot.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ chatbot });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();

    const owned = await getOwnedChatbot(chatbotid, orgId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = updateChatbotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const chatbot = await prisma.chatbot.update({
      where: { id: chatbotid },
      data: parsed.data,
    });

    return NextResponse.json({ chatbot });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();

    const owned = await getOwnedChatbot(chatbotid, orgId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.chatbot.delete({ where: { id: chatbotid } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}