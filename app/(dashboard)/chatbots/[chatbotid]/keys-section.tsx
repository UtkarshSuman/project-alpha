// ============================================================================
// FEATURE: API keys section — owns the live key list state (single source
// of truth), passes it down to both the list and the create dialog so
// creating/revoking updates the count and list instantly.
// ============================================================================
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiKeyList, type ApiKeyItem } from "@/components/dashboard/api-key-list";
import { ApiKeyCreateDialog } from "@/components/dashboard/api-key-create-dialog";
import { Plus } from "lucide-react";

export function ChatbotKeysSection({ chatbotid, initialKeys }: { chatbotid: string; initialKeys: ApiKeyItem[] }) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = keys.filter((k) => k.isActive).length;

  function handleCreated(newKey: ApiKeyItem) {
    setKeys((prev) => [newKey, ...prev]);
  }

  function handleRevoked(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">
          API Keys <span className="font-normal text-muted">({activeCount})</span>
        </h2>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New key
        </Button>
      </div>
      <ApiKeyList chatbotid={chatbotid} keys={keys} onRevoked={handleRevoked} />
      <ApiKeyCreateDialog
        chatbotid={chatbotid}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}