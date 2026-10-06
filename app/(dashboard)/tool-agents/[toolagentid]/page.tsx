// ============================================================================
// FEATURE: Tool Agent detail page
// Loads agent data, attached tool definitions, and scoped API keys.
// ============================================================================

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ToolAgentDetailClient } from "@/components/features/tool-agents/tool-agent-detail-client";

export default async function ToolAgentDetailPage({
  params,
}: {
  params: Promise<{ toolagentid: string }>;
}) {
  const { toolagentid } = await params;
  const { orgId } = await requireOrg();

  const agent = await prisma.toolAgent.findUnique({
    where: { id: toolagentid },
    include: {
      service: {
        include: {
          apiKeys: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              keyPrefix: true,
              isActive: true,
              lastUsedAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      tools: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!agent || agent.service.orgId !== orgId) {
    notFound();
  }

  return <ToolAgentDetailClient agent={agent as any} />;
}
