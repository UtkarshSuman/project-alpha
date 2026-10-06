// ============================================================================
// FEATURE: Clear conversation and analytics history
// Non-destructive to documents/keys — resets visitor chat logs and telemetry.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";
import { RotateCcw, AlertCircle } from "lucide-react";

export function ClearDataZone({ chatbotid }: { chatbotid: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    try {
      const res = await fetch(`/api/chatbots/${chatbotid}/clear-data`, { method: "POST" });
      setClearing(false);
      setConfirming(false);

      if (res.ok) {
        const data = await res.json();
        toast.success(
          `Cleared ${data.deletedConversations} conversation${
            data.deletedConversations !== 1 ? "s" : ""
          }`
        );
        router.refresh();
      } else {
        toast.error("Failed to clear conversation history");
      }
    } catch {
      toast.error("Network error while clearing history");
      setClearing(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-6 shadow-elevate-sm">
      <div className="flex items-center gap-2">
        <RotateCcw size={16} className="text-muted" />
        <h3 className="font-display text-base font-medium text-text">
          Clear Conversation History
        </h3>
      </div>
      <p className="mt-1 text-xs text-muted leading-relaxed max-w-xl">
        Deletes all logged conversations, messages, and captured leads for this chatbot. Documents,
        embeddings, and API keys remain completely untouched. Useful for resetting test data before going live.
      </p>

      {!confirming ? (
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => setConfirming(true)}
            variant="secondary"
            size="sm"
          >
            Clear History
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-line p-3 sm:flex-row sm:items-center sm:justify-between max-w-lg bg-surface-hover/30">
          <p className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertCircle size={14} className="shrink-0" />
            <span>Are you sure? This cannot be undone.</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={clearing}
              onClick={handleClear}
            >
              Confirm Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={clearing}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}