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
    <section className="border-b border-line bg-ink py-16 md:py-24 transition-colors duration-fast">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-2">
            Modular Intelligence
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            One platform. Many kinds of intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Assemble the exact capabilities your application needs — combine
            factual document retrieval with live API actions and persistent
            state.
          </p>
        </div>

        {/* 6 Capabilities Bento Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Knowledge — vivid green */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-accent/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(67,160,71,0.12)" }}>
                <Database className="h-5 w-5" style={{ color: "#43a047" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Knowledge
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Ground answers directly in PDFs, manuals, policies, and
                vectorized databases with verified source citations.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-line pb-2 text-[11px] font-medium text-text">
                <FileText className="h-3.5 w-3.5" style={{ color: "#43a047" }} />
                <span>handbook-2026.pdf</span>
                <span className="ml-auto text-[10px] text-success font-mono">
                  100% Match
                </span>
              </div>
              <div className="mt-2 text-[11px] text-muted leading-snug">
                &ldquo;Refund policy allows full return within 14 days of
                purchase.&rdquo;
              </div>
            </div>
          </div>

          {/* 2. Action — teal */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-accent-2/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(0,172,193,0.12)" }}>
                <Zap className="h-5 w-5" style={{ color: "#00acc1" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Action
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Equip models with deterministic tools. Execute external API calls,
                update database rows, and dispatch webhooks safely.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-semibold" style={{ color: "#00acc1" }}>
                  call_tool: cancel_order
                </span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-mono" style={{ background: "rgba(0,172,193,0.12)", color: "#00acc1" }}>
                  CONFIRMED
                </span>
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted bg-surface/50 p-2 rounded">
                params: &#123; order_id: 88419, reason: &quot;customer_request&quot; &#125;
              </div>
            </div>
          </div>

          {/* 3. Automation — yellow-green */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-accent/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(124,179,66,0.12)" }}>
                <Workflow className="h-5 w-5" style={{ color: "#7cb342" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Automation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Autonomous multi-step business pipelines. Ingest inbound web
                leads, qualify intent with AI, and trigger custom emails.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-medium text-text">New Lead Trigger</span>
                <ArrowRight className="h-3 w-3 text-muted" />
                <span className="font-medium" style={{ color: "#7cb342" }}>AI Scoring</span>
                <ArrowRight className="h-3 w-3 text-muted" />
                <span className="font-medium text-success">Send Email</span>
              </div>
              <div className="mt-2 text-[10px] text-muted">
                Executed via Inngest background event queue.
              </div>
            </div>
          </div>

          {/* 4. Memory — forest green */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-accent/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(46,125,50,0.12)" }}>
                <Brain className="h-5 w-5" style={{ color: "#2e7d32" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Memory
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Choose between stateless, session-scoped conversation history,
                or permanent cross-session user memory.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-text">User Profile #92</span>
                <span className="text-[10px] font-mono text-accent">Long-term</span>
              </div>
              <div className="mt-2 text-[10px] text-muted">
                Preferences: React 19, Turbopack, Prefers Dark UI
              </div>
            </div>
          </div>

          {/* 5. Intelligence — teal */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-accent-2/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(0,131,143,0.12)" }}>
                <BarChart3 className="h-5 w-5" style={{ color: "#00838f" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Intelligence &amp; Telemetry
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                In-depth conversation analytics, token usage curves, user sentiment
                metrics, and fallback error rates.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-text">Daily Volume</span>
                <span className="font-mono font-bold" style={{ color: "#00acc1" }}>14,820 req</span>
              </div>
              <div className="mt-2 flex h-2 w-full gap-1 overflow-hidden rounded-full bg-surface">
                <div className="h-full" style={{ width: "55%", background: "#43a047" }} />
                <div className="h-full" style={{ width: "25%", background: "#00acc1" }} />
                <div className="h-full" style={{ width: "20%", background: "#fb8c00" }} />
              </div>
            </div>
          </div>

          {/* 6. Speed — amber orange */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all hover:border-warning/40 hover:bg-surface-hover hover:shadow-md">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(251,140,0,0.12)" }}>
                <Gauge className="h-5 w-5" style={{ color: "#fb8c00" }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                Speed (CAG Acceleration)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Cache-Augmented Generation precomputes durable context, dropping
                multi-hop retrieval latency from seconds down to sub-100ms.
              </p>
            </div>

            {/* Visual Graphic */}
            <div className="mt-6 rounded-xl border border-line bg-ink/60 p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">Standard Retrieval</span>
                <span className="font-mono text-muted">1,450ms</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold" style={{ color: "#fb8c00" }}>
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
