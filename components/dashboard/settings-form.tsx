// FEATURE: Organization settings form — rename org, view account email
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SettingsForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/organization", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Workspace</h3>
        <form onSubmit={handleSave} className="mt-4 max-w-sm space-y-3">
          <div>
            <Label htmlFor="org-name">Workspace name</Label>
            <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit">{saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}</Button>
        </form>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Account</h3>
        <p className="mt-3 text-sm text-muted">Signed in as</p>
        <p className="text-sm text-text">{email}</p>
      </div>
    </div>
  );
}