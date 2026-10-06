"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

const LAYERS = [
  {
    id: "retrieval",
    name: "Retrieval",
    status: "Live",
    title: "Knowledge that stays tied to the source",
    body: "Upload source material, watch ingest states, and keep every answer grounded in a cited passage from the workspace index.",
    points: ["PDF ingest pipeline", "Citation-backed replies", "Embeddable widget"],
  },
  {
    id: "agents",
    name: "Agents",
    status: "Soon",
    title: "Scoped tools instead of open-ended chat",
    body: "Give a service permissioned access to internal APIs, queues, and approvals so it can complete work, not just describe it.",
    points: ["Tool definitions", "Approval gates", "Run telemetry"],
  },
  {
    id: "automation",
    name: "Automation",
    status: "Soon",
    title: "Recurring decisions with a human loop",
    body: "Schedule checks, route exceptions, and keep operators in control of revenue, support, and compliance workflows.",
    points: ["Scheduled runs", "Exception queues", "Audit trail"],
  },
  {
    id: "cag",
    name: "CAG",
    status: "Soon",
    title: "Stable knowledge, lower latency",
    body: "Precompute durable context for large libraries and catalogs where retrieval hops cost more than a cached working set.",
    points: ["Warm context", "Catalog-scale sets", "Fast reads"],
  },
] as const;

export function OperatingLayer() {
  const [active, setActive] = useState(0);
  const layer = LAYERS[active];

  return (
    <section id="how-it-works" className="border-t border-line py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Operating layer</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
              Built around the lifecycle of production AI services.
            </h2>
            <p className="mt-5 max-w-md text-muted">
              One workspace, one billing plane, and a catalog that can grow without rebuilding the product around a single chatbot demo.
            </p>

            <div className="mt-8 flex flex-col border-t border-line">
              {LAYERS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "flex items-center justify-between gap-4 border-b border-line py-4 text-left transition-colors duration-fast",
                    index === active ? "text-text" : "text-muted hover:text-text"
                  )}
                  aria-current={index === active ? "true" : undefined}
                >
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-code-sm text-accent-2">0{index + 1}</span>
                    <span className="font-display text-lg font-medium">{item.name}</span>
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.14em]",
                      item.status === "Live" ? "text-success" : "text-muted"
                    )}
                  >
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-2">{layer.name}</p>
              <span
                className={cn(
                  "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                  layer.status === "Live" ? "bg-success/10 text-success" : "bg-ink text-muted"
                )}
              >
                {layer.status}
              </span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight">{layer.title}</h3>
            <p className="mt-4 max-w-xl text-body-lg leading-8 text-muted">{layer.body}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {layer.points.map((point) => (
                <li key={point} className="border border-line bg-ink px-4 py-3 text-sm text-text">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
