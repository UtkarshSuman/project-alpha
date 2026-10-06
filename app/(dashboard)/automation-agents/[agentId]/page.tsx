import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { LeadActivityFeed } from "@/components/dashboard/lead-activity-feed";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AutomationKeysSection } from "@/components/dashboard/automation-keys-section";

export default async function AutomationOverviewPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const { orgId } = await requireOrg();

  const agent = await prisma.automationAgent.findUnique({ where: { id: agentId }, include: { service: true } });
  if (!agent || agent.service.orgId !== orgId) notFound();

  const leads = await prisma.leadRecord.findMany({ where: { automationAgentId: agentId }, orderBy: { createdAt: "desc" }, take: 50 });

  const keys = await prisma.apiKey.findMany({
    where: { serviceId: agent.serviceId },
    select: { id: true, name: true, keyPrefix: true, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{agent.name}</h1>
        <Link href={`/automation-agents/${agentId}/settings`}><Button variant="secondary">Settings</Button></Link>
      </div>
      <div className="mt-8">
        <LeadActivityFeed agentId={agentId} initialLeads={leads.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))} />
      </div>
      <div className="mt-10">
        <AutomationKeysSection agentId={agentId} serviceId={agent.serviceId} initialKeys={keys} />
      </div>
    </div>
  );
}