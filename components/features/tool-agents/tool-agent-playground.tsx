// ============================================================================
// FEATURE: Tool Agent Playground
// Interactive test console to simulate user conversation and test function execution.
// ============================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, User, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type Props = {
  serviceId: string;
  agentName: string;
  welcomeMessage: string;
  toolCount: number;
};

export function ToolAgentPlayground({ serviceId, agentName, welcomeMessage, toolCount }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
      const res = await fetch(`/api/chat/tool/${serviceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
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
          content: "Network error occurred while communicating with the agent.",
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
        content: welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }

  return (
    <div className="flex h-[620px] flex-col rounded-lg border border-line bg-surface shadow-elevate-sm overflow-hidden">
      {/* Playground Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface-hover/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink ring-1 ring-line">
            <Zap size={14} className="text-accent" />
          </div>
          <div>
            <span className="text-sm font-medium text-text">{agentName}</span>
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              <Sparkles size={10} /> {toolCount} tools active
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted hover:text-text"
        >
          <RotateCcw size={13} className="mr-1" /> Reset chat
        </Button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-3 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                m.role === "user"
                  ? "bg-accent-2 text-ink font-semibold"
                  : "bg-surface-hover border border-line text-accent"
              )}
            >
              {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
            </div>

            <div className="space-y-1">
              <div
                className={cn(
                  "rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-accent text-ink font-medium"
                    : "bg-surface-hover/70 border border-line text-text"
                )}
              >
                {m.content}
              </div>
              <p
                className={cn(
                  "text-[10px] text-muted px-1",
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-hover border border-line text-accent">
              <Bot size={13} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-hover/70 border border-line px-3.5 py-2 text-xs text-muted">
              <Spinner size="sm" />
              <span>Agent is thinking and evaluating tools...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="border-t border-line p-3 bg-surface">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agentName} something...`}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading} loading={loading}>
            <Send size={15} />
          </Button>
        </div>
      </form>
    </div>
  );
}
