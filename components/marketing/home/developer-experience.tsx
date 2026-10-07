"use client";

import { useState } from "react";
import { Check, Copy, Terminal, Code2 } from "lucide-react";

const SNIPPETS = {
  curl: {
    label: "cURL",
    request: `curl -X POST https://api.uveriq.com/v1/services/customer_ops \\
  -H "Authorization: Bearer uveriq_live_839a2f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Check the status of order 448291"
  }'`,
    response: `{
  "service": "customer_ops",
  "status": "completed",
  "action": "order_lookup",
  "result": {
    "order_id": 448291,
    "status": "in_transit",
    "eta": "Tomorrow, 2:00 PM",
    "carrier": "FedEx Express"
  },
  "latency_ms": 138,
  "tokens_used": 64
}`,
  },
  typescript: {
    label: "TypeScript",
    request: `import { UveriqClient } from "@uveriq/sdk";

const uveriq = new UveriqClient({
  apiKey: process.env.UVERIQ_API_KEY,
});

const response = await uveriq.services.execute("customer_ops", {
  input: "Check the status of order 448291",
});

console.log(response.result);`,
    response: `{
  "service": "customer_ops",
  "status": "completed",
  "action": "order_lookup",
  "result": {
    "order_id": 448291,
    "status": "in_transit",
    "eta": "Tomorrow, 2:00 PM"
  }
}`,
  },
  python: {
    label: "Python",
    request: `from uveriq import Uveriq

client = Uveriq(api_key="uveriq_live_839a2f")

res = client.services.execute(
    service_id="customer_ops",
    input="Check the status of order 448291"
)

print(res.data)`,
    response: `{
  "service": "customer_ops",
  "status": "completed",
  "action": "order_lookup",
  "result": {
    "order_id": 448291,
    "status": "in_transit",
    "eta": "Tomorrow, 2:00 PM"
  }
}`,
  },
};

type LangKey = keyof typeof SNIPPETS;

export function DeveloperExperience() {
  const [activeLang, setActiveLang] = useState<LangKey>("curl");
  const [copied, setCopied] = useState(false);

  const snippet = SNIPPETS[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.request);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-b border-line bg-ink py-16 md:py-24 transition-colors duration-fast">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
              <Terminal className="h-3.5 w-3.5" />
              API-First Infrastructure
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Developer Experience
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted">
              Every configured service exposes a single predictable endpoint.
              No complex SDK orchestration or token management needed.
            </p>
          </div>

          {/* Language selector tabs */}
          <div className="flex items-center rounded-xl border border-line bg-surface p-1 shadow-sm">
            {(Object.keys(SNIPPETS) as LangKey[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeLang === lang
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                {SNIPPETS[lang].label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Code Terminal View */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left: Request Pane */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">
                  Request · {snippet.label}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed text-blue-200">
                <code>{snippet.request}</code>
              </pre>
            </div>
          </div>

          {/* Right: Response Pane */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">
                  Response · 200 OK (138ms)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                LIVE
              </span>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed text-emerald-300">
                <code>{snippet.response}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
