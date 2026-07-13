// ============================================================================
// FEATURE: Create-chatbot dialog
// Calls POST /api/chat (your renamed CRUD route) and redirects to the new
// chatbot's page on success — where the next section (file upload) happens.
// Handles the FREE-plan-limit 403 response from the API with a real message
// instead of a generic error.
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateChatbotDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/chatbots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const { chatbot } = await res.json();
    onClose();
    router.push(`/chatbots/${chatbot.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create a chatbot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="chatbot-name">Name</Label>
          <Input
            id="chatbot-name"
            placeholder="e.g. Support Bot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full">
          {loading ? "Creating..." : "Create chatbot"}
        </Button>
      </form>
    </Dialog>
  );
}