# PLAN.md — Docent Frontend Redesign

**Scope:** Frontend/UI only. No changes to `/app/api/**`, `/lib/**` (except new `lib/hooks/`, `lib/animations/`), `/prisma/**`, or `/public/widget.js`. Every section below restyles/restructures existing pages against their existing API contracts — no request/response shape changes.

**Stack confirmed:** Next.js 16 App Router, TypeScript, Tailwind v4 (CSS-first `@theme` config in `app/globals.css`), plain custom components (no shadcn), `cn()` helper via clsx + tailwind-merge, `lib/hooks/`, `lib/animations/`.

**Sequencing logic:** primitives → shell → data-heavy dashboard pages → domain features → auth → marketing (marketing last so it can borrow the finished visual language) → cross-cutting passes (states, motion, a11y, responsive, QA) at the end, applied everywhere.

---

## Phase 0 — Foundation

**Goal:** Lock the design system into code before any page work starts, so every later phase pulls from the same source instead of inventing tokens ad hoc.

**Touches:** `app/globals.css` (`@theme` block), `styles/tokens.css` (new, split out if `@theme` grows large), `tailwind.config` (if any non-CSS config remains), `lib/utils.ts` (confirm `cn()`), `types/ui.ts` (new).

**Deliverables:**
- Full token set in `@theme`: color scale (ink, surface, surface-hover, line/border, text, muted, accent, accent-2, plus semantic states — success/warning/danger — derived to fit the palette), spacing scale confirmation, radius scale, shadow scale, font families (`font-display`, `font-sans`, `font-mono`), font-size/line-height type scale.
- Motion tokens as CSS custom properties: duration scale (`--duration-fast/base/slow`), easing curves (`--ease-out`, `--ease-in-out`, `--ease-spring`).
- `types/ui.ts`: shared prop types (`Size`, `Variant`, `WithAsChild`, common polymorphic patterns) used across `components/ui/*`.
- Decision doc (in DESIGN.md) on animation approach: CSS transitions/keyframes by default, Framer Motion added only where orchestration (staggering, layout animation, drag) is needed — keeps bundle lean.

**No pages touched yet.** This phase is pure infrastructure.

---

## Phase 1 — UI Primitives (`components/ui/`)

**Goal:** Rebuild the "dumb" primitive layer so every later feature/page composes from a consistent, accessible, motion-considered base instead of raw Tailwind divs.

**Touches:** `components/ui/button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx` (new), `select.tsx` (new), `checkbox.tsx`/`switch.tsx` (new), `card.tsx` (new), `badge.tsx`, `dialog.tsx`, `container.tsx`, `tooltip.tsx` (new), `dropdown-menu.tsx` (new), `tabs.tsx` (new, generalized from `chatbot-tabs.tsx`), `toast.tsx` (new), `skeleton.tsx` (new), `spinner.tsx` (new), `empty-state.tsx` (new), `avatar.tsx` (new).

