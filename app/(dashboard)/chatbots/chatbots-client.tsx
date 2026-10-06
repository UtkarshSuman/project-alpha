// ============================================================================
// FEATURE: Client half of the chatbots list — shared across simple/short-term/
// long-term memory types via baseHref, defaultMemoryType, title, subtitle.
// Supports real-time text search, status filters, empty states.
// ============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Bot, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatbotCard } from "@/components/dashboard/chatbot-card";
import { CreateChatbotDialog } from "@/components/dashboard/create-chatbot-dialog";
import { cn } from "@/lib/utils";

type ChatbotItem = {
  id: string;
  name: string;
  status: string;
  createdAt: string | Date;
  _count: { documents: number };
  service: { _count: { apiKeys: number } };
};

type StatusFilter = "ALL" | "READY" | "INGESTING" | "DRAFT" | "ERROR";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "READY", label: "Ready" },
  { id: "INGESTING", label: "Ingesting" },
  { id: "DRAFT", label: "Draft" },
  { id: "ERROR", label: "Error" },
];

export function ChatbotsClient({
  initialChatbots,
  baseHref,
  defaultMemoryType,
  title,
  subtitle,
}: {
  initialChatbots: ChatbotItem[];
  baseHref: string;
  defaultMemoryType: "simple" | "short_term" | "long_term";
  title: string;
  subtitle?: string;
}) {
  const [chatbots] = useState<ChatbotItem[]>(initialChatbots);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = { ALL: chatbots.length, READY: 0, INGESTING: 0, DRAFT: 0, ERROR: 0 };
    for (const b of chatbots) {
      const s = b.status.toUpperCase() as StatusFilter;
      if (map[s] !== undefined) map[s]++;
    }
    return map;
  }, [chatbots]);

  const filtered = useMemo(() => {
    return chatbots.filter((bot) => {
      const matchesSearch = bot.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || bot.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [chatbots, search, statusFilter]);

  function handleResetFilters() {
    setSearch("");
    setStatusFilter("ALL");
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} className="mr-1.5" /> New chatbot
        </Button>
      </div>

      {/* ── Controls Bar: Search & Status Filters ────────────── */}
      {chatbots.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name..."
              className="pl-8 text-sm"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((f) => {
              const count = counts[f.id];
              const active = statusFilter === f.id;
              if (count === 0 && f.id !== "ALL" && !active) return null;

              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
                    active ? "bg-surface-hover text-text ring-1 ring-line" : "text-muted hover:bg-surface-hover hover:text-text"
                  )}
                >
                  <span>{f.label}</span>
                  <span className={cn("rounded-full px-1.5 py-0.2 text-[10px]", active ? "bg-accent/15 text-accent font-semibold" : "bg-line/60 text-muted")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Grid or Empty States ────────────────────────────── */}
      {chatbots.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-line bg-surface/40 p-12">
          <EmptyState
            icon={<Bot size={20} />}
            heading="No chatbots created yet"
            description="Create your first chatbot and upload documents to begin answering user questions from your knowledge base."
            action={<Button onClick={() => setDialogOpen(true)}>Create your first chatbot</Button>}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <Filter size={20} className="mx-auto text-muted/60 mb-2" />
          <p className="text-sm font-medium text-text">No chatbots found</p>
          <p className="mt-1 text-xs text-muted">No chatbots match your current search &ldquo;{search}&rdquo; or status filter.</p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>Reset filters</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bot) => (
            <ChatbotCard
              key={bot.id}
              id={bot.id}
              name={bot.name}
              status={bot.status}
              documentCount={bot._count.documents}
              apiKeyCount={bot.service._count.apiKeys}
              createdAt={bot.createdAt}
              baseHref={baseHref}
            />
          ))}
        </div>
      )}

      <CreateChatbotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} defaultMemoryType={defaultMemoryType} />
    </div>
  );
}