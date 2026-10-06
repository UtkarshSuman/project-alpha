// FEATURE: Manage individual API tools attached to a Tool Chatbot
// CRUD for individual tool definitions
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { z } from "zod";

type RouteParams = { params: Promise<{ toolagentid: string }> };

const toolSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only").max(64),
  description: z.string().min(1).max(500),
  method: z.enum(["GET", "POST"]),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  paramsSchema: z.object({}).passthrough(), // JSON Schema object — validated loosely here
});

async function assertOwned(toolAgentId: string, orgId: string) {
  const agent = await prisma.toolAgent.findUnique({ where: { id: toolAgentId }, include: { service: true } });
  if (!agent || agent.service.orgId !== orgId) return null;
  return agent;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid: toolAgentId } = await params;
    const { orgId } = await requireOrg();
    const agent = await assertOwned(toolAgentId, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const tools = await prisma.toolDefinition.findMany({
      where: { toolAgentId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ tools });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { toolagentid: toolAgentId } = await params;
    const { orgId } = await requireOrg();
    const agent = await assertOwned(toolAgentId, orgId);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = toolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const tool = await prisma.toolDefinition.create({
      data: {
        toolAgentId,
        name: parsed.data.name,
        description: parsed.data.description,
        method: parsed.data.method,
        url: parsed.data.url,
        headers: (parsed.data.headers ?? undefined) as any,
        paramsSchema: parsed.data.paramsSchema as any,
      },
    });

    return NextResponse.json({ tool }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}