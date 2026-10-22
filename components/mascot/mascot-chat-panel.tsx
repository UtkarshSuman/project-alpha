// ============================================================================
// FEATURE: MascotChatPanel — Chat mode conversation panel.
// Pre-wired with FAQ responses. Can be connected to a real backend later.
// No API keys stored or exposed here.
// ============================================================================
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, RotateCcw, X } from "lucide-react";
import { useGuideContext } from "./guide-context";
import { chatFaqs } from "./guide-config";

// Simple fuzzy match — checks if any word in the question is in the user query
function findAnswer(query: string): string | null {
  const q = query.toLowerCase();
  for (const faq of chatFaqs) {
    const keywords = faq.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    if (keywords.some((kw) => q.includes(kw))) {
      return faq.a;
    }
  }
  return null;
}

// Minimal markdown — bold and inline code only
function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code style=\"font-family:var(--font-mono);font-size:11px;background:var(--surface-hover);padding:1px 4px;border-radius:3px\">$1</code>");
}

type Props = {
  onClose: () => void;
};

export function MascotChatPanel({ onClose }: Props) {
  const { chatMessages, addChatMessage, clearChat } = useGuideContext();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Greet on first open
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        role: "assistant",
        content:
          "Hi! I'm your Uveriq assistant. Ask me anything about creating chatbots, uploading documents, API keys, or getting started.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");

    addChatMessage({ role: "user", content: trimmed });
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(trimmed);
      addChatMessage({
        role: "assistant",
        content:
          answer ??
          "I don't have a specific answer for that yet. Try asking about creating chatbots, uploading documents, API keys, or embedding the widget.",
      });
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  }, [input, addChatMessage]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Suggested questions shown when only greeting is present
  const showSuggestions = chatMessages.length <= 1;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 14px)",
        right: 0,
        width: 320,
        maxHeight: 480,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-elevate-lg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fade-in 220ms cubic-bezier(0.16,1,0.3,1) both",
      }}
      role="dialog"
      aria-label="Uveriq assistant chat"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 14px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface-hover)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--success)",
            boxShadow: "0 0 6px var(--success)",
          }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            color: "var(--text)",
          }}
        >
          Uveriq Assistant
        </span>
        <button
          onClick={clearChat}
          aria-label="Clear conversation"
          title="Clear conversation"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            padding: 4,
            borderRadius: "var(--radius-sm)",
            display: "flex",
          }}
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            padding: 4,
            borderRadius: "var(--radius-sm)",
            display: "flex",
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minHeight: 0,
        }}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "8px 12px",
                borderRadius:
                  msg.role === "user"
                    ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)"
                    : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                background:
                  msg.role === "user"
                    ? "var(--accent)"
                    : "var(--surface-hover)",
                color: msg.role === "user" ? "var(--ink)" : "var(--text)",
                fontSize: 12.5,
                lineHeight: 1.55,
                fontFamily: "var(--font-sans)",
                border: msg.role === "assistant" ? "1px solid var(--line)" : "none",
              }}
              dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                background: "var(--surface-hover)",
                border: "1px solid var(--line)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
              aria-label="Assistant is typing"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--muted)",
                    display: "inline-block",
                    animation: "mascot-scan 1s ease-in-out infinite",
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {showSuggestions && !isTyping && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 2 }}>
              Try asking:
            </span>
            {chatFaqs.slice(0, 3).map((faq, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(faq.q);
                  setTimeout(() => {
                    sendMessage();
                  }, 50);
                  addChatMessage({ role: "user", content: faq.q });
                  setIsTyping(true);
                  setTimeout(() => {
                    addChatMessage({ role: "assistant", content: faq.a });
                    setIsTyping(false);
                  }, 700);
                }}
                style={{
                  background: "var(--surface-hover)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 10px",
                  fontSize: 11.5,
                  color: "var(--accent)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  transition: "background 140ms ease",
                }}
              >
                {faq.q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: "10px 12px",
          borderTop: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question…"
          rows={1}
          aria-label="Type your question"
          data-guide-id="playground-input"
          style={{
            flex: 1,
            resize: "none",
            background: "var(--surface-hover)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "7px 10px",
            fontSize: 12.5,
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            outline: "none",
            overflowY: "hidden",
            maxHeight: 80,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
          style={{
            background: "var(--accent)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "8px 10px",
            cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
            opacity: input.trim() && !isTyping ? 1 : 0.4,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            transition: "opacity 140ms ease",
            flexShrink: 0,
          }}
        >
          <Send size={14} />
        </button>
      </div>

      {/* Tail */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          right: 28,
          width: 13,
          height: 13,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderTop: "none",
          borderLeft: "none",
          transform: "rotate(45deg)",
        }}
      />
    </div>
  );
}
