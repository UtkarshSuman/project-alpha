// ============================================================================
// FEATURE: Tool Agents Service Introduction Page
// Landing page when a user navigates to the Tool Agents section.
// Explains what tool agents are (function-calling AI agents), how they work,
// and guides the user to create or manage their agents.
// ============================================================================

import Link from "next/link";
import { requireOrg } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Wrench,
  Globe,
  Key,
  ArrowRight,
  Terminal,
  Network,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Tool Agents — Uveriq",
  description:
    "Build AI agents that call your APIs in real time. Define tools, test in the playground, and expose via a scoped REST endpoint.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Wrench,
    title: "Define your tools",
    description:
      "Describe each API endpoint as a tool — give it a name, description, URL, HTTP method, and a JSON Schema for its parameters. The LLM uses this to decide when and how to call it.",
  },
  {
    step: "02",
    icon: Terminal,
    title: "Test in the playground",
    description:
      "Use the built-in playground to chat with your agent in real time. Watch it reason, pick the right tool, call your API, and return a grounded answer.",
  },
  {
    step: "03",
    icon: Key,
    title: "Issue scoped API keys",
    description:
      "Generate per-agent API keys with optional origin restrictions. Share with your frontend or backend to call the agent from anywhere.",
  },
  {
    step: "04",
    icon: Network,
    title: "Call from anywhere",
    description:
      "Send a chat message to your agent via the REST endpoint. The agent orchestrates tool calls, assembles the response, and streams it back.",
  },
];

const CAPABILITIES = [
  {
    icon: Globe,
    label: "Live API tool calls",
    detail: "Agent calls your real endpoints — GET or POST — at query time",
  },
  {
    icon: Wrench,
    label: "JSON Schema params",
    detail: "Define exactly what the LLM should extract and send as parameters",
  },
  {
    icon: Terminal,
    label: "Interactive playground",
    detail: "Test your agent conversationally before exposing it to users",
  },
  {
    icon: Lock,
    label: "SSRF protection",
    detail: "All tool URLs are validated against an SSRF guard before execution",
  },
];

export default async function ToolAgentsOverviewPage() {
  const { orgId } = await requireOrg();

  const agentCount = await prisma.toolAgent
    .count({ where: { service: { orgId } } })
    .catch(() => 0);

  return (
    <div className="max-w-3xl space-y-12">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-2/20 bg-accent-2/5 px-3 py-1">
          <Zap size={13} className="text-accent-2" />
          <span className="font-mono text-[11px] text-accent-2 tracking-wide">Action Agent Service</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-text leading-tight">
            Tool-Calling AI Agents
          </h1>
          <p className="mt-3 text-body-md text-muted leading-relaxed max-w-2xl">
            Build AI agents that interact with your real APIs. Define tools, let the LLM reason
            over user intent, and have it call the right endpoint — automatically, at query time.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button href="/tool-agents" size="sm">
            {agentCount > 0 ? (
              <>
                View my agents
                <ArrowRight size={14} className="ml-1.5" />
              </>
            ) : (
              <>
                Create first agent
                <ArrowRight size={14} className="ml-1.5" />
              </>
            )}
          </Button>
          {agentCount > 0 && (
            <Button href="/tool-agents?create=1" variant="secondary" size="sm">
              New agent
            </Button>
          )}
        </div>

        {agentCount > 0 && (
          <p className="text-xs text-muted">
            You have{" "}
            <span className="font-medium text-text">{agentCount}</span>{" "}
            {agentCount === 1 ? "agent" : "agents"} in this workspace.
          </p>
        )}
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="h-px bg-line" />

      {/* ── How it works ──────────────────────────────────────── */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-base font-semibold text-text">How it works</h2>
          <p className="mt-1 text-sm text-muted">Four steps from idea to a live AI agent with real API access.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="rounded-lg border border-line bg-surface p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink ring-1 ring-line">
                  <Icon size={15} className="text-accent-2" />
                </div>
                <span className="font-mono text-[11px] text-muted/50">{step}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text">{title}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Diff from Chatbots callout ────────────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted/60 mb-3">
          Tool Agents vs. Chatbots
        </p>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="space-y-1.5">
            <p className="font-medium text-text flex items-center gap-1.5">
              <Zap size={13} className="text-accent-2" /> Tool Agents
            </p>
            <ul className="space-y-1 text-xs text-muted">
              <li>Connect to live APIs — data is always real-time</li>
              <li>Agent decides which tool to call based on user intent</li>
              <li>Best for dynamic data: inventory, orders, CRM, weather</li>
            </ul>
          </div>
          <div className="space-y-1.5 sm:border-l sm:border-line sm:pl-4">
            <p className="font-medium text-text flex items-center gap-1.5">
              <Wrench size={13} className="text-accent" /> Chatbots (RAG)
            </p>
            <ul className="space-y-1 text-xs text-muted">
              <li>Answer from uploaded documents — static knowledge base</li>
              <li>Best for support docs, FAQs, product manuals</li>
              <li>No external API calls — faster, fully contained</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Capabilities ──────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="font-display text-base font-semibold text-text">What you get</h2>
        <div className="rounded-lg border border-line bg-surface divide-y divide-line">
          {CAPABILITIES.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink ring-1 ring-line">
                <Icon size={13} className="text-accent-2" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text">{label}</p>
                <p className="text-xs text-muted">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Footer ────────────────────────────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Ready to build an agent?</p>
          <p className="mt-0.5 text-xs text-muted">
            {agentCount > 0
              ? "Manage your agents or create a new one with different tools."
              : "Define your first tool and have a live agent endpoint in minutes."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button href="/tool-agents?create=1" variant="secondary" size="sm">
            New agent
          </Button>
          <Button href="/tool-agents" size="sm">
            {agentCount > 0 ? "My agents" : "Get started"}
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
