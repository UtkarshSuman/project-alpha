// ============================================================================
// FEATURE: Docent embeddable chat widget
// Drop-in script: <script src="https://myapp.com/widget.js"
//   data-chatbot-id="..." data-api-key="..." data-api-base="https://myapp.com"></script>
//
// Uses Shadow DOM so the widget's CSS never collides with (or gets
// overridden by) the host site's stylesheet — this is what makes "one
// script tag on any website" actually reliable in practice.
// ============================================================================
// ============================================================================

// Fetches branding config FIRST, then builds the DOM — avoids the flash of
// default blue color before the real widgetColor loads in.
// - Responsive: panel becomes a near-fullscreen bottom sheet on small
//   screens (<480px) instead of a fixed 360x500 box that overflows.
// - Position: bottom-right or bottom-left, set per chatbot.
// - Themes: 5 visual presets (classic/minimal/rounded/compact/bold),
//   applied via CSS custom properties + a theme class on the host.
// ============================================================================
// ============================================================================
// FEATURE: Docent embeddable chat widget
// - Responsive: panel becomes a near-fullscreen bottom sheet on small
//   screens (<480px) instead of a fixed 360x500 box that overflows.
// - Position: bottom-right or bottom-left, set per chatbot.
// - Themes: 5 visual presets (classic/minimal/rounded/compact/bold),
//   applied via CSS custom properties + a theme class on the host.
// ============================================================================
// ============================================================================
// FEATURE: Docent embeddable chat widget
// - THEMES now controls only visual style (shape/shadow/border), not size
// - SIZES controls actual dimensions, independently, across 3 breakpoints:
//   desktop (default), tablet (<=900px), mobile (<=480px, full bottom sheet)
// ============================================================================
(function () {
  const scriptTag = document.currentScript;
  const chatbotId = scriptTag.getAttribute("data-chatbot-id");
  const apiKey = scriptTag.getAttribute("data-api-key");
  const apiBase = scriptTag.getAttribute("data-api-base") || "https://yourapp.com";

  if (!chatbotId || !apiKey) {
    console.error("[Docent widget] Missing data-chatbot-id or data-api-key");
    return;
  }

  let sessionId = null;

  // Visual style ONLY — no dimensions here anymore.
  const THEMES = {
    classic: { radius: "12px", bubbleRadius: "50%", shadow: "0 10px 40px rgba(0,0,0,0.2)", headerPad: "14px 16px" },
    minimal: { radius: "4px", bubbleRadius: "4px", shadow: "0 1px 3px rgba(0,0,0,0.15)", headerPad: "12px 14px", border: "1px solid #e5e5e8" },
    rounded: { radius: "26px", bubbleRadius: "50%", shadow: "0 12px 44px rgba(0,0,0,0.22)", headerPad: "18px 20px" },
    compact: { radius: "10px", bubbleRadius: "50%", shadow: "0 8px 28px rgba(0,0,0,0.18)", headerPad: "10px 14px", fontScale: "0.92" },
    bold: { radius: "14px", bubbleRadius: "50%", shadow: "0 14px 48px rgba(0,0,0,0.28)", headerPad: "18px 18px", headerFontWeight: "800" },
  };

  // Dimensions ONLY, per breakpoint — independent of theme.
  const SIZES = {
    small:  { bubble: 48, desktopW: 320, desktopH: 460, tabletW: 340, tabletH: 480, mobileVh: 72 },
    medium: { bubble: 60, desktopW: 400, desktopH: 580, tabletW: 380, tabletH: 540, mobileVh: 85 },
    large:  { bubble: 72, desktopW: 460, desktopH: 660, tabletW: 420, tabletH: 600, mobileVh: 92 },
  };

  async function init() {
    let config = {
      widgetTitle: "Chat with us",
      widgetColor: "#6366f1",
      welcomeMessage: "Hi! Ask me anything.",
      widgetPosition: "bottom-right",
      widgetTheme: "classic",
      widgetSize: "medium",
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

    // If the chatbot/key is invalid, don't render a broken-looking full
    // widget — show a minimal, honest bubble+message instead of pretending
    // everything is fine.
    if (configError) {
      const host = document.createElement("div");
      host.id = "docent-widget-root";
      document.body.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          .err-bubble {
            position: fixed; bottom: 20px; right: 20px; background: #1a1a1a; color: #fff;
            padding: 10px 14px; border-radius: 8px; font-size: 12px; font-family: -apple-system, sans-serif;
            box-shadow: 0 4px 14px rgba(0,0,0,0.2); z-index: 999999; max-width: 240px;
          }
        </style>
        <div class="err-bubble">Chat is temporarily unavailable.</div>
      `;
      console.error("[Docent widget]", configError);
      return;
    }

    const theme = THEMES[config.widgetTheme] || THEMES.classic;
    const size = SIZES[config.widgetSize] || SIZES.medium;
    const isLeft = config.widgetPosition === "bottom-left";

    const host = document.createElement("div");
    host.id = "docent-widget-root";
    host.style.setProperty("--accent", config.widgetColor);
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }

      .bubble {
        position: fixed; bottom: 20px; ${isLeft ? "left: 20px;" : "right: 20px;"}
        width: ${size.bubble}px; height: ${size.bubble}px;
        border-radius: ${theme.bubbleRadius}; background: var(--accent, #6366f1); border: none;
        cursor: pointer; box-shadow: ${theme.shadow}; z-index: 999999;
        display: flex; align-items: center; justify-content: center;
      }
      .bubble svg { width: ${Math.round(size.bubble * 0.46)}px; height: ${Math.round(size.bubble * 0.46)}px; fill: white; }

      .panel {
        position: fixed; bottom: ${size.bubble + 16}px; ${isLeft ? "left: 20px;" : "right: 20px;"}
        width: ${size.desktopW}px; max-width: calc(100vw - 40px);
        height: ${size.desktopH}px; max-height: calc(100vh - 120px);
        background: #fff; border-radius: ${theme.radius};
        box-shadow: ${theme.shadow}; ${theme.border ? `border: ${theme.border};` : ""}
        display: none; flex-direction: column; overflow: hidden; z-index: 999999;
        font-size: calc(1em * ${theme.fontScale || 1});
      }
      .panel.open { display: flex; }

      .header {
        background: var(--accent, #6366f1); color: #fff; padding: ${theme.headerPad};
        font-weight: ${theme.headerFontWeight || 600}; font-size: 14px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .close-btn { background: none; border: none; color: #fff; opacity: 0.85; cursor: pointer; font-size: 16px; line-height: 1; padding: 4px; }

      .messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: #f7f7f9; }
      .msg { max-width: 80%; padding: 8px 12px; border-radius: calc(${theme.radius} * 0.6); font-size: 13px; line-height: 1.4; }
      .msg.user { align-self: flex-end; background: var(--accent, #6366f1); color: #fff; }
      .msg.assistant { align-self: flex-start; background: #fff; color: #1a1a1a; border: 1px solid #e5e5e8; }
      .msg.loading { align-self: flex-start; color: #888; font-style: italic; }

      .input-row { display: flex; border-top: 1px solid #e5e5e8; padding: 8px; gap: 8px; }
      .input-row input {
        flex: 1; border: 1px solid #e5e5e8; border-radius: calc(${theme.radius} * 0.5); padding: 8px 10px; font-size: 13px; outline: none;
      }
      .input-row button {
        background: var(--accent, #6366f1); color: #fff; border: none; border-radius: calc(${theme.radius} * 0.5);
        padding: 8px 14px; font-size: 13px; cursor: pointer;
      }
      .input-row button:disabled { opacity: 0.5; cursor: default; }

      /* TABLET breakpoint: slightly smaller than desktop, still floating
         (not full-screen) — tablets have room for a real panel, just less
         of it than a laptop. */
      @media (max-width: 900px) {
        .panel {
          width: ${size.tabletW}px; height: ${size.tabletH}px;
        }
      }

      /* MOBILE breakpoint: full-width bottom sheet, height scales with the
         chosen size (small/medium/large) via mobileVh, since a fixed pixel
         panel doesn't make sense once we're already going full-width. */
      @media (max-width: 480px) {
        .panel {
          width: 100vw; height: ${size.mobileVh}vh; max-width: 100vw; max-height: ${size.mobileVh}vh;
          bottom: 0; left: 0; right: 0; border-radius: ${theme.radius} ${theme.radius} 0 0;
        }
        .bubble {
          width: ${Math.round(size.bubble * 0.9)}px; height: ${Math.round(size.bubble * 0.9)}px;
          bottom: 16px; ${isLeft ? "left: 16px;" : "right: 16px;"}
        }
      }
    `;
    shadow.appendChild(style);

    const bubble = document.createElement("button");
    bubble.className = "bubble";
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.02 2 11c0 2.4 1.05 4.57 2.77 6.19L4 22l5.05-1.35c.94.24 1.93.35 2.95.35 5.52 0 10-4.02 10-9S17.52 2 12 2z"/></svg>`;
    shadow.appendChild(bubble);

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <div class="header">
        <span>${config.widgetTitle}</span>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="messages"></div>
      <div class="input-row">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    `;
    shadow.appendChild(panel);

    const messagesEl = panel.querySelector(".messages");
    const inputEl = panel.querySelector("input");
    const sendBtn = panel.querySelector(".input-row button");
    const closeBtn = panel.querySelector(".close-btn");

    function addMessage(role, content) {
      const el = document.createElement("div");
      el.className = `msg ${role}`;
      el.textContent = content;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    function addEmailCapture(question) {
      const wrapper = document.createElement("div");
      wrapper.className = "msg assistant";
      wrapper.style.width = "100%";
      wrapper.style.maxWidth = "100%";
      wrapper.innerHTML = `
        <p style="margin: 0 0 8px;">Want us to follow up? Leave your email:</p>
        <div style="display: flex; gap: 6px;">
          <input type="email" placeholder="you@example.com"
                 style="flex: 1; border: 1px solid #e5e5e8; border-radius: 6px; padding: 6px 8px; font-size: 12px; outline: none;" />
          <button style="background: var(--accent, #6366f1); color: #fff; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer;">
            Send
          </button>
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
          wrapper.innerHTML = `<p style="margin: 0; color: #4fd1c5;">Thanks — we'll be in touch!</p>`;
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
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = "";
      sendBtn.disabled = true;
      addMessage("user", text);

      const loadingEl = addMessage("loading", "Typing...");

      try {
        const res = await fetch(`${apiBase}/api/chat/${chatbotId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ message: text, sessionId }),
        });
        const data = await res.json();
        loadingEl.remove();

        if (!res.ok) {
          addMessage("assistant", data.error || "Something went wrong.");
        } else {
          sessionId = data.sessionId;
          addMessage("assistant", data.reply);
          if (data.requestEmail) addEmailCapture(text);
        }
      } catch (err) {
        loadingEl.remove();
        addMessage("assistant", "Connection error. Please try again.");
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    let isOpen = false;
    bubble.addEventListener("click", () => {
      isOpen = !isOpen;
      panel.classList.toggle("open", isOpen);
    });
    closeBtn.addEventListener("click", () => {
      isOpen = false;
      panel.classList.remove("open");
    });

    addMessage("assistant", config.welcomeMessage);
  }

  init();
})();