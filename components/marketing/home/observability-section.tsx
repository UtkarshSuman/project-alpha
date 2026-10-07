"use client";

import { Activity, CheckCircle, Clock, Zap, ArrowUpRight } from "lucide-react";

const STATS = [
  { label: "Active Services", value: "12", sub: "100% healthy", icon: Zap },
  { label: "Success Rate", value: "98.7%", sub: "Last 24 hours", icon: CheckCircle },
  { label: "Avg Latency", value: "142ms", sub: "p95 198ms", icon: Clock },
  { label: "Executions", value: "24.8k", sub: "+18% this week", icon: Activity },
];

const RECENT_LOGS = [
  {
    endpoint: "POST /v1/services/customer_ops",
    status: 200,
    latency: "138ms",
    tokens: "64",
    time: "2s ago",
  },
  {
    endpoint: "POST /v1/services/refund_triage",
    status: 200,
    latency: "112ms",
    tokens: "48",
    time: "8s ago",
  },
  {
    endpoint: "POST /v1/services/lead_qualification",
    status: 200,
    latency: "164ms",
    tokens: "92",
    time: "14s ago",
  },
  {
    endpoint: "POST /v1/services/knowledge_rag",
    status: 200,
    latency: "96ms",
    tokens: "36",
    time: "22s ago",
  },
];

export function ObservabilitySection() {
  return (
    <section className="border-b border-slate-200/80 bg-slate-50/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Activity className="h-3.5 w-3.5" />
              Real-Time Telemetry
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Observability
            </h2>
            <p className="mt-3 max-w-xl text-base text-slate-600">
              Deep inspection into every API call, token usage spike, retrieval
              chunk match, and tool execution error.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Global Cluster: All Systems Operational
          </div>
        </div>

        {/* Dashboard Card Container */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-200 sm:grid-cols-4 sm:divide-y-0">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-5 sm:p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-medium">{stat.label}</span>
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-emerald-600">
                    {stat.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulated Telemetry Timeline Chart */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-slate-800">
                Hourly Execution Volume & Latency Curve
              </span>
              <span className="font-mono text-xs text-slate-400">
                Last 24 Hours
              </span>
            </div>

            {/* SVG Wave Line Chart */}
            <div className="mt-6 relative h-48 w-full">
              <svg
                viewBox="0 0 800 180"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="140" x2="800" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                {/* Area under curve */}
                <path
                  d="M 0 130 Q 80 110 160 120 T 320 85 T 480 95 T 640 55 T 800 65 L 800 180 L 0 180 Z"
                  fill="url(#chartGrad)"
                />

                {/* Main line */}
                <path
                  d="M 0 130 Q 80 110 160 120 T 320 85 T 480 95 T 640 55 T 800 65"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                />

                {/* Interactive coordinate points */}
                <circle cx="160" cy="120" r="4" fill="#2563eb" className="hover:r-6 cursor-pointer" />
                <circle cx="320" cy="85" r="4" fill="#2563eb" className="hover:r-6 cursor-pointer" />
                <circle cx="480" cy="95" r="4" fill="#2563eb" className="hover:r-6 cursor-pointer" />
                <circle cx="640" cy="55" r="5" fill="#2563eb" className="animate-pulse" />
              </svg>

              {/* Time stamps */}
              <div className="mt-3 flex justify-between font-mono text-[10px] text-slate-400">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>

          {/* Live Request Log Feed */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-6">
            <div className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Live Execution Traces
            </div>
            <div className="space-y-2">
              {RECENT_LOGS.map((log, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600">
                      {log.status} OK
                    </span>
                    <span className="font-mono text-slate-800 font-medium">
                      {log.endpoint}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                    <span>{log.latency}</span>
                    <span>{log.tokens} tokens</span>
                    <span className="text-slate-400">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
