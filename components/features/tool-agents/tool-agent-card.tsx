// ============================================================================
// FEATURE: Tool Agent card in dashboard grid
// Displays agent status, model indicator, tool count, and active key count.
// ============================================================================

import Link from "next/link";
import { Zap, ArrowUpRight, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ToolAgentCardProps = {
  id: string;
  name: string;
  model: string;
  toolCount: number;
  apiKeyCount: number;
};

export function ToolAgentCard({ id, name, model, toolCount, apiKeyCount }: ToolAgentCardProps) {
  const status = toolCount > 0 ? "READY" : "DRAFT";

  return (
    <Link
      href={`/tool-agents/${id}`}
      className="group relative flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-fast hover:border-line-hover hover:bg-surface-hover hover:shadow-elevate-sm"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink ring-1 ring-line group-hover:ring-accent-2 transition-colors duration-fast">
            <Zap size={18} className="text-accent" />
          </div>
          <div className="flex items-center gap-2">
            <Badge status={status} />
            <ArrowUpRight
              size={14}
              className="text-muted opacity-0 transition-opacity duration-fast group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </div>

        <h3 className="mt-4 font-display font-medium text-text group-hover:text-accent transition-colors duration-fast">
          {name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Cpu size={12} className="shrink-0 text-muted/70" />
          <span className="truncate">{model.replace(/^openai\//, "")}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-line/50 pt-3">
        <p className="text-xs text-muted">
          <span className="font-medium text-text">{toolCount}</span> tool{toolCount !== 1 ? "s" : ""}
          <span className="mx-1.5 opacity-40">·</span>
          <span className="font-medium text-text">{apiKeyCount}</span> key{apiKeyCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
