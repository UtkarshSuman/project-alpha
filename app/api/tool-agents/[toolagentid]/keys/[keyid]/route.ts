// ============================================================================
// FEATURE: Revoke an API key for Tool Agent (soft-delete via isActive)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ toolagentid: string; keyid: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid, keyid } = await params;
    const { orgId } = await requireOrg();

    const key = await prisma.apiKey.findUnique({
      where: { id: keyid },
      include: { service: { include: { toolAgent: true } } },
    });

    if (!key || key.service.toolAgent?.id !== toolagentid || key.service.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.apiKey.update({ where: { id: keyid }, data: { isActive: false } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
