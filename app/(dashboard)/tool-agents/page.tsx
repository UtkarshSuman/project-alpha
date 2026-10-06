// ============================================================================
// FEATURE: Tool Agents list page
// Server component directly queries Prisma for tool agents belonging to the
// current organization, passing initial data to ToolAgentsClient.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ToolAgentsClient } from "./tool-agents-client";

export default async function ToolAgentsPage() {
  const { orgId } = await requireOrg();

  const agents = await prisma.toolAgent.findMany({
    where: { service: { orgId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      model: true,
      _count: { select: { tools: true } },
      service: {
        select: {
          apiKeys: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  }).catch(() => []);

  return <ToolAgentsClient initialAgents={agents} />;
}
