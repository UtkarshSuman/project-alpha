// FEATURE: Delete chatbot — requires typing the chatbot's name to confirm,
// since this cascades to all documents, chunks, keys, and conversations.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DangerZone({ chatbotid, chatbotName }: { chatbotid: string; chatbotName: string }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/chatbots/${chatbotid}`, { method: "DELETE" });
    router.push("/chatbots");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-red-900/50 bg-red-950/10 p-5">
      <h3 className="font-display text-sm font-medium text-red-400">Danger zone</h3>
      <p className="mt-2 text-xs text-muted">
        Deleting this chatbot permanently removes all documents, embeddings, API keys, and conversation history. This cannot be undone.
      </p>
      <div className="mt-4 max-w-sm">
        <Input
          placeholder={`Type "${chatbotName}" to confirm`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
      </div>
      <Button
        onClick={handleDelete}
        disabled={confirmText !== chatbotName || deleting}
        className="mt-3 bg-red-500 text-white hover:brightness-110"
      >
        {deleting ? "Deleting..." : "Delete chatbot"}
      </Button>
    </div>
  );
}