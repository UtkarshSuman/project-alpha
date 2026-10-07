"use client";

import {
  Database,
  Zap,
  Workflow,
  Brain,
  BarChart3,
  Gauge,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export function CapabilitiesGrid() {
  return (
    <section className="border-b border-slate-200/80 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Modular Intelligence
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            One platform. Many kinds of intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Assemble the exact capabilities your application needs — combine
            factual document retrieval with live API actions and persistent
            state.
          </p>
        </div>

        {/* 6 Capabilities Bento Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Knowledge */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Knowledge
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Ground answers directly in PDFs, manuals, policies, and
                vectorized databases with verified source citations.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-[11px] font-medium text-slate-700">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>handbook-2026.pdf</span>
                <span className="ml-auto text-[10px] text-emerald-600 font-mono">
                  100% Match
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-snug">
                &ldquo;Refund policy allows full return within 14 days of
                purchase.&rdquo;
              </div>
            </div>
          </div>

          {/* 2. Action */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Action
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Equip models with deterministic tools. Execute external API calls,
                update database rows, and dispatch webhooks safely.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-emerald-600 font-semibold">
                  call_tool: cancel_order
                </span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-mono text-emerald-700">
                  CONFIRMED
                </span>
              </div>
              <div className="mt-2 font-mono text-[10px] text-slate-500 bg-slate-50 p-2 rounded">
                params: &#123; order_id: 88419, reason: &quot;customer_request&quot; &#125;
              </div>
            </div>
          </div>

          {/* 3. Automation */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Automation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Autonomous multi-step business pipelines. Ingest inbound web
                leads, qualify intent with AI, and trigger custom emails.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-700">New Lead Trigger</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-purple-600">AI Scoring</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-medium text-emerald-600">Send Email</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                Executed via Inngest background event queue.
              </div>
            </div>
          </div>

          {/* 4. Memory */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Memory
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Choose between stateless, session-scoped conversation history,
                or permanent cross-session user memory.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-800">User Profile #92</span>
                <span className="text-[10px] font-mono text-pink-600">Long-term</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                Preferences: React 19, Turbopack, Prefers Dark UI
              </div>
            </div>
          </div>

          {/* 5. Intelligence */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Intelligence & Telemetry
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                In-depth conversation analytics, token usage curves, user sentiment
                metrics, and fallback error rates.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">Daily Volume</span>
                <span className="font-mono text-cyan-600 font-bold">14,820 req</span>
              </div>
              <div className="mt-2 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-500" style={{ width: "65%" }} />
                <div className="h-full bg-emerald-500" style={{ width: "25%" }} />
                <div className="h-full bg-amber-500" style={{ width: "10%" }} />
              </div>
            </div>
          </div>

          {/* 6. Speed */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Speed (CAG Acceleration)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Cache-Augmented Generation precomputes durable context, dropping
                multi-hop retrieval latency from seconds down to sub-100ms.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Standard Retrieval</span>
                <span className="font-mono text-slate-400">1,450ms</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-orange-600">
                <span>Uveriq Warm Cache</span>
                <span className="font-mono">92ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
