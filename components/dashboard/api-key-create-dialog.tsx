// ============================================================================
// FEATURE: Create API key dialog — shows the raw key EXACTLY ONCE with a
// copy button and a clear "you won't see this again" warning, matching
// how Stripe/OpenAI handle key creation.
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function ApiKeyCreateDialog({
  chatbotid,
  open,
  onClose,
}: {
  chatbotid: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      router.refresh();
    }
  }

  function handleClose() {
    setRawKey(null);
    setName("");
    setCopied(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={rawKey ? "Your new API key" : "Create API key"}>
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
            Copy this now — you won't be able to see it again.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-text">
            <span className="flex-1 truncate">{rawKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(rawKey);
                setCopied(true);
              }}
              className="text-muted hover:text-text"
            >
              {copied ? <Check size={16} className="text-accent-2" /> : <Copy size={16} />}
            </button>
          </div>
          <Button onClick={handleClose} className="mt-4 w-full" variant="secondary">
            Done
          </Button>
        </div>
      )}
    </Dialog>
  );
}