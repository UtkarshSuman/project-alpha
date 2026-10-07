"use client";

import { useState } from "react";
import {
  Sparkles,
  Database,
  Wrench,
  Brain,
  ShieldCheck,
  Workflow,
  Code,
  Globe,
  Zap,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

const INPUTS = [
  { id: "model", label: "Model", hint: "GPT-4o, Claude, Groq", icon: Sparkles, color: "#3b82f6" },
  { id: "knowledge", label: "Knowledge", hint: "pgvector & Docs", icon: Database, color: "#059669" },
  { id: "tools", label: "Tools", hint: "Internal REST APIs", icon: Wrench, color: "#d97706" },
  { id: "memory", label: "Memory", hint: "Short & Long-term", icon: Brain, color: "#db2777" },
  { id: "rules", label: "Rules", hint: "Brand Guardrails", icon: ShieldCheck, color: "#7c3aed" },
  { id: "workflow", label: "Workflow", hint: "Inngest Event Triggers", icon: Workflow, color: "#0891b2" },
];

const OUTPUTS = [
  { id: "api", label: "API", hint: "REST Endpoint & SDK", icon: Code, color: "#2563eb" },
  { id: "web", label: "Web", hint: "Embeddable Widget", icon: Globe, color: "#059669" },
  { id: "automation", label: "Automation", hint: "Async Background Jobs", icon: Zap, color: "#7c3aed" },
  { id: "internal", label: "Internal App", hint: "Admin Control Plane", icon: LayoutDashboard, color: "#ea580c" },
];

export function ServiceComposer() {
  const [selectedInput, setSelectedInput] = useState<string>("knowledge");
  const [selectedOutput, setSelectedOutput] = useState<string>("api");

  return (
    <section id="composer" className="border-b border-line bg-ink py-16 md:py-24 transition-colors duration-fast">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Visual Architecture
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            Service Composer
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Connect inputs, tools, and execution guardrails into a single
            unified AI service that deploys everywhere.
          </p>
        </div>

        {/* Node Diagram Interface */}
        <div className="mt-14 mx-auto max-w-5xl rounded-3xl border border-line bg-surface p-6 shadow-sm md:p-10 transition-colors duration-fast">
          <div className="grid items-center gap-8 md:grid-cols-12 md:gap-4">
            {/* Left Column: 6 Modular Inputs */}
            <div className="space-y-2.5 md:col-span-4">
              <div className="mb-2 text-xs font-mono font-bold tracking-wider text-muted uppercase">
                Inputs & Configuration
              </div>
              {INPUTS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedInput === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedInput(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30"
                        : "border-line bg-surface hover:border-text/30 hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted">
                          {item.hint}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Middle Column: Central Uveriq Core Runtime Node */}
            <div className="flex flex-col items-center justify-center py-4 md:col-span-4 md:py-0">
              <div className="relative flex flex-col items-center rounded-2xl border-2 border-line bg-ink p-6 text-center text-text shadow-xl">
                <span className="font-mono text-[10px] font-semibold tracking-widest text-muted uppercase">
                  Runtime Core
                </span>
                <div className="mt-2 font-display text-2xl font-bold tracking-tight text-text">
                  Uveriq AI Service
                </div>
                <div className="mt-3 flex items-center gap-1.5 rounded-full bg-surface border border-line px-3 py-1 font-mono text-[11px] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Active Ingestion & Routing
                </div>
                <p className="mt-3 text-[11px] text-muted leading-snug">
                  Unifies authorization, rate-limits, vector retrieval, and tool
                  executions into one endpoint.
                </p>
              </div>
            </div>

            {/* Right Column: 4 Distribution Outputs */}
            <div className="space-y-3 md:col-span-4">
              <div className="mb-2 text-xs font-mono font-bold tracking-wider text-muted uppercase">
                Deployment Surfaces
              </div>
              {OUTPUTS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedOutput === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOutput(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-accent-2 bg-accent-2/10 shadow-sm ring-1 ring-accent-2/30"
                        : "border-line bg-surface hover:border-text/30 hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-muted">
                          {item.hint}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-accent-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
