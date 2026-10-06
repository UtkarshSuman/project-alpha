// ============================================================================
// FEATURE: Captured leads list and table
// Sortable/searchable view of prospective visitor emails and initiating queries.
// ============================================================================

"use client";

import { useState } from "react";
import { Mail, HelpCircle, Copy, Check, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

type Lead = {
  visitorEmail: string;
  question: string | null;
  createdAt: string;
};

export function LeadsList({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const filtered = leads.filter(
    (l) =>
      l.visitorEmail.toLowerCase().includes(search.toLowerCase()) ||
      (l.question && l.question.toLowerCase().includes(search.toLowerCase()))
  );

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success(`Copied ${email}`);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  function handleExportCsv() {
    if (leads.length === 0) return;
    const header = "Email,Question,CapturedAt\n";
    const rows = leads
      .map((l) => `"${l.visitorEmail}","${(l.question ?? "").replace(/"/g, '""')}","${l.createdAt}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `chatbot_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads exported to CSV");
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface/50 p-8 text-center text-sm text-muted">
        No visitor leads captured yet. Configure your chatbot widget to prompt visitors for their email before or during conversation.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden shadow-elevate-sm">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line p-4 bg-surface-hover/30">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or query..."
            className="pl-8 text-xs h-8"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleExportCsv}
          className="text-xs self-start sm:self-auto"
        >
          <Download size={13} className="mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-surface-hover/50 text-muted font-medium">
              <th className="py-2.5 px-4">Visitor Email</th>
              <th className="py-2.5 px-4">Initiating Question</th>
              <th className="py-2.5 px-4 text-right">Captured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted">
                  No leads match &ldquo;{search}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map((lead, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-surface-hover/50 group"
                >
                  <td className="py-3 px-4 font-medium text-text">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-accent-2 shrink-0" />
                      <span>{lead.visitorEmail}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(lead.visitorEmail)}
                        title="Copy email"
                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-text transition-opacity ml-1"
                      >
                        {copiedEmail === lead.visitorEmail ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted max-w-md">
                    {lead.question ? (
                      <span className="truncate block" title={lead.question}>
                        {lead.question}
                      </span>
                    ) : (
                      <span className="italic text-muted/50">Direct conversation</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-muted whitespace-nowrap font-mono text-[11px]">
                    {new Date(lead.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}