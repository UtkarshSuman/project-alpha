# DESIGN.md — Docent Design System & Principles

This document defines *how* every phase in PLAN.md should look, feel, and behave. Treat it as the source of truth when a PLAN.md phase doesn't specify a detail — default to what's written here rather than inventing something new per-component.

---

## 1. Design Philosophy

**"Technical, not corporate."** Docent turns documents into working software (a RAG pipeline + API). The interface should read like a well-built developer/technical product — precise, structured, quietly confident — not like a generic SaaS dashboard template with rounded cards and drop shadows everywhere. Reference points: the feeling of a good CLI tool's web dashboard, a code editor's chrome, an API docs site — dark, high-contrast, monospace accents where data/keys appear, generous negative space instead of decoration.

**Three working principles:**
1. **Structure over decoration.** Borders, grid lines, and alignment do the visual work — not gradients, shadows, or illustration, unless a motif earns its place (see §7).
2. **Motion communicates, it doesn't perform.** Every animation should answer "what just happened" or "what's about to happen." If a motion doesn't clarify state or guide attention, cut it.
3. **The pipeline strip is the brand.** PDF → chunks → embeddings → chatbot is Docent's one unmistakable visual signature. Reuse its visual language (connected nodes, directional flow, monospace labels) sparingly elsewhere as a callback — don't dilute it by scattering unrelated flow diagrams around the product.

---

## 2. Color System

**Base palette (existing tokens — do not rename):**

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0b0e14` | App background, deepest layer |
| `surface` | `#131722` | Cards, panels, sidebar, dialogs |
| `surface-hover` | (derive: `surface` + ~4% lightness) | Hover state for interactive surfaces |
| `line` / border | `#232838` | All borders, dividers, table rules |
| `text` | `#e7e9ee` | Primary text |
| `muted` | `#8b92a6` | Secondary text, placeholders, timestamps |
| `accent` (amber) | `#f2a93b` | Primary actions, focus highlights, key metrics |
| `accent-2` (cyan) | `#4fd1c5` | Secondary accent — links, info states, the "embeddings" stage of the pipeline motif |

