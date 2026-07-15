// FEATURE: Revoke an API key (soft-delete via isActive, keeps usage history)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ chatbotid: string; keyid: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid, keyid } = await params;
    const { orgId } = await requireOrg();

    const key = await prisma.apiKey.findUnique({
      where: { id: keyid },
      include: { chatbot: true },
    });

    if (!key || key.chatbotId !== chatbotid || key.chatbot.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Soft delete: keeps UsageLog history intact for analytics, just
    // deactivates future use — this is why isActive exists on the schema.
    await prisma.apiKey.update({ where: { id: keyid }, data: { isActive: false } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}