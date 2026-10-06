// FEATURE: Activity feed data — polled by the dashboard for live updates
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ agentId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { orgId } = await requireOrg();

    const agent = await prisma.automationAgent.findUnique({ where: { id: agentId }, include: { service: true } });
    if (!agent || agent.service.orgId !== orgId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const leads = await prisma.leadRecord.findMany({
      where: { automationAgentId: agentId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ leads });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}