// ============================================================================
// FEATURE: RAG Chatbot Playground
// Interactive test console to simulate customer conversations with vector retrieval.
// Features: Real-time token streaming, citation badges, grounded RAG answering.
// ============================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, User, FileText, Sparkles, AlertCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SourceCitation = {
  filename: string;
  similarity: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: SourceCitation[];
};

type Props = {
  chatbotId: string;
  chatbotName: string;
  status: "DRAFT" | "INGESTING" | "READY" | "ERROR";
  model: string;
  welcomeMessage: string;
  documentCount: number;
  restrictToContext: boolean;
};

export function ChatbotPlayground({
  chatbotId,
  chatbotName,
  status: initialStatus,
  model,
  welcomeMessage,
  documentCount,
  restrictToContext,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: welcomeMessage || "Hello! Ask me any question based on your uploaded documents.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sessionId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: "assistant",
            content: `Error: ${errorData.error ?? "Failed to get response"}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setLoading(false);
        return;
      }

      // Update session ID from headers
      const returnedSessionId = res.headers.get("X-Session-Id");
      if (returnedSessionId) {
        setSessionId(returnedSessionId);
      }

      // Parse citations / sources from header
      let citations: SourceCitation[] = [];
      const sourcesRaw = res.headers.get("X-Sources");
      if (sourcesRaw) {
        try {
          citations = JSON.parse(decodeURIComponent(sourcesRaw));
        } catch {
          // ignore parsing error
        }
      }

      // Status flipped to READY if we received 200
      if (currentStatus !== "READY") {
        setCurrentStatus("READY");
      }

      // Prepare assistant message in state for streaming
      const assistantId = Math.random().toString(36).substring(7);
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false); // Once streaming begins, turn off initial thinking spinner

      // Stream tokens
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
          );
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: "Network error occurred while communicating with the chatbot. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setLoading(false);
    }
  }

  function handleReset() {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content: welcomeMessage || "Hello! Ask me any question based on your uploaded documents.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setSessionId(undefined);
  }

  return (
    <div className="flex h-[640px] flex-col rounded-2xl border border-line bg-surface shadow-sm overflow-hidden">
      {/* Playground Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-hover/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink ring-1 ring-line">
            <Bot size={16} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{chatbotName}</span>
              <Badge status={currentStatus} />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <FileText size={11} className="text-accent-2" /> {documentCount} doc{documentCount !== 1 ? "s" : ""}
              </span>
              <span>&middot;</span>
              <span>{model}</span>
              {restrictToContext && (
                <>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1 text-accent">
                    <ShieldCheck size={11} /> Grounded
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted hover:text-text h-8 gap-1.5"
        >
          <RotateCcw size={13} />
          Reset Chat
        </Button>
      </div>

      {documentCount === 0 && (
        <div className="flex items-center gap-2 border-b border-accent/20 bg-accent/10 px-5 py-2.5 text-xs text-accent">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            No documents uploaded yet. Go to the <strong>Overview</strong> tab to upload PDFs or TXT files so the chatbot can answer grounded questions.
          </span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-3 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs",
                m.role === "user"
                  ? "bg-accent-2 text-ink font-bold"
                  : "bg-surface-hover border border-line text-accent"
              )}
            >
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className="space-y-1">
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-accent text-ink font-medium"
                    : "bg-surface-hover/80 border border-line text-text"
                )}
              >
                {m.content}

                {/* Sources / Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-line/60">
                    <p className="text-[11px] font-semibold text-muted mb-1.5 flex items-center gap-1">
                      <FileText size={12} className="text-accent" />
                      Grounded in uploaded documents:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((src, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink/50 border border-line text-[11px] font-mono text-muted"
                        >
                          <CheckCircle2 size={10} className="text-accent" />
                          {src.filename}
                          <span className="text-accent-2">({src.similarity}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] text-muted px-1 font-mono",
                  m.role === "user" ? "text-right" : "text-left"
                )}
              >
                {m.timestamp}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover border border-line text-accent">
              <Bot size={14} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-surface-hover/80 border border-line px-4 py-2.5 text-xs text-muted">
              <Spinner size="sm" />
              <span>Retrieving relevant chunks & generating answer...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="border-t border-line p-3.5 bg-surface">
        <div className="flex items-center gap-2.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${chatbotName} about your documents...`}
            disabled={loading}
            className="flex-1 bg-ink"
          />
          <Button type="submit" disabled={!input.trim() || loading} loading={loading} className="shrink-0">
            <Send size={15} />
          </Button>
        </div>
      </form>
    </div>
  );
}
