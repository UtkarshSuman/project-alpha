import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { AutomationClient } from "./automation-client";

export default async function AutomationAgentsPage() {
  const { orgId } = await requireOrg();
  const agents = await prisma.automationAgent.findMany({
    where: { service: { orgId } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });
  return <AutomationClient initialAgents={agents} />;
}