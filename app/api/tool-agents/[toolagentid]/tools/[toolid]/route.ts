// ============================================================================
// FEATURE: Individual tool definition — PATCH (toggle/edit), DELETE
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { z } from "zod";

type RouteParams = { params: Promise<{ toolagentid: string; toolid: string }> };

const updateToolSchema = z.object({
  name: z.string().regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only").max(64).optional(),
  description: z.string().min(1).max(500).optional(),
  method: z.enum(["GET", "POST"]).optional(),
  url: z.string().url().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  paramsSchema: z.object({}).passthrough().optional(),
  enabled: z.boolean().optional(),
});

async function assertOwnedTool(toolAgentId: string, toolId: string, orgId: string) {
  const tool = await prisma.toolDefinition.findUnique({
    where: { id: toolId },
    include: { toolAgent: { include: { service: true } } },
  });

  if (!tool || tool.toolAgentId !== toolAgentId || tool.toolAgent.service.orgId !== orgId) {
    return null;
  }
  return tool;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { toolagentid, toolid } = await params;
    const { orgId } = await requireOrg();
    const tool = await assertOwnedTool(toolagentid, toolid, orgId);
    if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = updateToolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.toolDefinition.update({
      where: { id: toolid },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.description ? { description: parsed.data.description } : {}),
        ...(parsed.data.method ? { method: parsed.data.method } : {}),
        ...(parsed.data.url ? { url: parsed.data.url } : {}),
        ...(parsed.data.headers !== undefined ? { headers: parsed.data.headers as any } : {}),
        ...(parsed.data.paramsSchema !== undefined ? { paramsSchema: parsed.data.paramsSchema as any } : {}),
        ...(parsed.data.enabled !== undefined ? { enabled: parsed.data.enabled } : {}),
      },
    });

    return NextResponse.json({ tool: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid, toolid } = await params;
    const { orgId } = await requireOrg();
    const tool = await assertOwnedTool(toolagentid, toolid, orgId);
    if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.toolDefinition.delete({ where: { id: toolid } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
