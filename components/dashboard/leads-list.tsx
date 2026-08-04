// FEATURE: Captured leads list — now shows the question alongside the email
import { Mail, HelpCircle } from "lucide-react";

type Lead = { visitorEmail: string; question: string | null; createdAt: string };

export function LeadsList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-muted">
        No leads captured yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leads.map((lead, i) => (
        <div key={i} className="rounded-md border border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-accent-2" />
            <p className="text-sm text-text">{lead.visitorEmail}</p>
          </div>
          {lead.question && (
            <div className="mt-2 flex items-start gap-2 pl-0.5">
              <HelpCircle size={13} className="mt-0.5 shrink-0 text-muted" />
              <p className="text-xs text-muted">{lead.question}</p>
            </div>
          )}
          <p className="mt-1.5 text-xs text-muted">{new Date(lead.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}