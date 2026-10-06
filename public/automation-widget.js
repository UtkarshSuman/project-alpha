// ============================================================================
// FEATURE: Embeddable lead capture form widget
// Separate from the chat widget (public/widget.js) — simpler, no messaging
// UI, just name/email/message → POST → success state.
// ============================================================================
(function () {
  const scriptTag = document.currentScript;
  const serviceId = scriptTag.getAttribute("data-service-id");
  const apiKey = scriptTag.getAttribute("data-api-key");
  const apiBase = scriptTag.getAttribute("data-api-base") || "https://yourapp.com";
  const targetSelector = scriptTag.getAttribute("data-target"); // optional: render inline instead of floating

  if (!serviceId || !apiKey) {
    console.error("[Docent automation widget] Missing data-service-id or data-api-key");
    return;
  }

  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .form-card { background: #fff; border: 1px solid #e5e5e8; border-radius: 10px; padding: 20px; max-width: 360px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .form-title { font-weight: 600; font-size: 15px; margin: 0 0 14px; color: #1a1a1a; }
    .field { margin-bottom: 10px; }
    .field input, .field textarea { width: 100%; border: 1px solid #e5e5e8; border-radius: 6px; padding: 8px 10px; font-size: 13px; outline: none; font-family: inherit; }
    .field textarea { resize: vertical; min-height: 60px; }
    .submit-btn { width: 100%; border: none; border-radius: 6px; padding: 10px; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; }
    .submit-btn:disabled { opacity: 0.6; cursor: default; }
    .success { text-align: center; padding: 20px 0; color: #16a34a; font-size: 14px; }
    .error-msg { color: #dc2626; font-size: 12px; margin-top: 6px; }
  `;
  shadow.appendChild(style);

  async function loadConfig() {
    try {
      const res = await fetch(`${apiBase}/api/automation/${serviceId}/public-config`, { headers: { Authorization: `Bearer ${apiKey}` } });
      return res.ok ? await res.json() : {};
    } catch {
      return {};
    }
  }

  function render(config) {
    const title = config.widgetTitle || "Get in touch";
    const color = config.widgetColor || "#f2a93b";

    const card = document.createElement("div");
    card.className = "form-card";
    card.innerHTML = `
      <p class="form-title">${title}</p>
      <div class="field"><input type="text" placeholder="Name" name="name" required /></div>
      <div class="field"><input type="email" placeholder="Email" name="email" required /></div>
      <div class="field"><textarea placeholder="How can we help?" name="message" required></textarea></div>
      <button class="submit-btn" style="background:${color};">Submit</button>
      <div class="error-msg" style="display:none;"></div>
    `;
    shadow.appendChild(card);

    const btn = card.querySelector(".submit-btn");
    const errorEl = card.querySelector(".error-msg");

    btn.addEventListener("click", async () => {
      const name = card.querySelector('[name="name"]').value.trim();
      const email = card.querySelector('[name="email"]').value.trim();
      const message = card.querySelector('[name="message"]').value.trim();
      if (!name || !email || !message) return;

      btn.disabled = true;
      errorEl.style.display = "none";

      try {
        const res = await fetch(`${apiBase}/api/automation/${serviceId}/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ name, email, message }),
        });
        const data = await res.json();

        if (!res.ok) {
          errorEl.textContent = data.error || "Something went wrong.";
          errorEl.style.display = "block";
          btn.disabled = false;
          return;
        }

        card.innerHTML = `<div class="success">${data.successMessage || "Thanks! We'll be in touch."}</div>`;
      } catch {
        errorEl.textContent = "Connection error. Please try again.";
        errorEl.style.display = "block";
        btn.disabled = false;
      }
    });
  }

  loadConfig().then(render);

  const target = targetSelector ? document.querySelector(targetSelector) : document.body;
  if (target) target.appendChild(host);
})();