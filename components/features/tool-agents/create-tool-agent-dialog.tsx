// ============================================================================
// FEATURE: Create Tool Agent modal dialog
// Calls POST /api/tool-agents and navigates to the created agent's page.
// Uses Button loading state, Input error state, and toast feedback.
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

export function CreateToolAgentDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Agent name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tool-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create tool agent");
        setLoading(false);
        return;
      }

      toast.success("Tool agent created successfully");
      setName("");
      onClose();
      router.push(`/tool-agents/${data.toolAgent.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create tool agent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Tool agents use LLM function calling to interact with external APIs, databases,
          and web services in real time.
        </p>

        <div>
          <Label htmlFor="agent-name">Agent name</Label>
          <Input
            id="agent-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Stripe Billing Bot, Weather API Agent"
            error={error ?? undefined}
            disabled={loading}
            autoFocus
            className="mt-1"
          />
          {error && (
            <p className="mt-1.5 text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create agent
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
