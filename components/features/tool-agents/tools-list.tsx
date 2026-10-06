// ============================================================================
// FEATURE: Tools List Component
// Displays attached tools, toggle switches, parameter schema viewer, and delete.
// ============================================================================

"use client";

import { useState } from "react";
import { Plus, Trash2, Globe, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/lib/hooks/use-toast";
import { ToolDefinitionModal, type ToolItem } from "./tool-definition-modal";

type Props = {
  toolAgentId: string;
  initialTools: ToolItem[];
};

export function ToolsList({ toolAgentId, initialTools }: Props) {
  const [tools, setTools] = useState<ToolItem[]>(initialTools);
  const [modalOpen, setModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleToggle(toolId: string, currentEnabled: boolean) {
    setTogglingId(toolId);
    try {
      const res = await fetch(`/api/tool-agents/${toolAgentId}/tools/${toolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (!res.ok) {
        toast.error("Failed to toggle tool status");
        return;
      }

      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, enabled: !currentEnabled } : t))
      );
      toast.success(!currentEnabled ? "Tool enabled" : "Tool disabled");
    } catch {
      toast.error("Error updating tool status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(toolId: string, name: string) {
    if (!confirm(`Are you sure you want to remove the tool "${name}"?`)) return;

    setDeletingId(toolId);
    try {
      const res = await fetch(`/api/tool-agents/${toolAgentId}/tools/${toolId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete tool");
        return;
      }

      setTools((prev) => prev.filter((t) => t.id !== toolId));
      toast.success("Tool removed");
    } catch {
      toast.error("Network error deleting tool");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-medium text-text">
            Configured Tools <span className="text-sm font-normal text-muted">({tools.length})</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            The AI model inspects these function signatures and invokes them when relevant.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-1.5" /> Add Tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-surface/50 p-8">
          <EmptyState
            icon={<Globe size={20} />}
            heading="No tools connected yet"
            description="Add an API endpoint (REST/JSON) that this agent can call during conversations."
            action={
              <Button onClick={() => setModalOpen(true)}>
                Add your first tool
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-hover sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-text">
                    {tool.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      tool.method === "GET"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {tool.method}
                  </span>
                  {!tool.enabled && (
                    <span className="rounded bg-muted/20 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      Disabled
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
                  {tool.description}
                </p>

                <div className="mt-2 flex items-center gap-4 text-[11px] text-muted font-mono">
                  <span className="truncate max-w-sm">{tool.url}</span>
                  <span className="flex items-center gap-1 opacity-70">
                    <Code2 size={12} />
                    {Object.keys(tool.paramsSchema?.properties ?? {}).length} params
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0 border-t border-line/40 pt-3 sm:border-0 sm:pt-0">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    disabled={togglingId === tool.id}
                    onChange={() => handleToggle(tool.id, tool.enabled)}
                    className="accent-accent cursor-pointer rounded"
                  />
                  <span>Enabled</span>
                </label>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === tool.id}
                  onClick={() => handleDelete(tool.id, tool.name)}
                  className="text-muted hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToolDefinitionModal
        toolAgentId={toolAgentId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(newTool) => setTools((prev) => [...prev, newTool])}
      />
    </div>
  );
}
