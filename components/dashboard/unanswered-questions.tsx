// FEATURE: List of questions the bot couldn't answer (guardrail fallback
// triggered)
import { HelpCircle } from "lucide-react";

type UnansweredItem = { content: string; createdAt: string };

export function UnansweredQuestions({ items }: { items: UnansweredItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-muted">
        No unanswered questions yet — nice.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-md border border-line bg-surface px-4 py-3">
          <HelpCircle size={15} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-sm text-text">{item.content}</p>
            <p className="mt-1 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}