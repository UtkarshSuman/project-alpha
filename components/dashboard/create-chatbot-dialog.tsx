// ============================================================================
// FEATURE: Create-chatbot dialog
// Memory type is NOT user-selectable here — it's fixed by which page the
// dialog was opened from (defaultMemoryType, passed in by the parent page).
// This matches the actual product structure: /chatbots, /chatbots/short-term,
// and /chatbots/long-term are separate services, not one form with a toggle.
// Handles plan limits gracefully, with loading states and toast notifications.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateChatbotDialog({
  open,
  onClose,
  defaultMemoryType = "simple",
}: {
  open: boolean;
  onClose: () => void;
  defaultMemoryType?: "simple" | "short_term" | "long_term";
}) {
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
      body: JSON.stringify({ name, memoryType: defaultMemoryType }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    const { chatbot } = await res.json();
    onClose();
    const base =
      chatbot.memoryType === "short_term" ? "/chatbots/short-term" :
      chatbot.memoryType === "long_term" ? "/chatbots/long-term" :
      "/chatbots";
    router.push(`${base}/${chatbot.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create a chatbot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="chatbot-name">Name</Label>
          <Input id="chatbot-name" placeholder="e.g. Support Bot" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full">{loading ? "Creating..." : "Create chatbot"}</Button>
      </form>
    </Dialog>
  );
}