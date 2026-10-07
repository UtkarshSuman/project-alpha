"use client";

import { useState } from "react";
import {
  FileCode,
  Link2,
  Rocket,
  Play,
  Activity,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const STAGES = [
  {
    id: "define",
    title: "DEFINE",
    sub: "Model & Schema",
    icon: FileCode,
    badge: "01",
    description: "Specify system instructions, allowed tools, and memory scope.",
    preview: {
      type: "code",
      header: "service.config.ts",
      lines: [
        'name: "finance_analyst"',
        'model: "gpt-4o"',
        'memory: "session"',
        'tools: ["fetch_revenue", "fx_rates"]',
      ],
    },
  },
  {
    id: "connect",
    title: "CONNECT",
    sub: "Data & APIs",
    icon: Link2,
    badge: "02",
    description: "Plug in pgvector embeddings, internal REST APIs, and documents.",
    preview: {
      type: "badges",
      header: "Connected Endpoints",
      items: [
        { name: "Postgres (pgvector)", status: "Active" },
        { name: "REST API /orders", status: "200 OK" },
        { name: "policy.pdf (18p)", status: "Indexed" },
      ],
    },
  },
  {
    id: "deploy",
    title: "DEPLOY",
    sub: "Scoped Keys",
    icon: Rocket,
    badge: "03",
    description: "Instant zero-downtime deployment with isolated API keys.",
    preview: {
      type: "key",
      header: "Production Surface",
      keyName: "uveriq_live_948f...",
      status: "Ready",
      target: "/api/chat/service_ops",
    },
  },
  {
    id: "execute",
    title: "EXECUTE",
    sub: "Live Invocation",
    icon: Play,
    badge: "04",
    description: "Real-time streaming inference with automated tool resolution.",
    preview: {
      type: "chat",
      header: "Streaming Response",
      user: "Order 44829 ETA?",
      bot: "Departed hub · Arrival 2:00 PM",
    },
  },
  {
    id: "observe",
    title: "OBSERVE",
    sub: "Telemetry",
    icon: Activity,
    badge: "05",
    description: "Monitor tokens, latency histograms, and tool execution traces.",
    preview: {
      type: "metric",
      header: "Telemetry Stream",
      latency: "142ms",
      success: "99.9%",
      p95: "210ms",
    },
  },
  {
    id: "scale",
    title: "SCALE",
    sub: "Cache & Org",
    icon: Layers,
    badge: "06",
    description: "Tenant isolation, rate-limiting, and warm-cache acceleration.",
    preview: {
      type: "scale",
      header: "Enterprise Fleet",
      tenants: "Unlimited",
      cacheHit: "88% Hit",
      rateLimit: "1,000 req/s",
    },
  },
];

export function ServiceLifecycle() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section className="border-b border-slate-200/80 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            End-to-End Orchestration
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            The Service Lifecycle
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            From initial definition to multi-tenant scaling, every phase of your
            AI service is treated as production software.
          </p>
        </div>

        {/* Step Flow Ribbon */}
        <div className="mt-12 overflow-x-auto pb-4 pt-2">
          <div className="flex min-w-[720px] items-center justify-between gap-2 border-b border-slate-200 pb-4">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <div key={stage.id} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`group flex w-full flex-col items-center rounded-xl p-2.5 text-center transition-all ${
                      isActive
                        ? "bg-blue-50/80 text-blue-700 ring-1 ring-blue-500/20"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="font-mono text-xs font-bold tracking-wider">
                        {stage.title}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-500">
                      {stage.sub}
                    </span>
                  </button>

                  {idx < STAGES.length - 1 && (
                    <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6 Stage Cards Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === idx;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(idx)}
                className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-600/60 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] font-bold tracking-wider ${
                        isSelected ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {stage.badge}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                    {stage.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {stage.description}
                  </p>
                </div>

                {/* Miniature UI simulation inside card */}
                <div className="mt-4 rounded-xl border border-slate-200/90 bg-slate-950 p-2.5 text-left text-white shadow-inner">
                  <div className="mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1 text-[9px] font-mono text-slate-400">
                    <span>{stage.preview.header}</span>
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  </div>

                  {stage.preview.type === "code" && (
                    <div className="font-mono text-[9px] leading-tight text-blue-300">
                      {stage.preview.lines?.slice(0, 3).map((l, i) => (
                        <div key={i} className="truncate">
                          {l}
                        </div>
                      ))}
                    </div>
                  )}

                  {stage.preview.type === "badges" && (
                    <div className="space-y-1">
                      {stage.preview.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[9px]"
                        >
                          <span className="truncate text-slate-300">
                            {item.name}
                          </span>
                          <span className="font-mono text-[8px] text-emerald-400">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {stage.preview.type === "key" && (
                    <div className="space-y-1 text-[9px]">
                      <div className="truncate font-mono text-amber-300">
                        {stage.preview.keyName}
                      </div>
                      <div className="truncate font-mono text-slate-400">
                        {stage.preview.target}
                      </div>
                    </div>
                  )}

                  {stage.preview.type === "chat" && (
                    <div className="space-y-1 text-[9px]">
                      <div className="truncate text-slate-400">
                        Q: {stage.preview.user}
                      </div>
                      <div className="truncate text-emerald-300">
                        A: {stage.preview.bot}
                      </div>
                    </div>
                  )}

                  {stage.preview.type === "metric" && (
                    <div className="flex items-center justify-between text-[10px]">
                      <div>
                        <div className="text-[8px] text-slate-400">Latency</div>
                        <div className="font-mono text-cyan-300">
                          {stage.preview.latency}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-400">Success</div>
                        <div className="font-mono text-emerald-300">
                          {stage.preview.success}
                        </div>
                      </div>
                    </div>
                  )}

                  {stage.preview.type === "scale" && (
                    <div className="flex items-center justify-between text-[10px]">
                      <div>
                        <div className="text-[8px] text-slate-400">Cache</div>
                        <div className="font-mono text-amber-300">
                          {stage.preview.cacheHit}
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-400">Max QPS</div>
                        <div className="font-mono text-blue-300">
                          {stage.preview.rateLimit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
