// ============================================================================
// FEATURE: Tool Agent API Keys Section
// Create, copy, and revoke scoped API keys with instant UI update.
// ============================================================================

"use client";

import { useState } from "react";
import { Plus, Trash2, Key, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/hooks/use-toast";

export type KeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: string | Date | null;
  createdAt: string | Date;
};

type Props = {
  toolAgentId: string;
  initialKeys: KeyItem[];
};

export function ToolAgentKeysSection({ toolAgentId, initialKeys }: Props) {
  const [keys, setKeys] = useState<KeyItem[]>(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeKeys = keys.filter((k) => k.isActive);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch(`/api/tool-agents/${toolAgentId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() || "Default key" }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create API key");
        setCreating(false);
        return;
      }

      setNewRawKey(data.apiKey.rawKey);
      setKeys((prev) => [data.apiKey, ...prev]);
      setKeyName("");
      toast.success("API key generated");
    } catch {
      toast.error("Network error while creating key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Revoking this API key will immediately stop all requests using it. Continue?")) {
      return;
    }

    setRevokingId(keyId);
    try {
      const res = await fetch(`/api/tool-agents/${toolAgentId}/keys/${keyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to revoke API key");
        return;
      }

      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast.success("API key revoked");
    } catch {
      toast.error("Error revoking key");
    } finally {
      setRevokingId(null);
    }
  }

  function handleCopy() {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Key copied to clipboard");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-text">
            API Keys <span className="text-sm font-normal text-muted">({activeKeys.length})</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Authenticate external API requests to <code className="font-mono text-text">/api/chat/tool/:id</code>
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New Key
        </Button>
      </div>

      {activeKeys.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-surface/50 p-6 text-center text-sm text-muted">
          No active API keys. Create one to authenticate external client requests.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {activeKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-hover text-muted">
                  <Key size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{key.name}</p>
                  <p className="font-mono text-xs text-muted">
                    {key.keyPrefix}••••••••••••••••••••••••••••••••
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={revokingId === key.id}
                onClick={() => handleRevoke(key.id)}
                className="text-muted hover:text-danger hover:bg-danger/10"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setNewRawKey(null);
        }}
        title={newRawKey ? "Save your API Key" : "Create new API Key"}
      >
        {newRawKey ? (
          <div className="space-y-4">
            <p className="text-xs text-warning">
              Please copy your API key now. For your security, this key will never be shown again.
            </p>

            <div>
              <Label>Secret API Key</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  readOnly
                  value={newRawKey}
                  className="font-mono text-xs select-all bg-surface-hover"
                />
                <Button type="button" onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setNewRawKey(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Backend, Test API"
                className="mt-1"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                Generate Key
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
