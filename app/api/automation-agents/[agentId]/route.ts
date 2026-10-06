// FEATURE: Single automation agent — get/update/delete
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { z } from "zod";

type RouteParams = { params: Promise<{ agentId: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  qualificationCriteria: z.string().min(1).max(2000).optional(),
  redFlags: z.string().max(1000).optional(),
  followUpTone: z.string().min(1).max(500).optional(),
  notifyEmail: z.string().email().optional().or(z.literal("")),
  widgetTitle: z.string().max(60).optional(),
  widgetColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  successMessage: z.string().max(300).optional(),
  allowedOrigins: z.string().max(1000).optional(),
});

async function getOwned(agentId: string, orgId: string) {
  const agent = await prisma.automationAgent.findUnique({ where: { id: agentId }, include: { service: true } });
  if (!agent || agent.service.orgId !== orgId) return null;
  return agent;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { orgId } = await requireOrg();
    const agent = await getOwned(agentId, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ automationAgent: agent });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { orgId } = await requireOrg();
    const owned = await getOwned(agentId, orgId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const [agent] = await prisma.$transaction([
      prisma.automationAgent.update({ where: { id: agentId }, data: parsed.data }),
      ...(parsed.data.name ? [prisma.service.update({ where: { id: owned.serviceId }, data: { name: parsed.data.name } })] : []),
    ]);

    return NextResponse.json({ automationAgent: agent });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { orgId } = await requireOrg();
    const owned = await getOwned(agentId, orgId);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.service.delete({ where: { id: owned.serviceId } }); // cascades everything
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}