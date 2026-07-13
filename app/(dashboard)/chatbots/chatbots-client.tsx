// FEATURE: Client half of the chatbots page — handles the create dialog's
// open/close state, which must live in a client component.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatbotCard } from "@/components/dashboard/chatbot-card";
import { CreateChatbotDialog } from "@/components/dashboard/create-chatbot-dialog";
import { Plus } from "lucide-react";

type Chatbot = {
  id: string;
  name: string;
  status: string;
  _count: { documents: number; apiKeys: number };
};

export function ChatbotsClient({ initialChatbots }: { initialChatbots: Chatbot[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Chatbots</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New chatbot
        </Button>
      </div>

      {initialChatbots.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-muted">No chatbots yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialChatbots.map((bot) => (
            <ChatbotCard
              key={bot.id}
              id={bot.id}
              name={bot.name}
              status={bot.status}
              documentCount={bot._count.documents}
              apiKeyCount={bot._count.apiKeys}
            />
          ))}
        </div>
      )}

      <CreateChatbotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}