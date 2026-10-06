// ============================================================================
// FEATURE: Unanswered Questions Telemetry
// Highlights content gaps in uploaded documentation where the bot triggered fallback.
// ============================================================================

"use client";

import { useState } from "react";
import { HelpCircle, Search, FileQuestion, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type UnansweredItem = { content: string; createdAt: string };

type Props = {
  chatbotid: string;
  items: UnansweredItem[];
};

export function UnansweredQuestions({ chatbotid, items }: Props) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) =>
    item.content.toLowerCase().includes(search.toLowerCase())
  );

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface/50 p-6 text-center text-xs text-muted">
        No unanswered questions reported in recent conversations. All user queries were grounded in documentation.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden shadow-elevate-sm">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line p-4 bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <FileQuestion size={16} className="text-accent" />
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider">
              Content Gaps Detected ({items.length})
            </h3>
            <p className="text-[11px] text-muted">
              Questions that triggered the fallback response. Consider adding these topics to your knowledge base.
            </p>
          </div>
        </div>

        {items.length > 3 && (
          <div className="relative max-w-xs w-full sm:w-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gaps..."
              className="pl-7 text-xs h-7"
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-line/40 max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted">
            No questions match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          filtered.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 p-3.5 transition-colors hover:bg-surface-hover/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <HelpCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs font-medium text-text leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="font-mono text-[10px] text-muted">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Link
                  href={`/chatbots/${chatbotid}`}
                  className="inline-flex items-center gap-1 rounded bg-surface-hover px-2 py-1 text-[11px] font-medium text-accent hover:text-accent-2 transition-colors"
                >
                  Upload doc <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}