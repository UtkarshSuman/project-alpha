"use client";

import { useState } from "react";
import { MessageSquare, Clock, Database, Send, Sparkles, Check } from "lucide-react";

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
    <section className="border-b border-slate-200/80 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Narrative and Memory Controls */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Conversational Surface
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              And yes, it can power intelligent conversations.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
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
                        ? "border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-slate-900">
                          {mode.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                          {mode.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
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
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-slate-900">
                      Uveriq Support AI
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Memory: {selectedMode.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-medium text-slate-600">
                  pgvector live
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="space-y-4 p-5 max-h-[380px] overflow-y-auto bg-slate-50/30">
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
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "border border-slate-200/80 bg-white text-slate-800 rounded-bl-xs shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.citation && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="font-mono text-blue-600 font-medium">
                          Citation: {m.citation}
                        </span>
                        {m.memoryRecall && (
                          <span className="rounded bg-pink-50 px-1.5 py-0.5 text-pink-700 font-mono text-[9px]">
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
                className="border-t border-slate-100 bg-white p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask a question about your documents..."
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
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
