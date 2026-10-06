// FEATURE: API keys + embed snippet for an Automation Agent — same pattern
// as the chatbot's keys/embed flow, scoped to the automation-agents routes.
"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AutomationEmbedSnippet } from "./automation-embed-snippet";
import { Plus, Trash2 } from "lucide-react";

type Key = { id: string; name: string; keyPrefix: string; isActive: boolean };

export function AutomationKeysSection({ agentId, serviceId, initialKeys }: { agentId: string; serviceId: string; initialKeys: Key[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/automation-agents/${agentId}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Default key" }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setRawKey(data.apiKey.rawKey);
      setKeys((prev) => [{ id: data.apiKey.id, name: data.apiKey.name, keyPrefix: data.apiKey.keyPrefix, isActive: true }, ...prev]);
    }
  }

  function handleClose() {
    setDialogOpen(false);
    setRawKey(null);
    setName("");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">API Keys ({keys.filter((k) => k.isActive).length})</h2>
        <Button variant="secondary" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1.5" /> New key</Button>
      </div>

      <div className="mt-4 space-y-2">
        {keys.filter((k) => k.isActive).map((key) => (
          <div key={key.id} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
            <div>
              <p className="text-sm text-text">{key.name}</p>
              <p className="font-mono text-xs text-muted">{key.keyPrefix}...</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onClose={handleClose} title={rawKey ? "Install your form" : "Create API key"}>
        {!rawKey ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="key-name">Key name</Label>
              <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production" />
            </div>
            <Button type="submit" className="w-full">{loading ? "Creating..." : "Create key"}</Button>
          </form>
        ) : (
          <div>
            <p className="mb-3 text-sm text-red-400">This key won't be shown again — copy the snippet below now.</p>
            <AutomationEmbedSnippet serviceId={serviceId} apiKey={rawKey} />
            <Button onClick={handleClose} className="mt-4 w-full" variant="secondary">Done</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}