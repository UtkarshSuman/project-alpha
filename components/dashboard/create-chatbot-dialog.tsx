// ============================================================================
// FEATURE: Create-chatbot dialog
// Calls POST /api/chatbots and redirects to the new chatbot's page on success.
// Handles plan limits gracefully, with loading states and toast notifications.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateChatbotDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Chatbot name is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to create chatbot.");
        setLoading(false);
        return;
      }

      onClose();
      setName("");
      toast.success("Chatbot created");
      router.push(`/chatbots/${data.chatbot.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      setName("");
      setError(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create a chatbot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Give your chatbot a name. You can upload knowledge base documents and configure retrieval
          parameters immediately after creation.
        </p>

        <div>
          <Label htmlFor="chatbot-name">Name</Label>
          <Input
            id="chatbot-name"
            placeholder="e.g. Customer Support, Sales Assistant"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            disabled={loading}
            required
            autoFocus
            className="mt-1"
          />
          {error && (
            <p className="mt-1.5 text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-line/40">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create chatbot
          </Button>
        </div>
      </form>
    </Dialog>
  );
}