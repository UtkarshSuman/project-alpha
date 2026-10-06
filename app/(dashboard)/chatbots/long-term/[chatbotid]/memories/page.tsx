import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { MemoryViewer } from "@/components/features/chatbots/memory-viewer";

export default async function MemoriesPage({ params }: { params: Promise<{ chatbotid: string }> }) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId || chatbot.memoryType !== "long_term") notFound();

  const memories = await prisma.userMemory.findMany({
    where: { chatbotId: chatbotid },
    orderBy: { createdAt: "desc" },
    select: { id: true, visitorIdentifier: true, content: true, importance: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{chatbot.name}</h1>
      <ChatbotTabs
        chatbotid={chatbotid}
        basePath="/chatbots/long-term"
        extraTabs={[{ href: `/chatbots/long-term/${chatbotid}/memories`, label: "Memories" }]}
      />
      <MemoryViewer chatbotid={chatbotid} initialMemories={memories.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </div>
  );
}