**Semantic extensions (new, derive to sit naturally in this palette — don't import generic red/green/yellow):**
- **Success:** a desaturated green-teal that doesn't fight `accent-2` (e.g., muted `#4fbf8b` range) — used for "ready," "connected," "saved."
- **Warning:** reuse `accent` (amber) directly for warning states — it already reads as "attention" in this palette. Don't add a second yellow.
- **Danger:** a muted, dark-mode-appropriate red (avoid pure `#ff0000` — too high-chroma against `ink`; something like `#e0605a` range) — used for delete/destructive actions and error text only.

**Rules:**
- **60/30/10 discipline:** `ink`/`surface` ≈ 60–70% of any screen, `text`/`muted`/`line` ≈ 20–30%, `accent`/`accent-2`/semantic colors combined ≤ 10%. Accent color is for *action and meaning*, never for large fills or backgrounds.
- Never use both `accent` and `accent-2` as competing primary actions on the same screen — pick one as "the" primary action color per view (amber for destructive-adjacent commit actions like "Create," cyan for informational/secondary links), and stay consistent per page type.
- `muted` text must still pass WCAG AA against `surface` and `ink` — verify in Phase 16, don't eyeball it.
- Status badges (chatbot ready/training/error, invite pending/active) always pair a color with a text label or icon — never color alone, for colorblind users.

---

## 3. Typography

**Families (existing — do not change):**
- **Space Grotesk** — `font-display`: page titles (h1/h2), hero headline, stat numbers, section headers. Used sparingly — it's a voice, not a body font.
- **Inter** — default `font-sans`: all body copy, UI labels, form fields, nav items, table content.
- **JetBrains Mono** — default `font-mono`: API keys, embed code snippets, chatbot IDs, timestamps in technical contexts (logs), anything the user might copy-paste.

**Scale (define once in `@theme`, reuse everywhere — no arbitrary `text-[17px]` in components):**
- Display: 3 sizes for hero/page-title/section-title (Space Grotesk, tighter tracking, e.g. `-0.02em`).
- Body: 3 sizes for base/small/caption (Inter, default tracking).
- Mono: 2 sizes for inline code and code blocks (JetBrains Mono, slightly larger line-height than body text for readability of keys/hashes).

**Rules:**
- Never mix Space Grotesk into paragraph-length copy — it's a display face, legibility drops at body sizes.
- Any value the user might copy (API key, embed script, chatbot ID) is *always* `font-mono`, even inline in a sentence.
- Line length for body copy caps at ~65–75 characters on marketing/long-form pages (landing page feature descriptions, FAQ) — constrain with `max-w-prose` equivalents, not full-bleed text.

---

## 4. Spacing, Grid & Layout

- **Base unit:** 4px scale (Tailwind default) — stick to it; no arbitrary pixel values in new components.
- **Card/panel padding:** consistent internal padding scale across all `ui/card` usages (e.g., `p-6` desktop / `p-4` mobile) — a settings card and a chatbot card should feel like siblings, not different products.
- **Dashboard content max-width:** cap content width on wide screens (e.g., `max-w-6xl`) rather than letting cards stretch full-bleed on ultrawide monitors — technical dashboards read better constrained.
- **Grid discipline:** dashboard grids (chatbot cards, stat cards) use consistent column counts per breakpoint (e.g., 1 col mobile / 2 col tablet / 3–4 col desktop) defined once and reused, not redefined per page.
- **Borders over shadows:** prefer a 1px `border-line` to define card edges; use shadow only for elevated/floating elements (dialogs, dropdowns, tooltips) where it signals "this is above the page," not for static in-flow cards.

---

## 5. Motion System

**Philosophy:** motion is feedback and orientation, not flourish. See PLAN.md Phase 0/15 for token setup and audit process.

**Duration scale:**
- `fast` (~120–150ms): micro-interactions — button press, hover state changes, toggle flips.
- `base` (~200–250ms): default transitions — dialog open/close, tab switch, dropdown reveal.
- `slow` (~350–500ms): larger or spatial movement — page/route transitions, scroll-reveal entrances, the pipeline strip animation.

**Easing:**
- `ease-out` for anything entering/appearing (feels responsive, arrives with intent).
- `ease-in-out` for anything moving between two states in place (tab indicator sliding, toggle switching).
- A subtle spring/overshoot curve reserved *only* for the pipeline motif and hero interactions — it's a brand signature, not a default; using it everywhere cheapens it.

**Rules:**
- Loading states must appear if a response takes longer than ~150–200ms (skeleton or spinner) — never a blank frame, never a layout jump when content arrives (skeletons match real content dimensions).
- Every animation respects `prefers-reduced-motion: reduce` — fall back to opacity-only or instant state changes, never disable functionality, only the movement.
- Stagger children sparingly (feature grids, list entrances) — cap stagger delay so a 10-item list doesn't take 2 seconds to finish appearing.
- No animation should block input — a user should be able to click through a 200ms transition without the click being swallowed.
- Toasts/confirmations animate in from a consistent, single position (e.g., bottom-right) app-wide.

---

## 6. Component Patterns

- **Buttons:** primary (amber fill, `ink`-colored text for contrast), secondary (surface fill + border), ghost (transparent, text-only, `surface-hover` on hover), danger (muted red, reserved for destructive confirms only). Loading state swaps label for spinner at fixed width — button never resizes. Disabled state reduces opacity, not color desaturation alone (contrast + `aria-disabled`).
- **Cards:** flat `surface` fill, `border-line` edge, optional `hover:border-accent/40`-style subtle border brighten on interactive cards (not a shadow pop) to indicate clickability.
- **Badges:** small, pill or slightly-rounded-rect, always icon-or-dot + label, color follows semantic system in §2.
- **Dialogs/Modals:** center-anchored, `surface` background, `border-line`, scale+fade entrance (`base` duration, `ease-out`), backdrop is `ink` at partial opacity with blur if performance allows. Always focus-trapped and `Esc`-dismissible.
- **Tabs:** underline indicator that *slides* (not fades) between positions on selection — this single detail is what makes tabs feel "advanced" vs. default.
- **Tables/Lists:** row hover = `surface-hover`, no zebra striping (too "spreadsheet," fights the technical-minimal aesthetic) — rely on `border-line` row dividers instead.
- **Empty states:** centered, small monochrome icon or simple line-art (not stock illustration), one-line heading, one-line supporting copy, single primary action. Never sarcastic/jokey copy — matter-of-fact and helpful (matches the "technical, not corporate" but also not cold tone).
- **Forms:** label above field (not floating labels — clarity over cleverness for a technical audience), inline validation below field, error state = `danger`-colored border + text, never color-only.

---

## 7. The Pipeline Strip Motif

This is Docent's signature visual element (PDF → chunks → embeddings → chatbot) and the one place the design system is allowed to be more expressive than the "structure over decoration" rule elsewhere.

**Where it's allowed to appear:**
- Landing page hero/scroll section (its primary home — can be fully animated/interactive here).
- Onboarding empty state on first chatbot creation (a smaller, quieter callback — reinforces "this is what's about to happen to your document").
- Loading/processing state while a document is actively being ingested (a genuinely functional use — shows real pipeline stage progress, not decorative).

**Where it should NOT appear:** repeated on every dashboard page, in marketing footers, or as generic background texture — overuse turns a signature into wallpaper.

**Visual language to keep consistent wherever it's used:** nodes/stages connected by directional lines, each stage labeled in `font-mono`, `accent` (amber) and `accent-2` (cyan) used to distinguish input (PDF/chunks) from output (embeddings/chatbot) stages, motion flows left-to-right (or top-to-bottom on mobile) matching reading direction.

---

## 8. Data Visualization Principles (Analytics)

- Charts use only palette tokens — `accent`/`accent-2` for data series, `line` for gridlines, `muted` for axis labels. No default chart-library rainbow palettes.
- Gridlines are minimal and low-contrast — they orient, they don't compete with the data.
- Tooltips on hover/focus match `ui/card` styling exactly (same border, background, radius) so they feel native to the product, not like a bolted-on chart library default.
- Empty/zero-data states for charts are explicit ("No conversations yet," not an empty axis with no explanation).
- Numbers are never truncated/ambiguous — full values on hover even if the axis is abbreviated (e.g., "1.2k" label, "1,204" tooltip).
- Range/filter controls animate the transition between datasets (`base` duration) rather than hard-cutting, so trends don't feel like a broken chart re-render.

---

## 9. Iconography

- Single icon set for the entire product (pick one library, e.g., Lucide, and never mix in a second) — stroke-based, not filled, to match the "technical/precise" tone.
- Consistent stroke width across all icon usages.
- Icons are always paired with text labels in navigation (never icon-only nav items without a tooltip/label — accessibility and clarity).
- Icon color follows the same semantic rules as text/badges — `muted` by default, `accent`/semantic colors only when the icon itself carries state meaning.

---

## 10. Accessibility Standards (baseline for every phase)

- **Focus visibility:** every interactive element has a clearly visible focus ring (accent-colored, sufficient contrast against both `ink` and `surface`) — never `outline: none` without a replacement.
- **Keyboard support:** full app usable without a mouse — tab order follows visual order, dialogs trap focus and return it on close, custom components (tabs, dropdowns, accordions) implement the correct ARIA roles and arrow-key patterns, not just click handlers.
- **Color contrast:** WCAG AA minimum (4.5:1 body text, 3:1 large text/UI components) verified against the actual dark palette values, not assumed.
- **Semantic HTML first:** use real `<button>`, `<a>`, `<label>`, `<table>` elements before reaching for ARIA — ARIA supplements, doesn't replace, correct HTML.
- **Motion sensitivity:** `prefers-reduced-motion` respected globally (see §5).
- **Touch targets:** minimum 44×44px on any interactive element for mobile/touch layouts.
- **Form accessibility:** every input has a real associated `<label>`, errors are announced (`aria-describedby` linking field to error text, `aria-live` region for async form-level errors).

---

## 11. Responsive Principles

- **Breakpoints to design/test against:** 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px (desktop), with dashboard content capped at a max-width beyond that (§4).
- Sidebar → off-canvas drawer below 1024px (Phase 2).
- Data tables that can't reasonably compress: switch to a stacked card layout per row on mobile rather than horizontal-scrolling a cramped table.
- Marketing page sections stack vertically on mobile in the same top-to-bottom narrative order as desktop — don't hide content on mobile that exists on desktop, reflow it.
- Touch-friendly spacing on mobile (larger tap targets, more vertical breathing room between list items) vs. denser desktop layouts.

---

## 12. Voice & Copy Tone

- Direct, technical-competent, never cutesy. "Create chatbot," not "Let's make some magic ✨."
- Error messages state what happened and what to do next, in plain language — never raw API error strings, never blame the user.
- Empty states are informative and action-oriented, not jokes.
- Confirmation/success messages are brief ("Chatbot created," "Invite sent") — no exclamation-mark enthusiasm inflation.

---

## 13. How This Maps to PLAN.md

Every principle above should already be "baked in" by the time Phase 1 (UI Primitives) ships — that's the point of building primitives first. Phases 2 onward should mostly be *composition* of Phase 1 components plus domain logic, not re-deciding colors/motion/spacing per page. If a later phase seems to need a new pattern not covered here, add it to this document *before* building it, so DESIGN.md stays the single source of truth rather than drifting out of sync with the actual UI.