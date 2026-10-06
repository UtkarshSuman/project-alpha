// FEATURE: API keys for automation agents — identical pattern to chatbot keys
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/auth/api-key";

type RouteParams = { params: Promise<{ agentId: string }> };

async function getOwned(agentId: string, orgId: string) {
  const agent = await prisma.automationAgent.findUnique({ where: { id: agentId } });
  if (!agent || (await prisma.service.findUnique({ where: { id: agent.serviceId } }))?.orgId !== orgId) return null;
  return agent;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { orgId } = await requireOrg();
    const agent = await getOwned(agentId, orgId);
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
    const { agentId } = await params;
    const { orgId } = await requireOrg();
    const agent = await getOwned(agentId, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name: string = body.name || "Default key";
    const { raw, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({ data: { serviceId: agent.serviceId, name, keyPrefix: prefix, keyHash: hash } });
    return NextResponse.json({ apiKey: { ...apiKey, rawKey: raw } }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}