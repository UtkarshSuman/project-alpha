"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    id: "pdf",
    label: "PDF",
    chip: "ingest",
    detail: "policy-handbook.pdf · 18 pages",
  },
  {
    id: "chunks",
    label: "CHUNKS",
    chip: "parse",
    detail: "128 segments · overlap 80",
  },
  {
    id: "vectors",
    label: "VECTORS",
    chip: "embed",
    detail: "pgvector · workspace index",
  },
  {
    id: "chatbot",
    label: "CHATBOT",
    chip: "serve",
    detail: "widget + scoped API key",
  },
] as const;

const CHUNKS = [
  { id: "c01", text: "Refunds apply within 14 days of annual billing." },
  { id: "c02", text: "Enterprise seats inherit the workspace retention policy." },
  { id: "c03", text: "Widget origins must match the allowlist before serving." },
  { id: "c04", text: "Unanswered questions are logged for the next ingest." },
  { id: "c05", text: "API keys are scoped to a single service, not the org." },
  { id: "c06", text: "Ready state unlocks embed snippets and production keys." },
];

type StageIndex = 0 | 1 | 2 | 3;

export function HeroPipeline() {
  const labelId = useId();
  const [stage, setStage] = useState<StageIndex>(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused) return;

    const timer = window.setInterval(() => {
      setStage((current) => ((current + 1) % STAGES.length) as StageIndex);
      setProgressKey((key) => key + 1);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [paused]);

  function goTo(next: StageIndex) {
    setStage(next);
    setProgressKey((key) => key + 1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(((stage + 1) % STAGES.length) as StageIndex);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(((stage + STAGES.length - 1) % STAGES.length) as StageIndex);
    }
  }

  const active = STAGES[stage];

  return (
    <div
      role="region"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative outline-none"
    >
      <p id={labelId} className="sr-only">
        Live document ingestion pipeline. Use left and right arrows to change stages.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-elevate-md">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <div>
            <p className="font-display text-sm font-medium">Ingestion theater</p>
            <p className="mt-0.5 font-mono text-code-sm text-muted">job · retrieval.live</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:inline">
              {paused ? "paused" : "autoplay"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-success/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              live
            </span>
          </div>
        </div>

        <div className="border-b border-line px-3 py-3 sm:px-5">
          <ol className="grid grid-cols-4 gap-1">
            {STAGES.map((item, index) => {
              const isActive = index === stage;
              const isDone = index < stage;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index as StageIndex)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 rounded-md px-2 py-2 text-left transition-colors duration-fast",
                      isActive ? "bg-ink" : "hover:bg-ink/60"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold tracking-[0.16em]",
                        isActive ? "text-accent" : isDone ? "text-accent-2" : "text-muted"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[11px] uppercase tracking-[0.12em]",
                        isActive ? "text-text" : "text-muted"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-2 h-px overflow-hidden bg-line">
            <div
              key={progressKey}
              className={cn("h-full bg-accent-2", paused ? "" : "pipeline-progress")}
              style={paused ? { transform: "scaleX(1)" } : undefined}
            />
          </div>
        </div>

        <div className="relative min-h-[320px] bg-ink p-4 sm:min-h-[360px] sm:p-5" aria-live="polite">
          {stage === 0 && <PdfStage />}
          {stage === 1 && <ChunkStage />}
          {stage === 2 && <VectorStage />}
          {stage === 3 && <ChatStage />}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 sm:px-5">
          <p className="font-mono text-code-sm text-muted">
            <span className="text-accent-2">{active.chip}</span>
            <span className="mx-2 text-line">/</span>
            {active.detail}
          </p>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:block">
            arrows to step
          </p>
        </div>
      </div>
    </div>
  );
}

function PdfStage() {
  return (
    <div className="grid h-full items-end gap-4 sm:grid-cols-[1fr_0.72fr]">
      <div className="relative mx-auto w-full max-w-[240px]">
        <div className="absolute inset-x-6 -bottom-2 h-3 rounded-sm border border-line bg-surface" />
        <div className="absolute inset-x-3 -bottom-1 h-3 rounded-sm border border-line bg-surface-hover" />
        <div className="relative overflow-hidden rounded-sm border border-line bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">pdf</span>
            <span className="font-mono text-[10px] text-muted">18p</span>
          </div>
          <div className="space-y-2">
            <span className="block h-2 w-10/12 rounded-sm bg-text/20" />
            <span className="block h-2 w-8/12 rounded-sm bg-text/12" />
            <span className="block h-2 w-11/12 rounded-sm bg-text/16" />
            <span className="block h-2 w-6/12 rounded-sm bg-text/12" />
            <span className="block h-2 w-9/12 rounded-sm bg-text/16" />
            <span className="mt-4 block h-2 w-7/12 rounded-sm bg-text/12" />
            <span className="block h-2 w-10/12 rounded-sm bg-text/16" />
          </div>
          <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-accent/0 via-accent/35 to-accent/0" />
        </div>
      </div>
      <div className="space-y-3">
        <p className="font-display text-lg font-medium">Source lands in the workspace</p>
        <p className="text-sm leading-6 text-muted">
          Upload a handbook, policy set, or product spec. The job stays visible while parsing starts, instead of disappearing into a black box.
        </p>
        <p className="font-mono text-code-sm text-accent">status · queued for parse</p>
      </div>
    </div>
  );
}

function ChunkStage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="font-display text-lg font-medium">Pages become retrieval units</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          The document is split into overlapping chunks so answers can cite a specific passage, not a 40-page file.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHUNKS.map((chunk, index) => (
          <div
            key={chunk.id}
            className="chunk-in rounded-md border border-line bg-surface p-3"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{chunk.id}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{chunk.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VectorStage() {
  const cells = Array.from({ length: 48 });

  return (
    <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-md border border-line bg-surface p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-2">index</span>
          <span className="font-mono text-[10px] text-muted">48 dims preview</span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {cells.map((_, index) => (
            <span
              key={index}
              className={cn(
                "aspect-square rounded-sm",
                index % 7 === 0 ? "bg-accent-2 vector-lit" : index % 3 === 0 ? "bg-accent-2/35" : "bg-accent/20"
              )}
              style={{ animationDelay: `${(index % 12) * 90}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="font-display text-lg font-medium">Embeddings lock into pgvector</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Each chunk is written to the workspace index. Retrieval later searches this map, not a generic model memory.
        </p>
        <p className="mt-4 font-mono text-code-sm text-accent-2">status · embedding 96 / 128</p>
      </div>
    </div>
  );
}

function ChatStage() {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="ml-auto max-w-[86%] rounded-md bg-accent/15 px-3 py-2 text-sm leading-6">
          What is the refund window for annual plans?
        </div>
        <div className="max-w-[92%] rounded-md border border-line bg-surface px-3 py-2 text-sm leading-6">
          Annual plans can be refunded within 14 days of purchase.
          <span className="caret-blink ml-0.5 inline-block h-4 w-px align-[-2px] bg-accent-2" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-sm border border-line bg-ink px-2 py-1 font-mono text-[10px] text-muted">
          retrieval · billing-policy.pdf p.4
        </span>
        <span className="rounded-sm border border-line bg-ink px-2 py-1 font-mono text-[10px] text-muted">
          service · knowledge-retrieval
        </span>
        <span className="rounded-sm bg-success/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-success">
          ready
        </span>
      </div>
    </div>
  );
}
