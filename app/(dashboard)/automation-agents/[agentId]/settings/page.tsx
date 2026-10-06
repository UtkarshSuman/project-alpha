import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { AutomationSettingsForm } from "@/components/dashboard/automation-settings-form";

export default async function AutomationSettingsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const { orgId } = await requireOrg();

  const agent = await prisma.automationAgent.findUnique({ where: { id: agentId }, include: { service: true } });
  if (!agent || agent.service.orgId !== orgId) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{agent.name} — Settings</h1>
      <div className="mt-8">
        <AutomationSettingsForm
          agentId={agentId}
          initial={{
            name: agent.name,
            qualificationCriteria: agent.qualificationCriteria,
            redFlags: agent.redFlags ?? "",
            followUpTone: agent.followUpTone,
            notifyEmail: agent.notifyEmail ?? "",
            widgetTitle: agent.widgetTitle,
            widgetColor: agent.widgetColor,
            successMessage: agent.successMessage,
          }}
        />
      </div>
    </div>
  );
}