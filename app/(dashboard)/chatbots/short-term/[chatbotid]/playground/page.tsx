// ============================================================================
// FEATURE: RAG Chatbot Playground Page
// Live interactive test console for grounded retrieval and chatbot responses.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { ChatbotPlayground } from "@/components/features/chatbots/chatbot-playground";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";

export default async function PlaygroundPage({
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
        where: { status: "READY" },
        select: { id: true },
      },
    },
  });

  if (!chatbot || chatbot.orgId !== orgId || chatbot.memoryType !== "short_term") {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/chatbots/short-term"
          className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Session Memory Chatbots
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-accent" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-text">
              {chatbot.name}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted">
            Live interactive sandbox to query your chatbot with grounded knowledge retrieval.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <ChatbotTabs chatbotid={chatbotid} basePath="/chatbots/short-term" />

      {/* Playground Console */}
      <div className="mt-6">
        <ChatbotPlayground
          chatbotId={chatbot.id}
          chatbotName={chatbot.name}
          status={chatbot.status}
          model={chatbot.model}
          welcomeMessage={chatbot.welcomeMessage}
          documentCount={chatbot.documents.length}
          restrictToContext={chatbot.restrictToContext}
        />
      </div>
    </div>
  );
}
