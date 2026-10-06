// FEATURE: Memory viewer — list/search/delete facts stored about visitors.
// Immediate delete per-row (matches existing doc/key delete UX elsewhere);
// inline two-step confirm for the more destructive "clear all" action.
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Memory = { id: string; visitorIdentifier: string; content: string; importance: number; createdAt: string };

export function MemoryViewer({ chatbotid, initialMemories }: { chatbotid: string; initialMemories: Memory[] }) {
  const [memories, setMemories] = useState(initialMemories);
  const [search, setSearch] = useState("");
  const [confirmingClear, setConfirmingClear] = useState<string | null>(null);

  const filtered = search
    ? memories.filter((m) => m.visitorIdentifier.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase()))
    : memories;

  async function handleDelete(id: string) {
    await fetch(`/api/chatbots/${chatbotid}/memories/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleClearVisitor(visitorId: string) {
    await fetch(`/api/chatbots/${chatbotid}/memories?visitorId=${encodeURIComponent(visitorId)}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.visitorIdentifier !== visitorId));
    setConfirmingClear(null);
  }

  return (
    <div>
      <Input placeholder="Search by visitor or content..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No memories found.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-md border border-line bg-surface px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-text">{m.content}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{m.visitorIdentifier}</p>
                  <p className="text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {confirmingClear === m.visitorIdentifier ? (
                    <>
                      <Button onClick={() => handleClearVisitor(m.visitorIdentifier)} className="bg-red-500 text-white hover:brightness-110">Confirm clear all</Button>
                      <Button onClick={() => setConfirmingClear(null)} variant="ghost">Cancel</Button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmingClear(m.visitorIdentifier)} className="text-xs text-muted hover:text-red-400">
                      Clear all for visitor
                    </button>
                  )}
                  <button onClick={() => handleDelete(m.id)} className="text-muted hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}