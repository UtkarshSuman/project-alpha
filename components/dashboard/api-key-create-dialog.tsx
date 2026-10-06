// ============================================================================
// FEATURE: Create API key dialog — shows the raw key AND the ready-to-paste
// embed snippet, exactly once, matching how Stripe/OpenAI handle key
// creation. ============================================================================

"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmbedSnippet } from "@/components/dashboard/embed-snippet";
import type { ApiKeyItem } from "@/components/dashboard/api-key-list";

export function ApiKeyCreateDialog({
  chatbotid,
  open,
  onClose,
  onCreated,
}: {
  chatbotid: string;
  open: boolean;
  onClose: () => void;
  onCreated: (key: ApiKeyItem) => void;
}) {
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/chatbots/${chatbotid}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Default key" }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setRawKey(data.apiKey.rawKey);
      onCreated({
        id: data.apiKey.id,
        name: data.apiKey.name,
        keyPrefix: data.apiKey.keyPrefix,
        isActive: true,
        lastUsedAt: null,
      });
    }
  }

  function handleClose() {
    setRawKey(null);
    setName("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={rawKey ? "Install your chatbot" : "Create API key"}>
      {!rawKey ? (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="key-name">Key name</Label>
            <Input id="key-name" placeholder="e.g. Production" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">
            {loading ? "Creating..." : "Create key"}
          </Button>
        </form>
      ) : (
        <div>
          <p className="mb-3 text-sm text-red-400">
            This key won't be shown again — copy the snippet below now.
          </p>
          <EmbedSnippet chatbotid={chatbotid} apiKey={rawKey} />
          <Button onClick={handleClose} className="mt-4 w-full" variant="secondary">
            Done
          </Button>
        </div>
      )}
    </Dialog>
  );
}