// FEATURE: Create/list automation agents — mirrors tool-agents pattern
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { FREE_PLAN_ENABLED, FREE_PLAN_CHATBOT_LIMIT } from "@/lib/billing/config";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1).max(80) });

export async function GET() {
  try {
    const { orgId } = await requireOrg();
    const agents = await prisma.automationAgent.findMany({
      where: { service: { orgId } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true } }, service: { include: { apiKeys: { where: { isActive: true } } } } },
    });
    return NextResponse.json({ automationAgents: agents });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrg();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const freeServiceCount = await prisma.service.count({ where: { orgId, plan: "FREE" } });
    if (freeServiceCount >= FREE_PLAN_CHATBOT_LIMIT) {
      return NextResponse.json(
        { error: FREE_PLAN_ENABLED ? `Free plan is limited to ${FREE_PLAN_CHATBOT_LIMIT} free service(s) total.` : "Free plan is currently unavailable." },
        { status: 403 }
      );
    }

    const service = await prisma.service.create({ data: { orgId, type: "AUTOMATION", name: parsed.data.name } });
    const agent = await prisma.automationAgent.create({ data: { serviceId: service.id, name: parsed.data.name } });

    return NextResponse.json({ automationAgent: agent }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}