// ============================================================================
// FEATURE: Analytics dashboard for a long-term memory chatbot
// Visualizes traffic volume, answer fidelity, response latency, content gaps,
// and prospective captured leads.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { UnansweredQuestions } from "@/components/dashboard/unanswered-questions";
import { LeadsList } from "@/components/dashboard/leads-list";
import { StatCard } from "@/components/features/dashboard/stat-card";
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";

type DailyCountRow = { day: Date; count: bigint };

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId || chatbot.memoryType !== "long_term") notFound();

  const [
    conversationCount,
    messageCount,
    unansweredCount,
    avgLatency,
    dailyCounts,
    unansweredMessages,
    leads,
  ] = await Promise.all([
    prisma.conversation.count({ where: { chatbotId: chatbotid } }),
    prisma.message.count({
      where: { conversation: { chatbotId: chatbotid }, role: "user" },
    }),
    prisma.message.count({
      where: { conversation: { chatbotId: chatbotid }, role: "assistant", wasAnswered: false },
    }),
    prisma.usageLog.aggregate({
      where: { apiKey: { serviceId: chatbot.serviceId } },
      _avg: { latencyMs: true },
    }),
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
      take: 15,
      select: { relatedQuestion: true, content: true, createdAt: true },
    }),
    prisma.conversation.findMany({
      where: { chatbotId: chatbotid, visitorEmail: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { visitorEmail: true, leadQuestion: true, createdAt: true },
    }),
  ]);

  const chartData = dailyCounts.map((row) => ({
    date: new Date(row.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: Number(row.count),
  }));

  const unansweredRate = messageCount > 0 ? Math.round((unansweredCount / messageCount) * 100) : 0;
  const groundedRate = 100 - unansweredRate;

  const unansweredItems = unansweredMessages.map((m) => ({
    content: m.relatedQuestion ?? "(question unavailable)",
    createdAt: m.createdAt.toISOString(),
  }));

  const latencyDisplay = avgLatency._avg?.latencyMs
    ? `${Math.round(avgLatency._avg.latencyMs)}ms`
    : "—";

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Back Link & Header ──────────────────────── */}
      <div>
        <Link
          href="/chatbots/long-term"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text mb-3"
        >
          <ArrowLeft size={13} />
          Back to Persistent Memory Chatbots
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink ring-1 ring-line">
            <Bot size={20} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-semibold text-text">{chatbot.name}</h1>
              <Badge status={chatbot.status} />
            </div>
            <p className="text-xs text-muted mt-0.5">
              Performance telemetry and conversational intelligence overview.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────── */}
      <ChatbotTabs
        chatbotid={chatbotid}
        basePath="/chatbots/long-term"
        extraTabs={[{ href: `/chatbots/long-term/${chatbotid}/memories`, label: "Memories" }]}
      />

      {/* ── Operational Metric Cards ───────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conversations"
          value={conversationCount}
          icon="message"
          subtext="Interactive visitor sessions"
        />
        <StatCard
          label="Total Messages"
          value={messageCount}
          icon="bot"
          subtext="User queries answered"
        />
        <StatCard
          label="Answer Accuracy"
          value={`${groundedRate}%`}
          icon="sparkles"
          subtext={`${unansweredCount} fallback responses`}
          trend={{
            value: `${groundedRate}% grounded`,
            positive: groundedRate >= 80,
          }}
        />
        <StatCard
          label="Avg Response Time"
          value={latencyDisplay}
          icon="clock"
          subtext="End-to-end LLM latency"
        />
      </div>

      {/* ── Traffic Volume Chart ────────────────────────────── */}
      <section>
        {chartData.length > 0 ? (
          <AnalyticsChart data={chartData} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-12 text-center text-sm text-muted">
            No message traffic recorded in the last 14 days. Once users interact with the widget or API, activity will appear here.
          </div>
        )}
      </section>

      {/* ── Telemetry & Leads Grid ─────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-2 pt-2">
        {/* Unanswered Queries / Content Gaps */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-text">Content Gap Telemetry</h2>
            <span className="text-xs text-muted">{unansweredItems.length} items</span>
          </div>
          <UnansweredQuestions chatbotid={chatbotid} items={unansweredItems} />
        </section>

        {/* Captured Leads */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-text">Captured Visitor Leads</h2>
            <span className="text-xs text-muted">{leads.length} contacts</span>
          </div>
          <LeadsList
            leads={leads.map((l) => ({
              visitorEmail: l.visitorEmail!,
              question: l.leadQuestion,
              createdAt: l.createdAt.toISOString(),
            }))}
          />
        </section>
      </div>
    </div>
  );
}