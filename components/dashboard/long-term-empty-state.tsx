// ============================================================================
// FEATURE: Long-term/persistent memory empty state — same pattern as
// short-term's, CTA opens CreateChatbotDialog with memoryType locked to
// long_term.
// ============================================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateChatbotDialog } from "@/components/dashboard/create-chatbot-dialog";
import { ArrowLeft, Database, User, RefreshCw, Shield, Plus } from "lucide-react";

const FEATURES = [
  {
    icon: Database,
    title: "Persistent memory store",
    description:
      "Key facts, preferences, and context from past conversations are extracted and stored per-visitor in the database. Memory survives indefinitely — not just for the current session.",
  },
  {
    icon: User,
    title: "Per-visitor recall",
    description:
      "When a returning visitor starts a new conversation, the chatbot semantically retrieves relevant memories from their history and personalises responses accordingly.",
  },
  {
    icon: RefreshCw,
    title: "Continuous memory update",
    description:
      "After each conversation, new facts are extracted in the background and merged into the visitor's memory store. The bot gets smarter with each interaction.",
  },
  {
    icon: Shield,
    title: "Memory access controls",
    description:
      "You can inspect, search, and delete any stored memory — individually or all at once for a given visitor — from the Memories tab.",
  },
];

export function LongTermEmptyState() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="max-w-3xl space-y-10">
      <Link href="/chatbots/overview" className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text">
        <ArrowLeft size={13} />
        Back to Chatbots
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
          <Database size={13} className="text-accent" />
          <span className="font-mono text-[11px] text-accent tracking-wide">Live</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-text leading-tight">Persistent Memory Chatbots</h1>
          <p className="mt-3 text-body-md text-muted leading-relaxed">
            Chatbots that remember your visitors across every conversation — permanently. Build
            genuinely personalised AI assistants that grow smarter with each interaction and
            never forget what matters.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface px-5 py-4 text-sm">
          <span className="font-medium text-text">How it differs from Short-term Memory: </span>
          <span className="text-muted">
            Short-term memory resets when the session ends. Persistent memory is stored in the
            database and survives indefinitely. When a visitor returns weeks later, the chatbot
            still knows who they are and what they care about.
          </span>
        </div>
      </div>

      <div className="h-px bg-line" />

      <div className="space-y-4">
        <h2 className="font-display text-base font-semibold text-text">What you get</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-line bg-surface p-5 space-y-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink ring-1 ring-line">
                <Icon size={15} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{title}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface divide-y divide-line">
        <div className="px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted/60">Memory lifecycle</p>
        </div>
        {[
          { step: "01", label: "Visitor sends message", note: "Session begins, visitor identity resolved" },
          { step: "02", label: "Memory retrieval", note: "Relevant past memories semantically matched to the current question" },
          { step: "03", label: "RAG + memory context", note: "Both document chunks and visitor memories passed to the model" },
          { step: "04", label: "Response generated", note: "Personalised, grounded answer streamed back" },
          { step: "05", label: "Memory extraction", note: "New facts extracted in the background and persisted after the exchange" },
        ].map(({ step, label, note }) => (
          <div key={step} className="flex items-center gap-4 px-5 py-3.5">
            <span className="font-mono text-[11px] text-muted/40 shrink-0 w-6">{step}</span>
            <div>
              <p className="text-sm font-medium text-text">{label}</p>
              <p className="text-xs text-muted">{note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Ready when you are</p>
          <p className="mt-0.5 text-xs text-muted">Create your first persistent memory chatbot to get started.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus size={14} className="mr-1.5" />
          Create persistent chatbot
        </Button>
      </div>

      <CreateChatbotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} defaultMemoryType="long_term" />
    </div>
  );
}