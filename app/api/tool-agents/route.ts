// FEATURE: Create a Tool Chatbot — Service(type: TOOL) + ToolAgent together
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1).max(80) });

export async function GET() {
  try {
    const { orgId } = await requireOrg();
    const agents = await prisma.toolAgent.findMany({
      where: { service: { orgId } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tools: true } }, service: { include: { apiKeys: { where: { isActive: true } } } } },
    });
    return NextResponse.json({ toolAgents: agents });
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

    const service = await prisma.service.create({ data: { orgId, type: "TOOL", name: parsed.data.name } });
    const toolAgent = await prisma.toolAgent.create({ data: { serviceId: service.id, name: parsed.data.name } });

    return NextResponse.json({ toolAgent }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}