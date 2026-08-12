// FEATURE: Chatbot settings page — general, branding, guardrails, origins, danger zone
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { ChatbotTabs } from "@/components/dashboard/chatbot-tabs";
import { ChatbotSettingsForm } from "@/components/dashboard/chatbot-settings-form";
import { OriginSettings } from "@/components/dashboard/origin-settings";
import { DangerZone } from "@/components/dashboard/danger-zone";

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
    <div>
      <h1 className="font-display text-2xl font-semibold">{chatbot.name}</h1>
      <ChatbotTabs chatbotid={chatbotid} />

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
        }}
      />

      <div className="mt-8">
        <OriginSettings chatbotid={chatbotid} initialValue={chatbot.allowedOrigins ?? ""} />
      </div>

      <div className="mt-8">
        <DangerZone chatbotid={chatbotid} chatbotName={chatbot.name} />
      </div>
    </div>
  );
}