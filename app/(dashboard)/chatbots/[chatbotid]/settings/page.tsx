// ============================================================================
// FEATURE: Chatbot Settings Page
// General configuration, prompt boundaries, widget branding, and safety zones.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { ChatbotSettingsForm } from "@/components/dashboard/chatbot-settings-form";
import { OriginSettings } from "@/components/dashboard/origin-settings";
import { DangerZone } from "@/components/dashboard/danger-zone";
import { ClearDataZone } from "@/components/dashboard/clear-data-zone";
import { ArrowLeft, Bot, Sliders } from "lucide-react";

export default async function ChatbotSettingsPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId) notFound();

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
              Configure system prompts, widget presentation, and data management policies.
            </p>
          </div>
        </div>
      </div>

      {/* ── Subpage Tab Navigation ──────────────────────────── */}
      <ChatbotTabs chatbotid={chatbotid} />

      {/* ── Main Settings Form ──────────────────────────────── */}
      <div className="space-y-8 max-w-4xl">
        <ChatbotSettingsForm
          chatbotid={chatbotid}
          initial={{
            name: chatbot.name,
            systemPrompt: chatbot.systemPrompt,
            temperature: chatbot.temperature,
            widgetTitle: chatbot.widgetTitle,
            widgetColor: chatbot.widgetColor,
            widgetLogoUrl: chatbot.widgetLogoUrl,
            widgetPosition: chatbot.widgetPosition,
            widgetTheme: chatbot.widgetTheme,
            welcomeMessage: chatbot.welcomeMessage,
            restrictToContext: chatbot.restrictToContext,
            leadCaptureEnabled: chatbot.leadCaptureEnabled,
            widgetSize: chatbot.widgetSize,
            suggestedQuestions: chatbot.suggestedQuestions ?? "",
          }}
        />

        {/* ── Security & Allowed Domains ────────────────────── */}
        <section className="space-y-2">
          <OriginSettings chatbotid={chatbotid} initialValue={chatbot.allowedOrigins ?? ""} />
        </section>

        {/* ── Data Management & Danger Zone ──────────────────── */}
        <section className="space-y-6 pt-4 border-t border-line/60">
          <ClearDataZone chatbotid={chatbotid} />
          <DangerZone chatbotid={chatbotid} chatbotName={chatbot.name} />
        </section>
      </div>
    </div>
  );
}