// ============================================================================
// ROUTE: /chatbots/short-term
// Placeholder page for the Short-term Memory Chatbot service.
// Memory type: Conversation history persists within a session (Redis/DB),
// passed to LLM as context. Clears when session expires.
// Short-term memory chatbots — rich empty state before first
// chatbot exists, real filterable list once they do.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotsClient } from "../chatbots-client";
import { ShortTermEmptyState } from "@/components/dashboard/short-term-empty-state";

export const metadata = {
  title: "Short-term Memory Chatbots — Uveriq",
  description: "Chatbots with session-scoped conversation memory.",
};

export default async function ShortTermChatbotsPage() {
  const { orgId } = await requireOrg();

  const chatbots = await prisma.chatbot.findMany({
    where: { orgId, memoryType: "short_term" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true } },
      service: { include: { _count: { select: { apiKeys: { where: { isActive: true } } } } } },
    },
  });

  if (chatbots.length === 0) {
    return <ShortTermEmptyState />;
  }

  return (
    <ChatbotsClient
      initialChatbots={chatbots}
      baseHref="/chatbots/short-term"
      defaultMemoryType="short_term"
      title="Short-term Memory Chatbots"
      subtitle="Remembers the full conversation within a session — resets when the session ends."
    />
  );
}