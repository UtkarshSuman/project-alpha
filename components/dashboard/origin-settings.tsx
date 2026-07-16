// ============================================================================
// FEATURE: Domain restriction settings — lets customers lock their API key
// to specific domains. Empty = unrestricted (default, dev-friendly).
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function OriginSettings({ chatbotid, initialValue }: { chatbotid: string; initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/chatbots/${chatbotid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowedOrigins: value }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-accent-2" />
        <h3 className="font-display text-sm font-medium">Allowed domains</h3>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Restrict this chatbot's API key to specific websites. Leave blank during testing — set this before going live.
      </p>
      <div className="mt-3">
        <Label htmlFor="origins">Domains (comma-separated)</Label>
        <Input
          id="origins"
          placeholder="example.com, shop.example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} variant="secondary" className="mt-3">
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
      </Button>
    </div>
  );
}