// ============================================================================
// FEATURE: Analytics dashboard for a single chatbot
// - Summary cards: total conversations, total messages, unanswered rate,
//   avg response latency
// - Bar chart: messages per day, last 14 days
// - List: questions that triggered the "I don't know" fallback — tells the
//   customer exactly what content gaps exist in their uploaded docs
// ============================================================================

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { UnansweredQuestions } from "@/components/dashboard/unanswered-questions";

type DailyCountRow = { day: Date; count: bigint };

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId) notFound();

  const [conversationCount, messageCount, unansweredCount, avgLatency, dailyCounts, unansweredMessages] =
    await Promise.all([
      prisma.conversation.count({ where: { chatbotId: chatbotid } }),
      prisma.message.count({
        where: { conversation: { chatbotId: chatbotid }, role: "user" },
      }),
      prisma.message.count({
        where: { conversation: { chatbotId: chatbotid }, role: "assistant", wasAnswered: false },
      }),
      prisma.usageLog.aggregate({
        where: { apiKey: { chatbotId: chatbotid } },
        _avg: { latencyMs: true },
      }),
      // Raw SQL: date_trunc/day-bucketing isn't expressible through Prisma's
      // query builder, so this is a raw aggregate query.
      prisma.$queryRaw<DailyCountRow[]>`
        SELECT date_trunc('day', m."createdAt") AS day, COUNT(*) AS count
        FROM "Message" m
        JOIN "Conversation" c ON c.id = m."conversationId"
        WHERE c."chatbotId" = ${chatbotid}
          AND m.role = 'user'
          AND m."createdAt" >= NOW() - INTERVAL '14 days'
        GROUP BY day
        ORDER BY day ASC
      `,
      prisma.message.findMany({
        where: { conversation: { chatbotId: chatbotid }, role: "assistant", wasAnswered: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { conversation: { include: { messages: { where: { role: "user" }, take: 1, orderBy: { createdAt: "desc" } } } } },
      }),
    ]);

  const chartData = dailyCounts.map((row) => ({
    date: new Date(row.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: Number(row.count),
  }));

  const unansweredRate = messageCount > 0 ? Math.round((unansweredCount / messageCount) * 100) : 0;

  // Pull the user's actual question that preceded each unanswered fallback
  const unansweredItems = unansweredMessages.map((m) => ({
    content: m.conversation.messages[0]?.content ?? "(question unavailable)",
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">{chatbot.name}</h1>
        <Badge status={chatbot.status} />
      </div>

      <ChatbotTabs chatbotid={chatbotid} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Conversations" value={conversationCount.toString()} />
        <StatCard label="Messages" value={messageCount.toString()} />
        <StatCard label="Unanswered rate" value={`${unansweredRate}%`} />
        <StatCard
          label="Avg response time"
          value={avgLatency._avg.latencyMs ? `${Math.round(avgLatency._avg.latencyMs)}ms` : "—"}
        />
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-lg font-medium">Messages, last 14 days</h2>
        {chartData.length > 0 ? (
          <AnalyticsChart data={chartData} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-muted">
            No conversations yet.
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display mb-3 text-lg font-medium">Unanswered questions</h2>
        <UnansweredQuestions items={unansweredItems} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}