// FEATURE: Automation configuration — this IS the product's customization layer
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Settings = {
  name: string; qualificationCriteria: string; redFlags: string;
  followUpTone: string; notifyEmail: string;
  widgetTitle: string; widgetColor: string; successMessage: string;
};

export function AutomationSettingsForm({ agentId, initial }: { agentId: string; initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/automation-agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Qualification</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="criteria">What makes a lead qualified?</Label>
            <textarea
              id="criteria" rows={3} value={form.qualificationCriteria}
              onChange={(e) => update("qualificationCriteria", e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent-2 focus:outline-none"
            />
          </div>
          <div>
            <Label htmlFor="redflags">Red flags (optional)</Label>
            <textarea
              id="redflags" rows={2} value={form.redFlags}
              onChange={(e) => update("redFlags", e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Follow-up</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="tone">Tone & instructions</Label>
            <textarea
              id="tone" rows={2} value={form.followUpTone}
              onChange={(e) => update("followUpTone", e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent-2 focus:outline-none"
            />
          </div>
          <div>
            <Label htmlFor="notify">Notify this email on qualified leads</Label>
            <Input id="notify" type="email" value={form.notifyEmail} onChange={(e) => update("notifyEmail", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Form appearance</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="widgetTitle">Form title</Label>
            <Input id="widgetTitle" value={form.widgetTitle} onChange={(e) => update("widgetTitle", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="widgetColor">Accent color</Label>
            <input type="color" value={form.widgetColor} onChange={(e) => update("widgetColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-line bg-transparent" />
          </div>
          <div>
            <Label htmlFor="successMessage">Success message</Label>
            <Input id="successMessage" value={form.successMessage} onChange={(e) => update("successMessage", e.target.value)} />
          </div>
        </div>
      </div>

      <Button type="submit">{saving ? "Saving..." : saved ? "Saved ✓" : "Save settings"}</Button>
    </form>
  );
}