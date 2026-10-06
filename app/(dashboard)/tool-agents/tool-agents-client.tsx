// ============================================================================
// FEATURE: Tool Agents list client component
// Search filter, empty state with UI primitive, create dialog, and URL param handler.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ToolAgentCard } from "@/components/features/tool-agents/tool-agent-card";
import { CreateToolAgentDialog } from "@/components/features/tool-agents/create-tool-agent-dialog";

export type ToolAgentSummary = {
  id: string;
  name: string;
  model: string;
  _count: { tools: number };
  service: {
    apiKeys: { id: string }[];
  };
};

type Props = {
  initialAgents: ToolAgentSummary[];
};

export function ToolAgentsClient({ initialAgents }: Props) {
  const [agents] = useState<ToolAgentSummary[]>(initialAgents);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const searchParams = useSearchParams();

  // Support ?create=1 redirection (e.g. from /services/new/tool)
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Tool Agents</h1>
          <p className="mt-1 text-sm text-muted">
            Autonomous assistants equipped with custom REST functions to perform actions.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New tool agent
        </Button>
      </div>

      {/* Search / Filter bar (only when agents exist) */}
      {agents.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-8 text-sm"
          />
        </div>
      )}

      {/* Content Grid or Empty State */}
      {agents.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-line bg-surface/40 p-12">
          <EmptyState
            icon={<Zap size={20} />}
            heading="No tool agents created yet"
            description="Create an agent and connect API tools so it can query databases, call webhooks, or perform calculations."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                Create your first tool agent
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
          No tool agents match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <ToolAgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              model={agent.model}
              toolCount={agent._count.tools}
              apiKeyCount={agent.service.apiKeys.length}
            />
          ))}
        </div>
      )}

      <CreateToolAgentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
