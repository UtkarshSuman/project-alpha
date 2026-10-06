// FEATURE: Embed snippet for Automation widgets — uses agent.serviceId
// (the Service id), never AutomationAgent.id, so it always matches what
// the public routes actually expect.
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function AutomationEmbedSnippet({ serviceId, apiKey }: { serviceId: string; apiKey: string }) {
  const [copied, setCopied] = useState(false);
  const apiBase = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "https://uveriq.vercel.app";

  const snippet = `<script
  src="${apiBase}/automation-widget.js"
  data-service-id="${serviceId}"
  data-api-key="${apiKey}"
  data-api-base="${apiBase}">
</script>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-line bg-ink px-3 py-2">
        <span className="text-xs text-muted">HTML</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted hover:text-text">
          {copied ? <><Check size={13} className="text-accent-2" /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b-md border border-line bg-ink p-3 text-xs text-accent-2">
        <code>{snippet}</code>
      </pre>
      <p className="mt-2 text-xs text-muted">Paste this anywhere on your page where you want the lead form to appear.</p>
    </div>
  );
}