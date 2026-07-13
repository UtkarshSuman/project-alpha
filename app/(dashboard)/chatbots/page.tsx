// ============================================================================
// FEATURE: Chatbots list page
// Server component fetches the list directly via Prisma (no need to round-trip
// through the API route for the initial page load — that's what GET /api/chat
// is for: client-side refetches, e.g. after creating a bot).
// ============================================================================
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotsClient } from "./chatbots-client";

export default async function ChatbotsPage() {
  const { orgId } = await requireOrg();

  const chatbots = await prisma.chatbot.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: true, apiKeys: true } } },
  });

  return <ChatbotsClient initialChatbots={chatbots} />;
}