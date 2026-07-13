// FEATURE: Individual chatbot overview page — placeholder shell for now.
// File upload UI, API key management, and settings tabs get added here
// in the next sections (Upload/Ingestion, then API Keys).
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";

export default async function ChatbotOverviewPage({ params }: { params: { chatbotid: string } }) {
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({
    where: { id: params.chatbotid },
    include: { documents: true, apiKeys: true },
  });

  if (!chatbot || chatbot.orgId !== orgId) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">{chatbot.name}</h1>
        <Badge status={chatbot.status} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {chatbot.documents.length} documents · {chatbot.apiKeys.length} API keys
      </p>

      <div className="mt-10 rounded-lg border border-line bg-surface p-8 text-center text-muted">
        Document upload UI goes here — built in the next section.
      </div>
    </div>
  );
}