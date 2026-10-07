// ============================================================================
// FEATURE: API Keys tab for short-term chatbot
// Dedicated full-page API key manager — same UX as simple chatbot's keys tab.
// Keys are scoped to this chatbot's Service (unique per chatbot, not shared).
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { ChatbotKeysSection } from "../../../[chatbotid]/keys-section";
import { ArrowLeft, Bot, Key } from "lucide-react";

export default async function ShortTermApiKeysPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotid },
    include: {
      service: {
        include: {
          apiKeys: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!chatbot || chatbot.orgId !== orgId || chatbot.memoryType !== "short_term") notFound();

  const activeKeys = chatbot.service.apiKeys;

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Back Link & Header ──────────────────────── */}
      <div>
        <Link
          href="/chatbots/short-term"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text mb-3"
        >
          <ArrowLeft size={13} />
          Back to Session Memory Chatbots
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
              Manage API keys to authenticate requests for this session-memory chatbot.
            </p>
          </div>
        </div>
      </div>

      {/* ── Subpage Tab Navigation ──────────────────────────── */}
      <ChatbotTabs chatbotid={chatbotid} basePath="/chatbots/short-term" />

      {/* ── API Keys Manager ────────────────────────────────── */}
      <div className="max-w-3xl">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <Key size={13} className="text-accent" />
          Each key is unique to this chatbot service and cannot be used with other chatbots.
        </div>
        <ChatbotKeysSection
          chatbotid={chatbotid}
          initialKeys={activeKeys.map((k) => ({
            ...k,
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
