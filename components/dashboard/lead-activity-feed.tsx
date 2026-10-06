// FEATURE: Live-updating activity feed — polls while any lead is still PENDING
"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

type Lead = {
  id: string; name: string; email: string; message: string;
  status: string; score: number | null; aiReasoning: string | null;
  followUpSent: boolean; followUpBody: string | null; createdAt: string;
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  PENDING: { icon: Clock, color: "text-accent", label: "Processing..." },
  QUALIFIED: { icon: CheckCircle2, color: "text-accent-2", label: "Qualified" },
  NOT_QUALIFIED: { icon: XCircle, color: "text-muted", label: "Not qualified" },
  FAILED: { icon: AlertCircle, color: "text-red-400", label: "Failed" },
};

export function LeadActivityFeed({ agentId, initialLeads }: { agentId: string; initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  useEffect(() => {
    const hasPending = leads.some((l) => l.status === "PENDING");
    if (!hasPending) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/automation-agents/${agentId}/leads`);
      if (res.ok) setLeads((await res.json()).leads);
    }, 3000);
    return () => clearInterval(interval);
  }, [leads, agentId]);

  if (leads.length === 0) {
    return <div className="rounded-lg border border-line bg-surface p-8 text-center text-muted">No leads yet. Embed the form on your site to start receiving them.</div>;
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.PENDING;
        const Icon = cfg.icon;
        return (
          <div key={lead.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text">{lead.name} &middot; <span className="text-muted">{lead.email}</span></p>
                <p className="mt-1 text-sm text-muted">{lead.message}</p>
              </div>
              <div className={`flex shrink-0 items-center gap-1.5 text-xs ${cfg.color}`}>
                <Icon size={14} />
                {cfg.label}
              </div>
            </div>

            {lead.aiReasoning && (
              <p className="mt-2 text-xs text-muted">AI: {lead.aiReasoning} {lead.score !== null && `(score: ${lead.score.toFixed(2)})`}</p>
            )}

            {lead.followUpSent && lead.followUpBody && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-ink p-3">
                <Mail size={13} className="mt-0.5 shrink-0 text-accent-2" />
                <p className="text-xs text-muted">{lead.followUpBody}</p>
              </div>
            )}

            <p className="mt-2 text-xs text-muted/60">{new Date(lead.createdAt).toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}