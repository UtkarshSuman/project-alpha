// ============================================================================
// FEATURE: Dashboard Overview — High-level control plane for the organization
// Aggregates Chatbots, Tool Agents, document indices, message traffic, and quota.
// ============================================================================

import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QuotaBar } from "@/components/dashboard/quota-bar";
import { StatCard } from "@/components/features/dashboard/stat-card";
import {
  Bot,
  Zap,
  MessageSquare,
  Key,
  Plus,
  ArrowRight,
  Cpu,
  FileText,
} from "lucide-react";

export default async function DashboardOverview() {
  const { orgId } = await requireOrg();

  const org = await prisma.organization
    .findUnique({ where: { id: orgId } })
    .catch(() => null);

  const currentOrg = org ?? {
    id: orgId,
    name: "Workspace",
    plan: "FREE" as const,
    messagesUsedThisPeriod: 0,
    messageQuota: 100,
    chatbotsLimit: 1,
  };

  const [
    chatbots,
    toolAgents,
    totalChatbots,
    totalToolAgents,
    totalDocuments,
    totalMessages,
    activeKeys,
  ] = await Promise.all([
    prisma.chatbot
      .findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          _count: { select: { documents: true } },
          service: {
            include: {
              _count: { select: { apiKeys: { where: { isActive: true } } } },
            },
          },
        },
      })
      .catch(() => []),
    prisma.toolAgent
      .findMany({
        where: { service: { orgId } },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          _count: { select: { tools: true } },
          service: {
            include: {
              _count: { select: { apiKeys: { where: { isActive: true } } } },
            },
          },
        },
      })
      .catch(() => []),
    prisma.chatbot.count({ where: { orgId } }).catch(() => 0),
    prisma.toolAgent.count({ where: { service: { orgId } } }).catch(() => 0),
    prisma.document.count({ where: { chatbot: { orgId } } }).catch(() => 0),
    prisma.message
      .count({
        where: { conversation: { chatbot: { orgId } }, role: "user" },
      })
      .catch(() => currentOrg.messagesUsedThisPeriod ?? 0),
    prisma.apiKey
      .count({
        where: { service: { orgId }, isActive: true },
      })
      .catch(() => 0),
  ]);

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            Operational health, active services, and quota consumption across Uveriq.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button href="/chatbots?create=1" variant="secondary" size="sm">
            <Plus size={14} className="mr-1" /> New Chatbot
          </Button>
          <Button href="/tool-agents?create=1" size="sm">
            <Plus size={14} className="mr-1" /> New Tool Agent
          </Button>
        </div>
      </div>

      {/* ── Metric Cards Grid ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chatbots"
          value={totalChatbots}
          icon="bot"
          subtext={`${totalDocuments} indexed document${totalDocuments !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Tool Agents"
          value={totalToolAgents}
          icon="zap"
          subtext="Function-calling agents"
        />
        <StatCard
          label="Total Messages"
          value={totalMessages}
          icon="message"
          subtext="User queries answered"
        />
        <StatCard
          label="Active API Keys"
          value={activeKeys}
          icon="key"
          subtext="Authenticated endpoints"
        />
      </div>

      {/* ── Quota & Capacity Card ──────────────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-6 shadow-elevate-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-medium text-text">Monthly Quota</h2>
            <p className="mt-0.5 text-xs text-muted">
              Traffic usage resets at the beginning of each billing cycle.
            </p>
          </div>
          <Button href="/dashboard/billing" variant="ghost" size="sm" className="text-xs">
            Manage billing
          </Button>
        </div>

        <QuotaBar
          used={currentOrg.messagesUsedThisPeriod}
          quota={currentOrg.messageQuota}
          plan={currentOrg.plan}
        />
      </div>

      {/* ── Two-Column Services Grid ────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Chatbots */}
        <div className="rounded-lg border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-accent" />
              <h2 className="font-display text-base font-medium text-text">Recent Chatbots</h2>
            </div>
            <Link
              href="/chatbots"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors duration-fast"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {chatbots.length === 0 ? (
            <div className="rounded-md border border-dashed border-line p-6">
              <EmptyState
                icon={<Bot size={18} />}
                heading="No chatbots yet"
                description="Create a RAG retrieval chatbot trained on your documents."
                action={
                  <Button href="/chatbots?create=1" size="sm">
                    Create chatbot
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {chatbots.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/chatbots/${bot.id}`}
                  className="group flex items-center justify-between rounded-md border border-line/60 bg-surface-hover/20 p-3.5 transition-all duration-fast hover:border-line-hover hover:bg-surface-hover"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-medium text-text group-hover:text-accent transition-colors duration-fast">
                      {bot.name}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <FileText size={11} className="text-muted/70" />
                        {bot._count.documents} docs
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Key size={11} className="text-muted/70" />
                        {bot.service._count.apiKeys} keys
                      </span>
                    </div>
                  </div>
                  <Badge status={bot.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tool Agents */}
        <div className="rounded-lg border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-accent" />
              <h2 className="font-display text-base font-medium text-text">Recent Tool Agents</h2>
            </div>
            <Link
              href="/tool-agents"
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors duration-fast"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {toolAgents.length === 0 ? (
            <div className="rounded-md border border-dashed border-line p-6">
              <EmptyState
                icon={<Zap size={18} />}
                heading="No tool agents yet"
                description="Build an agent that calls external APIs and webhooks."
                action={
                  <Button href="/tool-agents?create=1" size="sm">
                    Create tool agent
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {toolAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/tool-agents/${agent.id}`}
                  className="group flex items-center justify-between rounded-md border border-line/60 bg-surface-hover/20 p-3.5 transition-all duration-fast hover:border-line-hover hover:bg-surface-hover"
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-medium text-text group-hover:text-accent transition-colors duration-fast">
                      {agent.name}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Cpu size={11} className="text-muted/70" />
                        {agent.model.replace(/^openai\//, "")}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Zap size={11} className="text-muted/70" />
                        {agent._count.tools} tools
                      </span>
                    </div>
                  </div>
                  <Badge status={agent._count.tools > 0 ? "READY" : "DRAFT"} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}