// FEATURE: Dashboard overview — placeholder until Chatbots section is built.
// Empty state follows the "invitation to act" principle, not a blank page.
// FEATURE: Dashboard overview — redirects to /chatbots for now.
// A real analytics overview (usage graphs, recent conversations) gets built
// here in the Analytics section later. Redirecting avoids a dead-end page
// in the meantime.
// ============================================================================
// FEATURE: Dashboard overview — org-level summary, distinct from /chatbots
// (which is just the list). Shows quota usage, aggregate stats across all
// chatbots, and recent chatbots — the "how is my account doing" view.
// ============================================================================

import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Gauge } from "lucide-react";

export default async function DashboardOverview() {
  const { orgId } = await requireOrg();

  const [org, chatbots, totalMessages] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.chatbot.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { documents: true, apiKeys: true } } },
    }),
    prisma.message.count({
      where: { conversation: { chatbot: { orgId } }, role: "user" },
    }),
  ]);

  if (!org) return null;

  const quotaPct = org.messageQuota > 0 ? Math.min(100, Math.round((org.messagesUsedThisPeriod / org.messageQuota) * 100)) : 0;
  const totalChatbots = await prisma.chatbot.count({ where: { orgId } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <Button href="/chatbots">View all chatbots</Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-muted">
            <Bot size={15} /> <span className="text-xs">Chatbots</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">{totalChatbots}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-muted">
            <MessageSquare size={15} /> <span className="text-xs">Total messages</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">{totalMessages}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-muted">
            <Gauge size={15} /> <span className="text-xs">{org.plan} plan usage</span>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold">
            {org.messagesUsedThisPeriod} / {org.messageQuota}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink">
            <div
              className={`h-full ${quotaPct >= 90 ? "bg-red-400" : "bg-accent"}`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium">Recent chatbots</h2>
          <Link href="/chatbots" className="text-sm text-accent-2">View all &rarr;</Link>
        </div>

        {chatbots.length === 0 ? (
          <div className="mt-4 rounded-lg border border-line bg-surface p-8 text-center text-muted">
            No chatbots yet. <Link href="/chatbots" className="text-accent-2">Create your first one</Link>.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {chatbots.map((bot) => (
              <Link
                key={bot.id}
                href={`/chatbots/${bot.id}`}
                className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3 hover:bg-surface-hover"
              >
                <div>
                  <p className="text-sm text-text">{bot.name}</p>
                  <p className="text-xs text-muted">
                    {bot._count.documents} documents · {bot._count.apiKeys} keys
                  </p>
                </div>
                <Badge status={bot.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}