// FEATURE: Chatbot overview — documents + API keys sections

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { DocumentsPanel } from "@/components/dashboard/documents-panel";
import { ChatbotKeysSection } from "./keys-section";
import { OriginSettings } from "@/components/dashboard/origin-settings";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";

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
        {chatbot.documents.length} documents · {chatbot.apiKeys.filter((k) => k.isActive).length} API keys
      </p>
        
      <ChatbotTabs chatbotid={chatbotid} /> 

      <div className="mt-10">
        <OriginSettings chatbotid={chatbotid} initialValue={chatbot.allowedOrigins ?? ""} />
      </div> 

      <div className="mt-10">
        <h2 className="font-display text-lg font-medium">Documents</h2>
        <div className="mt-4">
          <DocumentsPanel chatbotid={chatbotid} initialDocuments={chatbot.documents} />
        </div>
      </div>

      <div className="mt-10">
        <ChatbotKeysSection
          chatbotid={chatbotid}
          initialKeys={chatbot.apiKeys.map((k) => ({
            ...k,
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}