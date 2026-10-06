// ============================================================================
// FEATURE: API keys for Tool Agents
// GET  /api/tool-agents/:toolagentid/keys   -> list keys (prefix only)
// POST /api/tool-agents/:toolagentid/keys   -> create key, returns raw key once
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/auth/api-key";

type RouteParams = { params: Promise<{ toolagentid: string }> };

async function assertOwnedToolAgent(toolagentid: string, orgId: string) {
  const agent = await prisma.toolAgent.findUnique({
    where: { id: toolagentid },
    include: { service: true },
  });
  if (!agent || agent.service.orgId !== orgId) return null;
  return agent;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid } = await params;
    const { orgId } = await requireOrg();
    const agent = await assertOwnedToolAgent(toolagentid, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const keys = await prisma.apiKey.findMany({
      where: { serviceId: agent.serviceId },
      select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keys });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { toolagentid } = await params;
    const { orgId } = await requireOrg();
    const agent = await assertOwnedToolAgent(toolagentid, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name: string = body.name || "Default key";

    const { raw, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: { serviceId: agent.serviceId, name, keyPrefix: prefix, keyHash: hash },
    });

    return NextResponse.json({ apiKey: { ...apiKey, rawKey: raw } }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
