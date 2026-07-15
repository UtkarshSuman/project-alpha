// FEATURE: Client wrapper for the API keys section (needs dialog open state)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiKeyList } from "@/components/dashboard/api-key-list";
import { ApiKeyCreateDialog } from "@/components/dashboard/api-key-create-dialog";
import { Plus } from "lucide-react";

type ApiKeyItem = { id: string; name: string; keyPrefix: string; isActive: boolean; lastUsedAt: string | null };

export function ChatbotKeysSection({ chatbotid, initialKeys }: { chatbotid: string; initialKeys: ApiKeyItem[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">API Keys</h2>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New key
        </Button>
      </div>
      <ApiKeyList chatbotid={chatbotid} keys={initialKeys} />
      <ApiKeyCreateDialog chatbotid={chatbotid} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}