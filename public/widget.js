// ============================================================================
// FEATURE: Docent embeddable chat widget
// Drop-in script: <script src="https://myapp.com/widget.js"
//   data-chatbot-id="..." data-api-key="..." data-api-base="https://myapp.com"></script>
//
// Uses Shadow DOM so the widget's CSS never collides with (or gets
// overridden by) the host site's stylesheet — this is what makes "one
// script tag on any website" actually reliable in practice.
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
  let config = { widgetTitle: "Chat with us", widgetColor: "#6366f1", welcomeMessage: "Hi! Ask me anything." };
  let isOpen = false;

  // --- Host element + Shadow DOM ---
  const host = document.createElement("div");
  host.id = "docent-widget-root";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .bubble {
      position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
      border-radius: 50%; background: var(--accent, #6366f1); border: none;
      cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25); z-index: 999999;
      display: flex; align-items: center; justify-content: center;
    }
    .bubble svg { width: 26px; height: 26px; fill: white; }
    .panel {
      position: fixed; bottom: 88px; right: 20px; width: 360px; max-width: calc(100vw - 40px);
      height: 500px; max-height: calc(100vh - 120px); background: #fff; border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: none; flex-direction: column;
      overflow: hidden; z-index: 999999;
    }
    .panel.open { display: flex; }
    .header { background: var(--accent, #6366f1); color: #fff; padding: 14px 16px; font-weight: 600; font-size: 14px; }
    .messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; background: #f7f7f9; }
    .msg { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.4; }
    .msg.user { align-self: flex-end; background: var(--accent, #6366f1); color: #fff; }
    .msg.assistant { align-self: flex-start; background: #fff; color: #1a1a1a; border: 1px solid #e5e5e8; }
    .msg.loading { align-self: flex-start; color: #888; font-style: italic; }
    .input-row { display: flex; border-top: 1px solid #e5e5e8; padding: 8px; gap: 8px; }
    .input-row input {
      flex: 1; border: 1px solid #e5e5e8; border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none;
    }
    .input-row button {
      background: var(--accent, #6366f1); color: #fff; border: none; border-radius: 8px;
      padding: 8px 14px; font-size: 13px; cursor: pointer;
    }
    .input-row button:disabled { opacity: 0.5; cursor: default; }
  `;
  shadow.appendChild(style);

  const bubble = document.createElement("button");
  bubble.className = "bubble";
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.02 2 11c0 2.4 1.05 4.57 2.77 6.19L4 22l5.05-1.35c.94.24 1.93.35 2.95.35 5.52 0 10-4.02 10-9S17.52 2 12 2z"/></svg>`;
  shadow.appendChild(bubble);

  const panel = document.createElement("div");
  panel.className = "panel";
  panel.innerHTML = `
    <div class="header"></div>
    <div class="messages"></div>
    <div class="input-row">
      <input type="text" placeholder="Type a message..." />
      <button>Send</button>
    </div>
  `;
  shadow.appendChild(panel);

  const headerEl = panel.querySelector(".header");
  const messagesEl = panel.querySelector(".messages");
  const inputEl = panel.querySelector("input");
  const sendBtn = panel.querySelector(".input-row button");

  function addMessage(role, content) {
    const el = document.createElement("div");
    el.className = `msg ${role}`;
    el.textContent = content;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
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

  bubble.addEventListener("click", () => {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
  });

  // --- Load branding config, then apply + show welcome message ---
  fetch(`${apiBase}/api/chat/${chatbotId}/config`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.error) return;
      config = { ...config, ...data };
      host.style.setProperty("--accent", config.widgetColor);
      headerEl.textContent = config.widgetTitle;
      addMessage("assistant", config.welcomeMessage);
    })
    .catch(() => {
      headerEl.textContent = config.widgetTitle;
      addMessage("assistant", config.welcomeMessage);
    });
})();