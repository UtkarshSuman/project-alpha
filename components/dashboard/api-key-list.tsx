// FEATURE: API key list with revoke action
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
};

export function ApiKeyList({ chatbotid, keys }: { chatbotid: string; keys: ApiKeyItem[] }) {
  const router = useRouter();
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(keyid: string) {
    setRevoking(keyid);
    await fetch(`/api/chatbots/${chatbotid}/keys/${keyid}`, { method: "DELETE" });
    setRevoking(null);
    router.refresh();
  }

  const activeKeys = keys.filter((k) => k.isActive);

  if (activeKeys.length === 0) {
    return <p className="mt-4 text-sm text-muted">No API keys yet.</p>;
  }

  return (
    <div className="mt-4 space-y-2">
      {activeKeys.map((key) => (
        <div key={key.id} className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
          <div>
            <p className="text-sm text-text">{key.name}</p>
            <p className="font-mono text-xs text-muted">{key.keyPrefix}...</p>
          </div>
          <button
            onClick={() => handleRevoke(key.id)}
            disabled={revoking === key.id}
            className="text-muted hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}