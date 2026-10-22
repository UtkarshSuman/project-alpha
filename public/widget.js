// ============================================================================
// FEATURE: Uveriq Embeddable AI Chat Widget
// Drop-in script:
//   <script src="https://myapp.com/widget.js"
//     data-chatbot-id="..." data-api-key="..." data-api-base="https://myapp.com" async></script>
//
// Ultra-modern design with Shadow DOM isolation:
// - Premium glassmorphic styling, refined typography, and layered shadows
// - Springy 60fps micro-animations on open/close and bubble hover
// - Morphing launcher button with live status badge and crossfade icon transition
// - Markdown formatting support (paragraphs, bold, lists, inline code)
// - Bouncing typing indicators during LLM stream generation
// - Auto-expanding multiline input with Enter-to-send & Shift+Enter support
// - Full responsive bottom-sheet mode with drag-bar for mobile devices
// ============================================================================

(function (_scriptTag) {
  const scriptTag = _scriptTag || document.currentScript;
  if (!scriptTag) return;

  const chatbotId = scriptTag.getAttribute("data-chatbot-id");
  const apiKey = scriptTag.getAttribute("data-api-key");
  const apiBase = scriptTag.getAttribute("data-api-base") || "https://uveriq.vercel.app";

  if (!chatbotId || !apiKey) {
    console.error("[Uveriq widget] Missing data-chatbot-id or data-api-key");
    return;
  }

  let sessionId = null;

  // Helper: Hex color manipulation for dynamic gradients & shadows
  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== "string") return `rgba(99, 102, 241, ${alpha})`;
    let c = hex.replace("#", "").trim();
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    if (c.length !== 6) return `rgba(99, 102, 241, ${alpha})`;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function darkenHex(hex, percent) {
    if (!hex || typeof hex !== "string") return "#4f46e5";
    let c = hex.replace("#", "").trim();
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    if (c.length !== 6) return "#4f46e5";
    let r = parseInt(c.slice(0, 2), 16);
    let g = parseInt(c.slice(2, 4), 16);
    let b = parseInt(c.slice(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - percent / 100)));
    g = Math.max(0, Math.floor(g * (1 - percent / 100)));
    b = Math.max(0, Math.floor(b * (1 - percent / 100)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Safe markdown formatter for streaming assistant messages
  function formatMarkdown(text) {
    if (!text) return "";
    let s = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    s = s.replace(/```([a-z0-9]*)\n?([\s\S]*?)```/gi, '<pre class="code-block"><code>$2</code></pre>');
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    // Bold
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Bullet lists (- or * followed by space)
    s = s.replace(/(?:^|\n)[-*]\s+([^\n]+)/g, '<li class="list-item">$1</li>');
    s = s.replace(/(<li class="list-item">[\s\S]+?<\/li>)/g, '<ul class="bullet-list">$1</ul>');
    // Line breaks & paragraphs
    s = s.replace(/\n\n+/g, '</p><p class="msg-para">').replace(/\n/g, "<br/>");

    return `<p class="msg-para">${s}</p>`;
  }

  // Visual themes configuration
  const THEMES = {
    classic: {
      radius: "20px",
      bubbleRadius: "50%",
      shadow: "0 24px 64px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.8)",
      headerPad: "16px 20px",
      border: "none",
    },
    minimal: {
      radius: "12px",
      bubbleRadius: "16px",
      shadow: "0 12px 36px -8px rgba(15, 23, 42, 0.14), 0 0 0 1px #e2e8f0",
      headerPad: "14px 18px",
      border: "1px solid #e2e8f0",
    },
    rounded: {
      radius: "28px",
      bubbleRadius: "50%",
      shadow: "0 28px 72px -12px rgba(15, 23, 42, 0.24), 0 0 0 1px rgba(226, 232, 240, 0.8)",
      headerPad: "18px 22px",
      border: "none",
    },
    compact: {
      radius: "16px",
      bubbleRadius: "50%",
      shadow: "0 16px 48px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)",
      headerPad: "12px 16px",
      fontScale: "0.94",
      border: "none",
    },
    bold: {
      radius: "22px",
      bubbleRadius: "50%",
      shadow: "0 30px 80px -12px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(15, 23, 42, 0.08)",
      headerPad: "18px 20px",
      headerFontWeight: "700",
      border: "none",
    },
  };

  // Dimensions per breakpoint
  const SIZES = {
    small: { bubble: 52, desktopW: 360, desktopH: 540, tabletW: 350, tabletH: 520, mobileVh: 82 },
    medium: { bubble: 60, desktopW: 410, desktopH: 620, tabletW: 380, tabletH: 580, mobileVh: 88 },
    large: { bubble: 68, desktopW: 460, desktopH: 680, tabletW: 420, tabletH: 620, mobileVh: 92 },
  };

  async function init() {
    function getOrCreateVisitorId() {
      const KEY = "docent_visitor_id";
      try {
        let id = localStorage.getItem(KEY);
        if (!id) {
          id = crypto.randomUUID
            ? crypto.randomUUID()
            : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          localStorage.setItem(KEY, id);
        }
        return id;
      } catch {
        return null;
      }
    }
    const visitorIdentifier = getOrCreateVisitorId();

    let config = {
      widgetTitle: "Chat with us",
      widgetColor: "#6366f1",
      welcomeMessage: "Hi! How can I assist you today?",
      widgetPosition: "bottom-right",
      widgetTheme: "classic",
      widgetSize: "medium",
      suggestedQuestions: [],
    };
    let configError = null;

    try {
      const res = await fetch(`${apiBase}/api/chat/${chatbotId}/config`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.error) {
        configError = data.error;
      } else {
        config = { ...config, ...data };
      }
    } catch {
      configError = "Unable to connect. Please try again later.";
    }

    if (configError) {
      const host = document.createElement("div");
      host.id = "uveriq-widget-root";
      document.body.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          .err-bubble {
            position: fixed; bottom: 24px; right: 24px; background: #0f172a; color: #f8fafc;
            padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); z-index: 999999; max-width: 260px;
            border: 1px solid rgba(255,255,255,0.1);
          }
        </style>
        <div class="err-bubble">Chat is temporarily unavailable.</div>
      `;
      console.error("[Uveriq widget]", configError);
      return;
    }

    const theme = THEMES[config.widgetTheme] || THEMES.classic;
    const size = SIZES[config.widgetSize] || SIZES.medium;
    const isLeft = config.widgetPosition === "bottom-left";
    const accentColor = config.widgetColor || "#6366f1";
    const accentDark = darkenHex(accentColor, 18);
    const accentGlow = hexToRgba(accentColor, 0.38);
    const accentSubtle = hexToRgba(accentColor, 0.08);

    const host = document.createElement("div");
    host.id = "uveriq-widget-root";
    host.style.setProperty("--accent", accentColor);
    host.style.setProperty("--accent-dark", accentDark);
    host.style.setProperty("--accent-glow", accentGlow);
    host.style.setProperty("--accent-subtle", accentSubtle);
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* =================== LAUNCHER BUBBLE =================== */
      .bubble {
        position: fixed;
        bottom: 24px;
        ${isLeft ? "left: 24px;" : "right: 24px;"}
        width: ${size.bubble}px;
        height: ${size.bubble}px;
        border-radius: ${theme.bubbleRadius};
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 12px 30px -4px var(--accent-glow), 0 6px 14px -2px rgba(15, 23, 42, 0.16);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease;
        outline: none;
        user-select: none;
      }

      .bubble:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 16px 36px -4px var(--accent-glow), 0 8px 18px -2px rgba(15, 23, 42, 0.22);
      }

      .bubble:active {
        transform: scale(0.94);
      }

      .bubble-icon-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bubble svg {
        position: absolute;
        width: ${Math.round(size.bubble * 0.44)}px;
        height: ${Math.round(size.bubble * 0.44)}px;
        color: #ffffff;
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
      }

      .bubble .icon-chat {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .bubble .icon-close {
        opacity: 0;
        transform: rotate(-90deg) scale(0.5);
      }

      .bubble.is-open .icon-chat {
        opacity: 0;
        transform: rotate(90deg) scale(0.5);
      }

      .bubble.is-open .icon-close {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .bubble img.logo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: ${theme.bubbleRadius};
      }

      /* Live status pulse badge on bubble */
      .online-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 13px;
        height: 13px;
        background: #10b981;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      .bubble.is-open .online-badge {
        opacity: 0;
        transform: scale(0);
      }

      /* =================== CHAT PANEL =================== */
      .panel {
        position: fixed;
        bottom: ${size.bubble + 36}px;
        ${isLeft ? "left: 24px;" : "right: 24px;"}
        width: ${size.desktopW}px;
        max-width: calc(100vw - 48px);
        height: ${size.desktopH}px;
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border-radius: ${theme.radius};
        box-shadow: ${theme.shadow};
        ${theme.border ? `border: ${theme.border};` : ""}
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        font-size: calc(14px * ${theme.fontScale || 1});
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(18px) scale(0.94);
        transform-origin: ${isLeft ? "bottom left" : "bottom right"};
        transition: opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1),
                    transform 0.26s cubic-bezier(0.16, 1, 0.3, 1),
                    visibility 0.26s;
      }

      .panel.open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      /* =================== HEADER =================== */
      .header {
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
        color: #ffffff;
        padding: ${theme.headerPad};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        position: relative;
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .avatar-wrap {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
      }

      .avatar-wrap img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .avatar-wrap svg {
        width: 20px;
        height: 20px;
        color: #ffffff;
      }

      .avatar-status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background: #10b981;
        border: 2px solid #ffffff;
        border-radius: 50%;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .header-title {
        font-weight: ${theme.headerFontWeight || 700};
        font-size: 15px;
        letter-spacing: -0.01em;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .close-btn {
        background: rgba(255, 255, 255, 0.16);
        border: none;
        color: #ffffff;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.18s ease, transform 0.18s ease;
        flex-shrink: 0;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.28);
        transform: scale(1.05);
      }

      .close-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Mobile drag handle */
      .mobile-drag-bar {
        display: none;
        width: 38px;
        height: 4px;
        background: rgba(255, 255, 255, 0.35);
        border-radius: 99px;
        margin: 0 auto 8px auto;
      }

      /* =================== MESSAGES AREA =================== */
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8fafc;
        scroll-behavior: smooth;
      }

      .messages::-webkit-scrollbar {
        width: 5px;
      }

      .messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .messages::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.4);
        border-radius: 10px;
      }

      .messages::-webkit-scrollbar-thumb:hover {
        background: rgba(148, 163, 184, 0.6);
      }

      /* Individual message bubble */
      .msg {
        max-width: 84%;
        padding: 10px 14px;
        font-size: 13.5px;
        line-height: 1.5;
        word-break: break-word;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        animation: msgFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes msgFadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
        color: #ffffff;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 4px 12px -2px var(--accent-glow);
      }

      .msg.assistant {
        align-self: flex-start;
        background: #ffffff;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        border-radius: 18px 18px 18px 4px;
      }

      .msg-para {
        margin: 0 0 6px 0;
      }
      .msg-para:last-child {
        margin-bottom: 0;
      }

      .code-block {
        background: #0f172a;
        color: #e2e8f0;
        padding: 8px 10px;
        border-radius: 8px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        overflow-x: auto;
        margin: 6px 0;
      }

      .inline-code {
        background: rgba(15, 23, 42, 0.07);
        color: #0f172a;
        padding: 2px 5px;
        border-radius: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
      }

      .bullet-list {
        margin: 4px 0 4px 16px;
        padding: 0;
      }

      .list-item {
        margin-bottom: 3px;
      }

      /* Bouncing typing indicator */
      .typing-msg {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 10px 14px;
      }

      .typing-dots {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .typing-dots span {
        width: 6px;
        height: 6px;
        background: #94a3b8;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out both;
      }

      .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
      .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

      @keyframes typingBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.4;
        }
        40% {
          transform: scale(1.15);
          opacity: 1;
        }
      }

      /* =================== SUGGESTED QUESTIONS =================== */
      .chips-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 4px;
      }

      .chip-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        color: #334155;
        border-radius: 12px;
        padding: 9px 13px;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
      }

      .chip-btn:hover {
        background: var(--accent-subtle);
        border-color: var(--accent);
        color: var(--accent);
        transform: translateX(3px);
      }

      .chip-btn svg {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        opacity: 0.6;
        flex-shrink: 0;
      }

      /* =================== EMAIL LEAD CARD =================== */
      .lead-card {
        width: 100%;
        max-width: 100%;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 12px 14px;
        box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.06);
      }

      .lead-card-title {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .lead-card-title svg {
        width: 15px;
        height: 15px;
        color: var(--accent);
      }

      .lead-form-row {
        display: flex;
        gap: 6px;
      }

      .lead-form-row input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 12.5px;
        outline: none;
        background: #f8fafc;
        transition: border-color 0.18s ease;
      }

      .lead-form-row input:focus {
        border-color: var(--accent);
        background: #ffffff;
      }

      .lead-form-row button {
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 7px 14px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.18s ease;
      }

      .lead-form-row button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      /* =================== INPUT AREA =================== */
      .input-section {
        background: #ffffff;
        border-top: 1px solid #f1f5f9;
        padding: 10px 14px 8px 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex-shrink: 0;
      }

      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 6px 8px 6px 14px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }

      .input-wrapper:focus-within {
        border-color: var(--accent);
        background: #ffffff;
        box-shadow: 0 0 0 3px var(--accent-subtle);
      }

      .input-wrapper textarea {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 13.5px;
        color: #1e293b;
        outline: none;
        resize: none;
        max-height: 96px;
        line-height: 1.45;
        padding: 4px 0;
        font-family: inherit;
      }

      .input-wrapper textarea::placeholder {
        color: #94a3b8;
      }

      .send-btn {
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        cursor: pointer;
        transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease, opacity 0.18s ease;
        flex-shrink: 0;
      }

      .send-btn:hover:not(:disabled) {
        transform: scale(1.08);
      }

      .send-btn:active:not(:disabled) {
        transform: scale(0.92);
      }

      .send-btn:disabled {
        opacity: 0.38;
        cursor: default;
      }

      .send-btn svg {
        width: 16px;
        height: 16px;
        display: block;
        margin: 0;
        /* Optical centering for 45-deg angled paper plane */
        transform: translate(-1.5px, 1.5px);
      }

      /* Watermark Footer */
      .footer-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 10.5px;
        color: #94a3b8;
        user-select: none;
      }

      .footer-brand svg {
        width: 11px;
        height: 11px;
        color: var(--accent);
      }

      /* =================== RESPONSIVE BREAKPOINTS =================== */
      @media (max-width: 900px) {
        .panel {
          width: ${size.tabletW}px;
          height: ${size.tabletH}px;
        }
      }

      @media (max-width: 480px) {
        .panel {
          width: 100vw;
          height: ${size.mobileVh}vh;
          max-width: 100vw;
          max-height: ${size.mobileVh}vh;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          border-radius: 22px 22px 0 0;
          box-shadow: 0 -10px 40px rgba(15, 23, 42, 0.25);
        }

        .mobile-drag-bar {
          display: block;
        }

        .bubble {
          bottom: 18px;
          ${isLeft ? "left: 18px;" : "right: 18px;"}
        }
      }
    `;
    shadow.appendChild(style);

    // =================== CREATE LAUNCHER BUBBLE ===================
    const bubble = document.createElement("button");
    bubble.className = "bubble";
    bubble.setAttribute("aria-label", "Toggle chat widget");

    if (config.widgetLogoUrl) {
      bubble.innerHTML = `
        <div class="bubble-icon-wrap">
          <img src="${config.widgetLogoUrl}" alt="" class="logo-img" />
        </div>
        <span class="online-badge"></span>
      `;
    } else {
      bubble.innerHTML = `
        <div class="bubble-icon-wrap">
          <!-- Chat SVG -->
          <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <!-- Close SVG -->
          <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <span class="online-badge"></span>
      `;
    }
    shadow.appendChild(bubble);

    // =================== CREATE CHAT PANEL ===================
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <div class="header">
        <div class="mobile-drag-bar"></div>
        <div class="header-left">
          <div class="avatar-wrap">
            ${
              config.widgetLogoUrl
                ? `<img src="${config.widgetLogoUrl}" alt="" />`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 11v6a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6M2 13h2M20 13h2M9 16h6"/>
                   </svg>`
            }
            <span class="avatar-status-dot"></span>
          </div>
          <div class="header-info">
            <span class="header-title">${config.widgetTitle}</span>
          </div>
        </div>
        <button class="close-btn" aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="messages"></div>

      <div class="input-section">
        <div class="input-wrapper">
          <textarea rows="1" placeholder="Type a message..."></textarea>
          <button class="send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="footer-brand">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>Powered by <strong>Uveriq</strong></span>
        </div>
      </div>
    `;
    shadow.appendChild(panel);

    const messagesEl = panel.querySelector(".messages");
    const textareaEl = panel.querySelector("textarea");
    const sendBtn = panel.querySelector(".send-btn");
    const closeBtn = panel.querySelector(".close-btn");

    // Auto-resizing textarea as user types
    function adjustTextareaHeight() {
      textareaEl.style.height = "auto";
      const newHeight = Math.min(textareaEl.scrollHeight, 96);
      textareaEl.style.height = `${newHeight}px`;
    }

    textareaEl.addEventListener("input", adjustTextareaHeight);

    function addMessage(role, content) {
      const el = document.createElement("div");
      el.className = `msg ${role}`;
      if (role === "assistant") {
        el.innerHTML = formatMarkdown(content);
      } else {
        el.textContent = content;
      }
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    function addTypingIndicator() {
      const el = document.createElement("div");
      el.className = "msg assistant typing-msg";
      el.innerHTML = `
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      `;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    function addSuggestedQuestions(questions) {
      if (!questions || questions.length === 0) return;

      const wrapper = document.createElement("div");
      wrapper.className = "chips-container";

      questions.forEach((q) => {
        const chip = document.createElement("button");
        chip.className = "chip-btn";
        chip.innerHTML = `
          <span>${q}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        chip.addEventListener("click", () => {
          wrapper.remove();
          textareaEl.value = q;
          adjustTextareaHeight();
          sendMessage();
        });
        wrapper.appendChild(chip);
      });

      messagesEl.appendChild(wrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addEmailCapture(question) {
      const wrapper = document.createElement("div");
      wrapper.className = "lead-card";
      wrapper.innerHTML = `
        <div class="lead-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Want us to follow up? Leave your email:</span>
        </div>
        <div class="lead-form-row">
          <input type="email" placeholder="you@example.com" />
          <button type="button">Send</button>
        </div>
      `;
      messagesEl.appendChild(wrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      const emailInput = wrapper.querySelector("input");
      const submitBtn = wrapper.querySelector("button");

      async function submitEmail() {
        const email = emailInput.value.trim();
        if (!email || !email.includes("@")) return;
        submitBtn.disabled = true;
        try {
          await fetch(`${apiBase}/api/chat/${chatbotId}/lead`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ sessionId, email, question }),
          });
          wrapper.innerHTML = `
            <div style="color: #10b981; font-weight: 500; font-size: 13px; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Thanks — we'll be in touch!
            </div>
          `;
        } catch {
          submitBtn.disabled = false;
        }
      }

      submitBtn.addEventListener("click", submitEmail);
      emailInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitEmail();
      });
    }

    async function sendMessage() {
      const text = textareaEl.value.trim();
      if (!text) return;
      textareaEl.value = "";
      adjustTextareaHeight();
      sendBtn.disabled = true;
      addMessage("user", text);

      // Show bouncing typing indicator while waiting for first token
      const typingEl = addTypingIndicator();

      try {
        const res = await fetch(`${apiBase}/api/chat/${chatbotId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ message: text, sessionId, visitorIdentifier }),
        });

        typingEl.remove();

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          addMessage("assistant", data.error || "Something went wrong.");
          return;
        }

        sessionId = res.headers.get("X-Session-Id") || sessionId;
        const requestEmail = res.headers.get("X-Request-Email") === "true";

        const assistantEl = addMessage("assistant", "");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          assistantEl.innerHTML = formatMarkdown(fullText);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        if (requestEmail) addEmailCapture(text);
      } catch (err) {
        typingEl.remove();
        addMessage("assistant", "Connection error. Please try again.");
      } finally {
        sendBtn.disabled = false;
        textareaEl.focus();
      }
    }

    sendBtn.addEventListener("click", sendMessage);
    textareaEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    let isOpen = false;
    function setOpen(open) {
      isOpen = open;
      panel.classList.toggle("open", isOpen);
      bubble.classList.toggle("is-open", isOpen);
      if (isOpen) {
        setTimeout(() => textareaEl.focus(), 200);
      }
    }

    bubble.addEventListener("click", () => setOpen(!isOpen));
    closeBtn.addEventListener("click", () => setOpen(false));

    addMessage("assistant", config.welcomeMessage);
    addSuggestedQuestions(config.suggestedQuestions);
  }

  init();
})(document.currentScript);