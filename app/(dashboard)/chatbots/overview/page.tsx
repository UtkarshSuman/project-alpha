// ============================================================================
// ROUTE: /chatbots/overview
// Hub page for the Chatbots umbrella service.
// Shows all 3 chatbot memory types as service cards.
// Users pick which type to work with from here.
// ============================================================================

import Link from "next/link";
import { requireOrg } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Bot, Clock, Database, ArrowRight, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Chatbots — Uveriq",
  description:
    "Choose your chatbot type: Simple (no memory), Short-term Memory, or Persistent Memory.",
};

const SERVICE_TYPES = [
  {
    href: "/chatbots",
    icon: Bot,
    accentClass: "text-accent",
    badgeClass: "border-accent/20 bg-accent/5 text-accent",
    iconBgClass: "bg-ink ring-accent/20",
    badge: "Available",
    title: "Simple Chatbot",
    description:
      "Stateless RAG chatbot. Each message is answered independently using your document knowledge base. Best for support docs, FAQs, and product manuals.",
    features: ["Document knowledge base", "Embed widget + REST API", "Lead capture", "Analytics dashboard"],
    cta: "Open Simple Chatbots",
  },
  {
    href: "/chatbots/short-term",
    icon: Clock,
    accentClass: "text-accent-2",
    badgeClass: "border-accent-2/20 bg-accent-2/5 text-accent-2",
    iconBgClass: "bg-ink ring-accent-2/20",
    badge: "In Development",
    title: "Short-term Memory",
    description:
      "Session-scoped memory. The full conversation history is passed to the LLM — visitors can ask follow-ups, reference earlier answers, and have real multi-turn conversations.",
    features: ["Full session history context", "Multi-turn reasoning", "RAG + memory combined", "Auto history trimming"],
    cta: "Learn more",
  },
  {
    href: "/chatbots/long-term",
    icon: Database,
    accentClass: "text-accent",
    badgeClass: "border-accent/20 bg-accent/5 text-accent",
    iconBgClass: "bg-ink ring-accent/20",
    badge: "In Development",
    title: "Persistent Memory",
    description:
      "Long-term memory stored per-user in the database. The chatbot remembers your users across every session — permanently. Build genuinely personalised AI assistants.",
    features: ["Cross-session recall", "Per-user memory store", "Personalised responses", "GDPR memory controls"],
    cta: "Learn more",
  },
];

export default async function ChatbotsOverviewPage() {
  const { orgId } = await requireOrg();
  const chatbotCount = await prisma.chatbot
    .count({ where: { orgId } })
    .catch(() => 0);

  return (
    <div className="max-w-4xl space-y-10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1">
          <Bot size={13} className="text-muted" />
          <span className="font-mono text-[11px] text-muted tracking-wide">Chatbots</span>
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-text leading-tight">
            Choose your chatbot type
          </h1>
          <p className="mt-2 text-body-md text-muted max-w-2xl leading-relaxed">
            Uveriq offers three chatbot memory models. Start with Simple for most use cases.
            Short-term and Persistent memory unlock more powerful conversational experiences.
          </p>
        </div>
        {chatbotCount > 0 && (
          <p className="text-xs text-muted">
            You have{" "}
            <Link href="/chatbots" className="font-medium text-text hover:text-accent transition-colors duration-fast">
              {chatbotCount} simple {chatbotCount === 1 ? "chatbot" : "chatbots"}
            </Link>{" "}
            in this workspace.
          </p>
        )}
      </div>

      {/* ── Service cards ───────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {SERVICE_TYPES.map(
          ({ href, icon: Icon, accentClass, badgeClass, iconBgClass, badge, title, description, features, cta }) => (
            <div
              key={href}
              className="flex flex-col rounded-lg border border-line bg-surface p-5 space-y-5"
            >
              {/* Card header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${iconBgClass}`}>
                    <Icon size={16} className={accentClass} />
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide ${badgeClass}`}>
                    {badge}
                  </span>
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-text">{title}</p>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="flex-1 space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle size={11} className={accentClass + " shrink-0"} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                href={href}
                variant={badge === "Available" ? "primary" : "secondary"}
                size="sm"
                className="w-full justify-center"
              >
                {cta}
                <ArrowRight size={13} className="ml-1.5" />
              </Button>
            </div>
          )
        )}
      </div>

      {/* ── Comparison table ────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-semibold text-text">Quick comparison</h2>
        <div className="rounded-lg border border-line bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Feature</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text">Simple</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted">Short-term</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted">Persistent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Document knowledge base", true, true, true],
                ["Embed widget + REST API", true, true, true],
                ["Analytics & leads", true, true, true],
                ["Multi-turn conversation", false, true, true],
                ["Remembers past sessions", false, false, true],
                ["Per-user personalisation", false, false, true],
              ].map(([label, simple, short_, long_]) => (
                <tr key={label as string}>
                  <td className="px-4 py-3 text-xs text-muted">{label as string}</td>
                  {[simple, short_, long_].map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center text-xs">
                      {val ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <span className="text-muted/30">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