**Features:**
- **Button:** variants (primary/amber, secondary/surface, ghost, danger, cyan-accent), sizes, loading state (inline spinner replaces label, width doesn't jump), icon-only variant with required `aria-label`.
- **Input/Textarea/Select:** consistent focus ring (accent-colored, visible, 2px offset), error state styling + `aria-invalid` + inline error message slot, disabled state.
- **Card:** base surface card with optional hover-lift (used for chatbot cards, plan cards).
- **Dialog:** built on native `<dialog>` or a lightweight portal; focus-trapped, `Esc` to close, backdrop click to close, entrance/exit transition (scale + fade), returns focus to trigger on close.
- **Tabs:** generalized from the existing `chatbot-tabs.tsx` pattern — animated underline/indicator that slides between tabs, keyboard arrow-key navigation, `role="tablist"`.
- **Toast:** for async action feedback (create/delete/save), auto-dismiss, pause-on-hover, stacks.
- **Skeleton/Spinner:** shared loading primitives used everywhere `Suspense` boundaries or client fetches exist.
- **EmptyState:** icon/illustration slot + heading + description + primary action — reused across chatbots list, analytics, team, leads.
- **DropdownMenu:** for row actions (chatbot card menu, table row menu), keyboard-navigable.

**Accessibility baseline set here:** every primitive gets correct focus-visible styling, ARIA roles, and keyboard support once — inherited by everything built on top.

---

## Phase 2 — Dashboard Shell (`app/(dashboard)/layout.tsx`, `components/layouts/`)

**Goal:** The persistent frame every dashboard page lives inside.

**Touches:** `app/(dashboard)/layout.tsx`, `components/layouts/dashboard-shell.tsx` (new wrapper), `components/dashboard/sidebar.tsx`, `components/dashboard/topbar.tsx`.

**Features:**
- **Sidebar:** collapsible (icon-only rail ↔ full width) with persisted preference; active-route indicator with animated highlight; grouped nav sections (Chatbots, Team, Billing, Settings); user/account block pinned to bottom.
- **Topbar:** breadcrumb or page title reflecting current route, user menu (avatar + dropdown: profile, sign out), notification/status slot if applicable.
- **Mobile behavior:** sidebar becomes an off-canvas drawer triggered by a hamburger in the topbar, closes on route change and on backdrop tap, focus-trapped while open.
- **Auth guard:** keep existing `getServerSession` server-side check as-is; only restyle the redirect/loading UX around it (e.g., a branded loading state instead of a blank flash).
- **Page transition:** subtle fade/slide on route change inside the content area (via `lib/animations/` shared variants), not on the shell chrome itself.

---

## Phase 3 — Dashboard Overview (`app/(dashboard)/dashboard/page.tsx`)

**Goal:** First screen after login — needs to feel alive and informative immediately.

**Touches:** `app/(dashboard)/dashboard/page.tsx`, new `components/features/dashboard/stat-card.tsx`, reuse `components/features/billing/quota-bar.tsx`.

**Features:**
- Stat cards (chatbots count, messages this month, active documents, etc.) with count-up animation on mount and a small trend indicator.
- Quota bar restyled: animated fill on load, color shifts as usage approaches limit (accent → warning), tooltip with exact numbers.
- "Recent chatbots" list restyled as compact cards linking into chatbot detail, with an empty state ("Create your first chatbot") if the account has none — this is the primary onboarding moment for new users.
- Skeleton loading state matching the final layout shape (no layout shift when data arrives).

---

## Phase 4 — Chatbots List (`app/(dashboard)/chatbots/page.tsx` + `chatbots-client.tsx`)

**Goal:** Primary workspace list — browse, create, delete chatbots.

**Touches:** `chatbots-client.tsx`, new `components/features/chatbots/chatbot-card.tsx`, `create-chatbot-dialog.tsx`.

**Features:**
- Grid of `ChatbotCard`s: name, status badge (training/ready/error — reflecting real ingestion status from Inngest pipeline, read-only display), doc count, last-active timestamp, hover-revealed quick actions (open, settings, delete via dropdown).
- `CreateChatbotDialog`: multi-step feel within one dialog — name/details → file upload (drag-and-drop zone with file-type/size validation feedback) → confirm. Upload progress state and a "processing" state that reflects the existing ingestion pipeline status without changing how it's triggered.
- Delete flow: confirmation dialog (danger button variant), optimistic row removal with undo toast, rollback on API error.
- Empty state (zero chatbots) using `EmptyState` primitive, same illustration language as onboarding.
- Search/filter bar if list can grow long (client-side filter on existing fetched data — no new API needed).

---

## Phase 5 — Chatbot Detail Shell + Overview Tab (`app/(dashboard)/chatbots/[id]/**`)

**Goal:** Restyle the tabbed detail shell (`chatbot-tabs.tsx`) and the overview sub-tab.

**Touches:** `chatbot-tabs.tsx` (migrate to Phase 1's generalized `ui/tabs.tsx`), `app/(dashboard)/chatbots/[id]/page.tsx` (overview tab content).

**Features:**
- Header block: chatbot name (inline-editable if API supports rename), status badge, embed snippet quick-copy (JetBrains Mono, copy-to-clipboard with confirmation micro-interaction).
- Documents panel (`documents-panel.tsx`): list of ingested docs with per-doc status (queued/processing/ready/failed reflecting Inngest job state), re-upload/delete actions, drag-and-drop to add more docs directly from this view.
- API key display: masked by default, reveal-on-click, copy button, regenerate action behind a confirmation dialog.

---

## Phase 6 — Analytics Tab & Visualization (`app/(dashboard)/chatbots/[id]/analytics`)

**Goal:** This is the flagship "better data visualization" deliverable.

**Touches:** new `components/features/analytics/analytics-chart.tsx`, `leads-list.tsx`, analytics tab page.

**Features:**
- Time-series chart (messages/conversations over time) — custom SVG or lightweight chart lib, styled to tokens (accent/accent-2 lines, gridlines in `border-line`, tooltips on hover/focus matching card styling), range selector (7d/30d/90d) with animated re-draw on range change, not a jarring re-render.
- Secondary metrics row: response time, resolution/fallback rate, top questions — as compact stat tiles.
- `LeadsList` (if product captures leads via chatbot conversations): sortable/filterable table with row expand for full transcript, empty state when no leads yet.
- Loading state: skeleton chart shape, not a generic spinner, so the layout doesn't jump.
- Empty state: "No conversations yet" with a nudge to embed the widget (links to embed snippet from Phase 5).

---

## Phase 7 — Chatbot Settings Tab

**Goal:** Config surface for a single chatbot — restyle only, no new fields unless they map to existing API fields.

**Touches:** chatbot settings tab page, reuse `ui/input`, `ui/select`, `ui/switch`.

**Features:**
- Grouped settings sections (behavior/persona, widget appearance, danger zone) with clear visual separation.
- Autosave or explicit save pattern (match whatever the existing API expects) with a persistent but unobtrusive "saved" confirmation (toast or inline check-mark micro-interaction).
- Danger zone (delete chatbot) visually isolated, red-bordered card, requires typed confirmation.
- Widget appearance settings (if present): live preview pane showing the widget bubble/window styled with chosen colors, updating in real time as fields change.

---

## Phase 8 — Team

**Goal:** Restyle member management.

**Touches:** `components/features/team/invite-dialog.tsx`, `members-list.tsx`, team page.

**Features:**
- Members table/list with role badges, pending-invite state visually distinct (dashed border or muted style) from active members.
- Invite dialog: email input with inline validation, role select, success toast, list updates optimistically.
- Remove member: confirmation dialog, optimistic removal.
- Empty/solo state: "You're the only member — invite your team" prompt.

---

## Phase 9 — Billing

**Goal:** Restyle subscription management (Razorpay-backed, contract unchanged).

**Touches:** `components/features/billing/plan-switcher.tsx`, `quota-bar.tsx` (shared with Phase 3), billing page.

**Features:**
- Current plan card: plan name, price, renewal date, quota bar (shared component).
- Plan comparison/switcher: card-based plan picker mirroring pricing-page cards for consistency, current plan visually marked, upgrade/downgrade CTA states (loading during Razorpay handoff, clear return-state handling).
- Invoice/payment history list (if API exposes it): simple table, download links styled consistently.
- Cancel flow: confirmation dialog explaining consequence (loss of access date, etc.), danger-variant button.

---

## Phase 10 — Account Settings

**Goal:** Restyle profile/account settings.

**Touches:** `app/(dashboard)/settings/page.tsx`.

**Features:**
- Profile section (name, email, avatar), password/connected-account section (respecting NextAuth provider — hide password fields for OAuth-only accounts), notification preferences if applicable.
- Consistent save/confirmation pattern matching Phase 7.
- Account deletion (if supported): danger zone pattern matching Phase 7/8.

---

## Phase 11 — Auth Pages (`app/(auth)/**`)

**Goal:** Login/register/forgot/reset — first and last impression for conversion and retention.

**Touches:** login, register, forgot-password, reset-password pages; `components/layouts/auth-layout.tsx` (new).

**Features:**
- Shared `AuthLayout`: centered card on branded background (subtle motif — e.g. a faded pipeline-strip pattern or particle/gradient treatment), logo, consistent card width.
- Google OAuth button styled to match brand (not default provider styling) + divider ("or continue with email").
- Form validation: inline, real-time where sensible (email format, password strength meter on register), clear error states from API responses (e.g., wrong password, email exists) surfaced without redesigning the API's error shape.
- Loading states on submit (button loading variant from Phase 1), disabled form during submission.
- Success states: reset-password confirmation screen, register → verify-email prompt if applicable, with clear next steps.
- Micro-interaction: smooth transition between login ↔ register if both are reachable from one entry point.

---

## Phase 12 — Marketing: Landing Page (`app/(marketing)/page.tsx`)

**Goal:** Conversion-focused rebuild — the most "creative" phase, leans on the finished design system for cohesion.

**Touches:** `app/(marketing)/page.tsx`, `components/marketing/hero.tsx`, `pipeline-strip.tsx`, `social-proof.tsx`, `feature-grid.tsx`, `faq.tsx`, `cta-section.tsx`, `footer.tsx` (all new).

**Features:**
- **Hero:** headline/subhead, primary CTA, and a live or animated product visual (e.g., an interactive mini-demo of "upload doc → chat" rather than a static screenshot).
- **Pipeline strip motif, elevated:** animate the PDF → chunks → embeddings → chatbot flow (scroll-triggered or auto-looping), used as the signature scroll moment of the page, not just a static graphic.
- **Feature grid:** icon + heading + description cards, staggered entrance animation on scroll into view.
- **Social proof / stats section:** logos or usage numbers with count-up on scroll.
- **FAQ:** accordion built on `ui/dialog`-adjacent disclosure pattern, one open at a time, animated height.
- **Final CTA + footer.**
- Full scroll-reveal system defined once in `lib/animations/` and reused across every section for consistency (same easing/duration/threshold).

---

## Phase 13 — Marketing: Pricing Page (`app/(marketing)/pricing/page.tsx`)

**Goal:** Clear plan comparison optimized for decision-making.

**Touches:** `app/(marketing)/pricing/page.tsx`, `components/marketing/pricing-table.tsx`.

**Features:**
- Monthly/annual billing toggle with animated price re-calculation (no page reload, client-side swap).
- Plan cards consistent with the billing-page switcher (Phase 9) for visual continuity between marketing and app.
- "Most popular" plan visually emphasized (border/glow, not just a badge).
- Feature comparison table below cards for detail-oriented visitors, sticky header on scroll if long.
- FAQ reuse from landing page component.

---

## Phase 14 — Cross-Cutting: Empty / Error / Loading States Pass

**Goal:** Audit every page built in Phases 3–13 for consistent state coverage — this is a pass, not new pages.

**Checklist per page:** loading (skeleton matches real layout), empty (uses `EmptyState` primitive, actionable), error (retry action, human-readable message, doesn't lose user's place), and offline/network-failure handling where relevant (e.g., dialog submit failing).

---

## Phase 15 — Cross-Cutting: Motion Pass

**Goal:** Ensure motion is consistent, not decorative noise — audit against the duration/easing tokens from Phase 0.

**Checklist:** every transition uses shared tokens (no one-off durations), `prefers-reduced-motion` respected globally (fallback to instant/opacity-only transitions), no motion blocks interaction (e.g., can't click through mid-transition), page-load animations don't repeat annoyingly on every navigation (session-aware where appropriate).

---

## Phase 16 — Cross-Cutting: Accessibility & Responsive Audit

**Goal:** Final verification pass across the whole app.

**Checklist:** full keyboard-only walkthrough (tab order, focus visible everywhere, no traps outside intentional dialog traps), screen-reader pass on key flows (create chatbot, invite member, checkout), color-contrast check against the dark palette (esp. `muted` text and `accent` on `surface`), responsive check at 375/768/1024/1440px for every page built, touch target sizing on mobile (44px minimum), form labels/`aria-describedby` correctness.

---

## Phase 17 — Final QA & Polish

**Goal:** Ship-readiness pass.

**Checklist:** cross-browser check (Safari/Firefox/Chrome), performance pass (font loading strategy, image optimization, animation GPU-friendliness, bundle size if Framer Motion was added), consistent copy tone across empty states/errors/CTAs, remove any leftover placeholder content, final visual diff against DESIGN.md principles.

---

## Suggested Order Summary

`0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17`

Phases 3–10 (dashboard interior) can be reordered relative to each other based on your priority (e.g., if analytics is the sales-demo centerpiece, pull Phase 6 earlier — it only depends on Phases 0–2 + the `ui/tabs` and `ui/card` primitives, not on Phases 4/5/7 being done first). Marketing (12–13) is intentionally last so it can visually quote the finished dashboard/auth system, but can move earlier if you need a landing page sooner for external use.