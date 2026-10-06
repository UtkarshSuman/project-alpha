"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateAutomationDialog } from "@/components/dashboard/create-automation-dialog";
import { Plus, Zap } from "lucide-react";

type Agent = { id: string; name: string; _count: { leads: number } };

export function AutomationClient({ initialAgents }: { initialAgents: Agent[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Lead Automations</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1.5" /> New automation</Button>
      </div>

      {initialAgents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-muted">No automations yet. Create one to start qualifying and following up on leads automatically.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialAgents.map((agent) => (
            <Link key={agent.id} href={`/automation-agents/${agent.id}`} className="rounded-lg border border-line bg-surface p-5 hover:bg-surface-hover">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink">
                <Zap size={18} className="text-accent" />
              </div>
              <h3 className="mt-4 font-display font-medium">{agent.name}</h3>
              <p className="mt-1 text-xs text-muted">{agent._count.leads} lead{agent._count.leads !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      )}

      <CreateAutomationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}