// ============================================================================
// FEATURE: Chatbot overview — documents, embed snippets, API keys, and origins
// High-level workspace for managing a specific RAG chatbot.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentsPanel } from "@/components/dashboard/documents-panel";
import { ChatbotKeysSection } from "./keys-section";
import { OriginSettings } from "@/components/dashboard/origin-settings";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { EmbedSnippet } from "@/components/dashboard/embed-snippet";
import { ArrowLeft, Play, Settings, Bot, FileText, Key } from "lucide-react";

export default async function ChatbotOverviewPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotid },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
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

  if (!chatbot || chatbot.orgId !== orgId) notFound();

  const activeKeys = chatbot.service.apiKeys;
  const sampleKey = activeKeys.length > 0 ? `${activeKeys[0].keyPrefix}...` : undefined;

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Back Link & Header ──────────────────────── */}
      <div>
        <Link
          href="/chatbots"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text mb-3"
        >
          <ArrowLeft size={13} />
          Back to Chatbots
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink ring-1 ring-line">
              <Bot size={20} className="text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-semibold text-text">{chatbot.name}</h1>
                <Badge status={chatbot.status} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <FileText size={11} className="text-muted/70" />
                  {chatbot.documents.length} document{chatbot.documents.length !== 1 ? "s" : ""}
                </span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Key size={11} className="text-muted/70" />
                  {activeKeys.length} active key{activeKeys.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              href={`/chatbots/${chatbotid}/playground`}
              variant="secondary"
              size="sm"
            >
              <Play size={13} className="mr-1 text-accent" /> Playground
            </Button>
            <Button
              href={`/chatbots/${chatbotid}/settings`}
              variant="ghost"
              size="sm"
            >
              <Settings size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Subpage Tab Navigation ──────────────────────────── */}
      <ChatbotTabs chatbotid={chatbotid} />

      {/* ── Main Content Sections ───────────────────────────── */}
      <div className="space-y-10">
        {/* Knowledge Documents Section */}
        <section>
          <DocumentsPanel
            chatbotid={chatbotid}
            initialDocuments={chatbot.documents.map((d) => ({
              ...d,
              createdAt: d.createdAt.toISOString(),
            }))}
          />
        </section>

        {/* Integration & Embed Snippet Section */}
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-medium text-text">Embed on your Website</h2>
            <p className="mt-0.5 text-xs text-muted">
              Add this chatbot directly to your web application, documentation, or landing page.
            </p>
          </div>
          <EmbedSnippet chatbotid={chatbotid} apiKey={sampleKey} />
        </section>

        {/* API Keys Section */}
        <section>
          <ChatbotKeysSection
            chatbotid={chatbotid}
            initialKeys={activeKeys.map((k) => ({
              ...k,
              lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
            }))}
          />
        </section>

        {/* Origin Restriction Settings */}
        <section className="max-w-2xl">
          <OriginSettings
            chatbotid={chatbotid}
            initialValue={chatbot.allowedOrigins ?? ""}
          />
        </section>
      </div>
    </div>
  );
}