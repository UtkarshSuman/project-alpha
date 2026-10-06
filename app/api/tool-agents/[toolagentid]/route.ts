// ============================================================================
// FEATURE: Single tool agent — GET, PATCH (settings), DELETE
// Belongs to Service (type: TOOL). All operations check organization ownership.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { z } from "zod";

type RouteParams = { params: Promise<{ toolagentid: string }> };

const updateToolAgentSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  systemPrompt: z.string().max(4000).optional(),
  model: z.string().min(1).max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  widgetTitle: z.string().max(80).optional(),
  widgetColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be valid hex code").optional(),
  welcomeMessage: z.string().max(500).optional(),
  allowedOrigins: z.string().max(2000).nullable().optional(),
});

async function getOwnedToolAgent(toolagentid: string, orgId: string) {
  const agent = await prisma.toolAgent.findUnique({
    where: { id: toolagentid },
    include: {
      service: {
        include: {
          apiKeys: {
            select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      tools: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!agent || agent.service.orgId !== orgId) return null;
  return agent;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid } = await params;
    const { orgId } = await requireOrg();

    const agent = await getOwnedToolAgent(toolagentid, orgId);
    if (!agent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ toolAgent: agent });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { toolagentid } = await params;
    const { orgId } = await requireOrg();

    const agent = await getOwnedToolAgent(toolagentid, orgId);
    if (!agent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateToolAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const toolAgent = await tx.toolAgent.update({
        where: { id: toolagentid },
        data: parsed.data,
      });

      if (parsed.data.name) {
        await tx.service.update({
          where: { id: agent.serviceId },
          data: { name: parsed.data.name },
        });
      }

      return toolAgent;
    });

    return NextResponse.json({ toolAgent: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { toolagentid } = await params;
    const { orgId } = await requireOrg();

    const agent = await getOwnedToolAgent(toolagentid, orgId);
    if (!agent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cascade deletion through Service
    await prisma.service.delete({ where: { id: agent.serviceId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
