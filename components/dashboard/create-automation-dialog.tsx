// FEATURE: Create automation agent dialog
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateAutomationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/automation-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    const { automationAgent } = await res.json();
    onClose();
    router.push(`/automation-agents/${automationAgent.id}/settings`);
    router.refresh();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create a lead automation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="automation-name">Name</Label>
          <Input id="automation-name" placeholder="e.g. Website Lead Qualifier" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full">{loading ? "Creating..." : "Create"}</Button>
      </form>
    </Dialog>
  );
}