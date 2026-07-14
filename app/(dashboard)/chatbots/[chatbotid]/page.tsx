// FEATURE: Individual chatbot overview page — placeholder shell for now.
// File upload UI, API key management, and settings tabs get added here
// in the next sections (Upload/Ingestion, then API Keys).
// FEATURE: Chatbot overview — now with real document upload + list
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { DocumentList } from "@/components/dashboard/document-list";

export default async function ChatbotOverviewPage({
  params,
}: {
  params: Promise<{ chatbotid: string }>;
}) {
  const { chatbotid } = await params;
  const { orgId } = await requireOrg();

  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotid },
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

      <div className="mt-10">
        <h2 className="font-display text-lg font-medium">Documents</h2>
        <div className="mt-4">
          <DocumentUpload chatbotid={chatbotid} />
          <DocumentList chatbotid={chatbotid} initialDocuments={chatbot.documents} />
        </div>
      </div>
    </div>
  );
}