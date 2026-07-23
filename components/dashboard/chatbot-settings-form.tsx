// ============================================================================
// FEATURE: Chatbot settings form — system prompt, model behavior, widget
// branding, and guardrail toggles. All fields map directly to the schema
// ============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ChatbotSettings = {
  name: string;
  systemPrompt: string;
  temperature: number;
  widgetTitle: string;
  widgetColor: string;
  widgetLogoUrl: string | null;
  welcomeMessage: string;
  restrictToContext: boolean;
  leadCaptureEnabled: boolean;
};

export function ChatbotSettingsForm({ chatbotid, initial }: { chatbotid: string; initial: ChatbotSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/chatbots/${chatbotid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, widgetLogoUrl: form.widgetLogoUrl || "" }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* --- General --- */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">General</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Chatbot name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="systemPrompt">System prompt</Label>
            <textarea
              id="systemPrompt"
              value={form.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
              rows={5}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent-2 focus:outline-none"
              placeholder="You are a helpful assistant. Only answer using the provided context."
            />
            <p className="mt-1 text-xs text-muted">This is prepended to every conversation — controls the bot's tone and role.</p>
          </div>
          <div>
            <Label htmlFor="temperature">Response creativity ({form.temperature.toFixed(1)})</Label>
            <input
              id="temperature"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={form.temperature}
              onChange={(e) => update("temperature", parseFloat(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Widget branding --- */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Widget appearance</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="widgetTitle">Widget title</Label>
            <Input id="widgetTitle" value={form.widgetTitle} onChange={(e) => update("widgetTitle", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="welcomeMessage">Welcome message</Label>
            <Input id="welcomeMessage" value={form.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="widgetColor">Accent color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.widgetColor}
                onChange={(e) => update("widgetColor", e.target.value)}
                className="h-9 w-14 cursor-pointer rounded border border-line bg-transparent"
              />
              <Input value={form.widgetColor} onChange={(e) => update("widgetColor", e.target.value)} className="max-w-[120px]" />
            </div>
          </div>
          <div>
            <Label htmlFor="widgetLogoUrl">Logo URL (optional)</Label>
            <Input
              id="widgetLogoUrl"
              placeholder="https://yoursite.com/logo.png"
              value={form.widgetLogoUrl ?? ""}
              onChange={(e) => update("widgetLogoUrl", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- Guardrails --- */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="font-display text-sm font-medium">Guardrails</h3>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2.5 text-sm text-text">
            <input
              type="checkbox"
              checked={form.restrictToContext}
              onChange={(e) => update("restrictToContext", e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Only answer from uploaded documents (recommended)
          </label>
          <label className="flex items-center gap-2.5 text-sm text-text">
            <input
              type="checkbox"
              checked={form.leadCaptureEnabled}
              onChange={(e) => update("leadCaptureEnabled", e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Ask for visitor email when the bot can't answer
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit">{saving ? "Saving..." : saved ? "Saved ✓" : "Save settings"}</Button>
    </form>
  );
}