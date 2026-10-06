// ============================================================================
// FEATURE: Chatbot Settings Form
// Modular sections: General, Behavior & System Prompt, and Widget Appearance.
// Features Button loading state, Textarea primitive, and toast feedback.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/hooks/use-toast";
import { WidgetThemePicker } from "@/components/dashboard/widget-theme-picker";
import { Bot, Sparkles, Sliders, Shield } from "lucide-react";

export type ChatbotSettings = {
  name: string;
  systemPrompt: string;
  temperature: number;
  widgetTitle: string;
  widgetColor: string;
  widgetLogoUrl: string | null;
  widgetPosition: string;
  widgetTheme: string;
  welcomeMessage: string;
  restrictToContext: boolean;
  leadCaptureEnabled: boolean;
  widgetSize: string;
  suggestedQuestions: string;
};

type Props = {
  chatbotid: string;
  initial: ChatbotSettings;
};

export function ChatbotSettingsForm({ chatbotid, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ChatbotSettings>(key: K, value: ChatbotSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Chatbot name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/chatbots/${chatbotid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, widgetLogoUrl: form.widgetLogoUrl || "" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data.error ?? "Failed to save settings";
        setError(err);
        toast.error(err);
        setSaving(false);
        return;
      }

      toast.success("Settings saved successfully");
      router.refresh();
    } catch {
      setError("Network error while saving settings");
      toast.error("Network error saving settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          {error}
        </div>
      )}

      {/* ── 1. General Identity ────────────────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-6 shadow-elevate-sm">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3 mb-4">
          <Bot size={17} className="text-accent" />
          <div>
            <h3 className="font-display text-base font-medium text-text">General Settings</h3>
            <p className="text-xs text-muted">Identify this chatbot and configure basic parameters.</p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <div>
            <Label htmlFor="name">Chatbot Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">
                Response Temperature: <span className="font-mono text-text">{form.temperature.toFixed(2)}</span>
              </Label>
              <span className="text-[11px] text-muted">Lower = strictly factual</span>
            </div>
            <input
              id="temperature"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.temperature}
              onChange={(e) => update("temperature", parseFloat(e.target.value))}
              className="mt-3 w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>0.0 (Grounded)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. System Prompt & Guardrails ──────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-6 shadow-elevate-sm">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3 mb-4">
          <Shield size={17} className="text-accent-2" />
          <div>
            <h3 className="font-display text-base font-medium text-text">Prompt & Guardrails</h3>
            <p className="text-xs text-muted">Direct the AI persona and control grounded response boundaries.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <span className="text-[11px] text-muted">{form.systemPrompt.length} chars</span>
            </div>
            <Textarea
              id="systemPrompt"
              value={form.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
              rows={4}
              className="mt-1.5 font-mono text-xs leading-relaxed"
              placeholder="You are a helpful customer support agent for Acme Corp..."
            />
            <p className="mt-1 text-[11px] text-muted">
              Prepended to each conversation to specify persona, formatting constraints, and domain scope.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <label className="flex items-start gap-2.5 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={form.restrictToContext}
                onChange={(e) => update("restrictToContext", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent rounded"
              />
              <div>
                <span className="font-medium">Strict context grounding (Recommended)</span>
                <p className="text-[11px] text-muted">
                  The model only answers using facts in uploaded documents, admitting when information is missing.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={form.leadCaptureEnabled}
                onChange={(e) => update("leadCaptureEnabled", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent rounded"
              />
              <div>
                <span className="font-medium">Lead capture prompt on fallback</span>
                <p className="text-[11px] text-muted">
                  Prompts visitors for their email if a question cannot be answered from documentation.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── 3. Widget Appearance & Themes ──────────────────── */}
      <div className="rounded-lg border border-line bg-surface p-6 shadow-elevate-sm">
        <div className="flex items-center gap-2 border-b border-line/40 pb-3 mb-4">
          <Sparkles size={17} className="text-accent" />
          <div>
            <h3 className="font-display text-base font-medium text-text">Widget Branding & Appearance</h3>
            <p className="text-xs text-muted">Customize the embeddable customer-facing chat dialog.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
            <div>
              <Label htmlFor="widgetTitle">Widget Header Title</Label>
              <Input
                id="widgetTitle"
                value={form.widgetTitle}
                onChange={(e) => update("widgetTitle", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="widgetColor">Accent Color</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="color"
                  value={form.widgetColor}
                  onChange={(e) => update("widgetColor", e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded border border-line bg-transparent p-0.5"
                />
                <Input
                  value={form.widgetColor}
                  onChange={(e) => update("widgetColor", e.target.value)}
                  className="font-mono text-xs max-w-[110px]"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <Label htmlFor="welcomeMessage">Welcome Greeting</Label>
            <Input
              id="welcomeMessage"
              value={form.welcomeMessage}
              onChange={(e) => update("welcomeMessage", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="max-w-xl">
            <div className="flex items-center justify-between">
              <Label htmlFor="suggestedQuestions">Suggested Starter Questions</Label>
              <span className="text-[11px] text-muted">1 per line (up to 4)</span>
            </div>
            <Textarea
              id="suggestedQuestions"
              value={form.suggestedQuestions}
              onChange={(e) => update("suggestedQuestions", e.target.value)}
              rows={3}
              className="mt-1.5 text-xs"
              placeholder={"How do I reset my password?\nWhat are your pricing tiers?\nHow do I contact support?"}
            />
          </div>

          <div className="max-w-xl">
            <Label htmlFor="widgetLogoUrl">Brand Logo URL (Optional)</Label>
            <Input
              id="widgetLogoUrl"
              placeholder="https://yourdomain.com/brand-logo.png"
              value={form.widgetLogoUrl ?? ""}
              onChange={(e) => update("widgetLogoUrl", e.target.value)}
              className="mt-1.5 font-mono text-xs"
            />
          </div>

          <div className="pt-2">
            <WidgetThemePicker
              theme={form.widgetTheme}
              position={form.widgetPosition}
              size={form.widgetSize}
              color={form.widgetColor}
              onThemeChange={(theme) => update("widgetTheme", theme)}
              onPositionChange={(position) => update("widgetPosition", position)}
              onSizeChange={(size) => update("widgetSize", size)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}