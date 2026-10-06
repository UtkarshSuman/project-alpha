// ============================================================================
// FEATURE: RAG Chatbot Playground
// Interactive test console to simulate customer conversations with vector retrieval.
// ============================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, User, FileText, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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
  status,
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
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${chatbotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: "assistant",
            content: `Error: ${data.error ?? "Failed to get response"}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: "Network error occurred while communicating with the chatbot.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
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

  const isReady = status === "READY";

  return (
    <div className="flex h-[620px] flex-col rounded-2xl border border-line bg-surface shadow-sm overflow-hidden">
      {/* Playground Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-hover/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink ring-1 ring-line">
            <Bot size={16} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{chatbotName}</span>
              <Badge status={status} />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <FileText size={11} className="text-accent-2" /> {documentCount} docs
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

      {!isReady && (
        <div className="flex items-center gap-2 border-b border-accent/20 bg-accent/10 px-5 py-2.5 text-xs text-accent">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            This chatbot status is <strong>{status}</strong>. Ingest and process documents in the Overview tab to enable grounded RAG answering.
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
            placeholder={isReady ? `Ask ${chatbotName} about your documents...` : "Waiting for document ingestion..."}
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
