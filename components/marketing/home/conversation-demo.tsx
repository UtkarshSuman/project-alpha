"use client";

import { useState } from "react";
import { MessageSquare, Clock, Database, Send, Sparkles } from "lucide-react";

const MEMORY_MODES = [
  {
    id: "stateless",
    name: "Stateless RAG",
    icon: MessageSquare,
    tag: "Simple",
    desc: "Single-turn factual Q&A. Answers cite specific passages from your documents with zero context leakage.",
  },
  {
    id: "short_term",
    name: "Session Memory",
    icon: Clock,
    tag: "Multi-turn",
    desc: "Full conversation history persists during the active browser session via Redis/DB, then cleanly resets.",
  },
  {
    id: "long_term",
    name: "Persistent Memory",
    icon: Database,
    tag: "Permanent",
    desc: "Extracts facts, preferences, and profile context that survive across devices and future visits.",
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  citation?: string;
  memoryRecall?: string;
}

export function ConversationDemo() {
  const [selectedMode, setSelectedMode] = useState<string>("short_term");
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "user",
      content: "Can I get a refund for my annual subscription?",
    },
    {
      role: "assistant",
      content:
        "Yes, according to our terms, annual subscriptions are eligible for a full refund within 14 days of purchase.",
      citation: "billing-handbook.pdf · p.4",
      memoryRecall: "Recognized as customer on Pro Plan (Team Seat)",
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: inputVal },
      {
        role: "assistant",
        content: `I've noted that! Under ${selectedMode.replace("_", " ")} mode, I can resolve this immediately from your workspace knowledge base.`,
        citation: "workspace-index.v2",
        memoryRecall: selectedMode === "long_term" ? "Saved to permanent user memory" : undefined,
      },
    ]);
    setInputVal("");
  };

  return (
    <section className="border-b border-line bg-ink py-16 md:py-24 transition-colors duration-fast">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Narrative and Memory Controls */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Conversational Surface
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
              And yes, it can power intelligent conversations.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Embed a customized widget on your website or use our headless API.
              Equip conversations with grounded document retrieval, live API
              actions, and controllable memory lifecycles.
            </p>

            {/* Memory Mode Selection List */}
            <div className="mt-8 space-y-3">
              {MEMORY_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30"
                        : "border-line bg-surface hover:border-text/30 hover:bg-surface-hover"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-accent text-white"
                          : "bg-surface-hover text-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-text">
                          {mode.name}
                        </span>
                        <span className="rounded-full bg-surface-hover px-2 py-0.5 font-mono text-[10px] text-muted">
                          {mode.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {mode.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Simulated Live Chatbot Surface */}
          <div className="lg:col-span-6">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-line bg-surface-hover/70 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-text">
                      Uveriq Support AI
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Memory: {selectedMode.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <span className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[10px] font-medium text-muted">
                  pgvector live
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="space-y-4 p-5 max-h-[380px] overflow-y-auto bg-ink/40">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-accent text-white rounded-br-xs"
                          : "border border-line bg-surface text-text rounded-bl-xs shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.citation && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="font-mono text-accent font-medium">
                          Citation: {m.citation}
                        </span>
                        {m.memoryRecall && (
                          <span className="rounded bg-pink-500/10 px-1.5 py-0.5 text-pink-500 font-mono text-[9px]">
                            {m.memoryRecall}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={handleSend}
                className="border-t border-line bg-surface p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask a question about your documents..."
                  className="flex-1 rounded-xl border border-line bg-ink/50 px-3.5 py-2 text-xs text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm hover:brightness-110 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
