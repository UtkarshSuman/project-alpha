// ============================================================================
// FEATURE: Tool Agent Settings Form
// Configures prompts, models, temperature, branding, origins, and deletion.
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/hooks/use-toast";
import { AlertTriangle, Trash2 } from "lucide-react";

type AgentData = {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  widgetTitle: string;
  widgetColor: string;
  welcomeMessage: string;
  allowedOrigins: string | null;
};

type Props = {
  agent: AgentData;
};

const AVAILABLE_MODELS = [
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B (Recommended for Tools)" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (Fast)" },
];

export function ToolAgentSettingsForm({ agent }: Props) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
  const [model, setModel] = useState(agent.model);
  const [temperature, setTemperature] = useState(agent.temperature);
  const [widgetTitle, setWidgetTitle] = useState(agent.widgetTitle);
  const [widgetColor, setWidgetColor] = useState(agent.widgetColor);
  const [welcomeMessage, setWelcomeMessage] = useState(agent.welcomeMessage);
  const [allowedOrigins, setAllowedOrigins] = useState(agent.allowedOrigins ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/tool-agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          systemPrompt,
          model,
          temperature,
          widgetTitle,
          widgetColor,
          welcomeMessage,
          allowedOrigins: allowedOrigins.trim() ? allowedOrigins.trim() : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save settings");
        return;
      }

      toast.success("Agent settings saved");
      router.refresh();
    } catch {
      toast.error("Network error while updating settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteInput !== agent.name) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/tool-agents/${agent.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete agent");
        setDeleting(false);
        return;
      }

      toast.success("Tool agent deleted");
      router.push("/tool-agents");
      router.refresh();
    } catch {
      toast.error("Error deleting agent");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Core Configuration ──────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-6">
          <h3 className="font-display text-base font-medium text-text">General Settings</h3>
          <p className="mt-1 text-xs text-muted">
            Configure agent identity and execution parameters.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 max-w-md"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
              <div>
                <Label htmlFor="agent-model">Inference Model</Label>
                <select
                  id="agent-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-line bg-surface px-3 py-1 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="agent-temp">Temperature: {temperature}</Label>
                  <span className="text-[11px] text-muted">Lower = more precise</span>
                </div>
                <input
                  id="agent-temp"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-3.5 w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="agent-system">System Prompt</Label>
                <span className="text-[11px] text-muted">{systemPrompt.length} chars</span>
              </div>
              <Textarea
                id="agent-system"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={4}
                className="mt-1.5 font-mono text-xs leading-relaxed"
                placeholder="Give instructions on personality, tool selection, and domain rules..."
              />
            </div>
          </div>
        </div>

        {/* ── Widget & Embed Branding ────────────────────────── */}
        <div className="rounded-lg border border-line bg-surface p-6">
          <h3 className="font-display text-base font-medium text-text">Widget & Client Interface</h3>
          <p className="mt-1 text-xs text-muted">
            Customize the look and initial message for embedded chat interfaces.
          </p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
              <div>
                <Label htmlFor="widget-title">Header Title</Label>
                <Input
                  id="widget-title"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="widget-color">Theme Accent Color</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={widgetColor}
                    onChange={(e) => setWidgetColor(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded border border-line bg-transparent p-0.5"
                  />
                  <Input
                    value={widgetColor}
                    onChange={(e) => setWidgetColor(e.target.value)}
                    className="font-mono text-xs"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="widget-welcome">Welcome Message</Label>
              <Input
                id="widget-welcome"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="mt-1.5 max-w-xl"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowed-origins">Allowed Origins (CORS Domains)</Label>
                <span className="text-[11px] text-muted">Comma-separated</span>
              </div>
              <Input
                id="allowed-origins"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="https://app.yourdomain.com, https://example.com"
                className="mt-1.5 max-w-xl font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-muted">
                Leave empty to permit requests from any origin with a valid API key.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* ── Danger Zone ────────────────────────────────────── */}
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle size={18} />
          <h3 className="font-display text-base font-medium">Danger Zone</h3>
        </div>
        <p className="mt-1 text-xs text-muted">
          Permanently delete this tool agent, all associated tool definitions, and scoped API keys.
          This action cannot be undone.
        </p>

        {!confirmDelete ? (
          <div className="mt-4">
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} className="mr-1.5" /> Delete Agent
            </Button>
          </div>
        ) : (
          <div className="mt-4 max-w-md space-y-3 rounded-md border border-danger/20 bg-surface p-4">
            <p className="text-xs text-text">
              Type <strong className="font-mono text-danger">{agent.name}</strong> to confirm:
            </p>
            <Input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={agent.name}
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                disabled={deleteInput !== agent.name || deleting}
                loading={deleting}
                onClick={handleDelete}
              >
                Permanently Delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
