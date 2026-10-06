// ============================================================================
// FEATURE: Short-term memory empty state — shown before the user has
// created their first short-term chatbot. Extracted from the original
// placeholder page's content; CTA now actually opens CreateChatbotDialog
// ============================================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateChatbotDialog } from "@/components/dashboard/create-chatbot-dialog";
import { ArrowLeft, Clock, MessageSquare, Layers, Cpu, Plus } from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "Session-scoped memory",
    description:
      "The chatbot remembers everything said in the current conversation. Follow-up questions, pronouns, and references resolve correctly across multiple turns.",
  },
  {
    icon: MessageSquare,
    title: "Multi-turn reasoning",
    description:
      "The full conversation history is passed to the LLM as context. The bot can refer back to earlier messages and build on previous answers.",
  },
  {
    icon: Layers,
    title: "RAG + memory combined",
    description:
      "Still retrieves relevant document chunks for grounded answers — the memory layer sits on top. You get both context-awareness and knowledge retrieval.",
  },
  {
    icon: Cpu,
    title: "Automatic history trimming",
    description:
      "Older messages are trimmed against a character budget as the conversation grows — no manual management needed.",
  },
];

export function ShortTermEmptyState() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="max-w-3xl space-y-10">
      <Link href="/chatbots/overview" className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-text">
        <ArrowLeft size={13} />
        Back to Chatbots
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-2/20 bg-accent-2/5 px-3 py-1">
          <Clock size={13} className="text-accent-2" />
          <span className="font-mono text-[11px] text-accent-2 tracking-wide">Live</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-text leading-tight">Short-term Memory Chatbots</h1>
          <p className="mt-3 text-body-md text-muted leading-relaxed">
            Chatbots that remember the full conversation within a session. Visitors can ask
            follow-up questions, refer to earlier answers, and have genuinely multi-turn
            conversations — not just one-shot Q&amp;A.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface px-5 py-4 text-sm">
          <span className="font-medium text-text">How it differs from Simple Chatbots: </span>
          <span className="text-muted">
            Simple chatbots treat every message independently. Short-term memory chatbots pass
            the full conversation history to the LLM, enabling coherent multi-turn dialogue.
            Memory resets when the session ends.
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
                <Icon size={15} className="text-accent-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{title}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text">Ready when you are</p>
          <p className="mt-0.5 text-xs text-muted">Create your first short-term memory chatbot to get started.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus size={14} className="mr-1.5" />
          Create short-term chatbot
        </Button>
      </div>

      <CreateChatbotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} defaultMemoryType="short_term" />
    </div>
  );
}