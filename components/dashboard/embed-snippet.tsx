// ============================================================================
// FEATURE: Embed code snippet component
// Provides ready-to-paste snippets for HTML Script tag, React/Next.js, and API cURL.
// Features one-click copy with toast notification.
// ============================================================================

"use client";

import { useState } from "react";
import { Copy, Check, Code, Terminal, Globe } from "lucide-react";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

type SnippetType = "script" | "react" | "curl";

export function EmbedSnippet({ chatbotid, apiKey }: { chatbotid: string; apiKey?: string }) {
  const [activeTab, setActiveTab] = useState<SnippetType>("script");
  const [copied, setCopied] = useState(false);

  const apiBase =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://uveriq.com";

  const keyDisplay = apiKey || "YOUR_API_KEY";

  const snippets: Record<SnippetType, { label: string; icon: any; code: string }> = {
    script: {
      label: "HTML Script",
      icon: Globe,
      code: `<!-- Uveriq Chatbot Widget -->
<script
  src="${apiBase}/widget.js"
  data-chatbot-id="${chatbotid}"
  data-api-key="${keyDisplay}"
  data-api-base="${apiBase}"
  async>
</script>`,
    },
    react: {
      label: "React / Next.js",
      icon: Code,
      code: `import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="${apiBase}/widget.js"
      data-chatbot-id="${chatbotid}"
      data-api-key="${keyDisplay}"
      data-api-base="${apiBase}"
      strategy="lazyOnload"
    />
  );
}`,
    },
    curl: {
      label: "cURL API",
      icon: Terminal,
      code: `curl -X POST "${apiBase}/api/chat/${chatbotid}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -d '{"message": "Hello, how does this work?"}'`,
    },
  };

  const currentSnippet = snippets[activeTab];

  function handleCopy() {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    toast.success("Code snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden">
      {/* Header with Format Tabs & Copy button */}
      <div className="flex items-center justify-between border-b border-line bg-surface-hover/40 px-3 py-2">
        <div className="flex items-center gap-1">
          {(Object.keys(snippets) as SnippetType[]).map((tab) => {
            const item = snippets[tab];
            const Icon = item.icon;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
                  active
                    ? "bg-surface text-text ring-1 ring-line"
                    : "text-muted hover:text-text hover:bg-surface-hover"
                )}
              >
                <Icon size={12} className={active ? "text-accent" : "text-muted"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium text-muted hover:text-text hover:bg-surface-hover transition-colors duration-fast"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Code Container */}
      <pre className="overflow-x-auto p-4 text-xs font-mono text-text bg-ink/70 leading-relaxed selection:bg-accent/20">
        <code>{currentSnippet.code}</code>
      </pre>

      {/* Footer instruction */}
      <div className="border-t border-line/40 px-4 py-2.5 bg-surface text-[11px] text-muted">
        {activeTab === "script" && (
          <p>
            Paste this snippet right before the closing <code className="font-mono text-text">&lt;/body&gt;</code> tag on any website.
          </p>
        )}
        {activeTab === "react" && (
          <p>
            Add this component into your root layout or main landing page template.
          </p>
        )}
        {activeTab === "curl" && (
          <p>
            Send HTTP POST requests to stream or receive grounded completions directly in your backend.
          </p>
        )}
      </div>
    </div>
  );
}