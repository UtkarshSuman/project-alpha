// ============================================================================
// ROUTE: /chatbots/long-term
// Placeholder page for the Long-term / Permanent Memory Chatbot service.
// Memory type: Facts and summaries extracted from conversations are stored
// persistently in the DB per-user. Memory survives across sessions.
// Persistent memory chatbots — rich empty state before first
// chatbot exists, real filterable list once they do.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotsClient } from "../chatbots-client";
import { LongTermEmptyState } from "@/components/dashboard/long-term-empty-state";

export const metadata = {
  title: "Persistent Memory Chatbots — Uveriq",
  description: "Chatbots that remember users across sessions using long-term semantic memory.",
};

export default async function LongTermChatbotsPage() {
  const { orgId } = await requireOrg();

  const chatbots = await prisma.chatbot.findMany({
    where: { orgId, memoryType: "long_term" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true } },
      service: { include: { _count: { select: { apiKeys: { where: { isActive: true } } } } } },
    },
  });

  if (chatbots.length === 0) {
    return <LongTermEmptyState />;
  }

  return (
    <ChatbotsClient
      initialChatbots={chatbots}
      baseHref="/chatbots/long-term"
      defaultMemoryType="long_term"
      title="Persistent Memory Chatbots"
      subtitle="Remembers facts about each visitor across sessions, indefinitely."
    />
  );
}