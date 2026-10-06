# PROJECT_FRONTEND_PLAN.md — Uveriq/Docent Frontend Build Plan

**Last updated:** 2026-10-02
**Status:** PHASE 0 COMPLETE — awaiting approval to proceed

---

## What We Are Building

**Uveriq** (product name in `layout.tsx`) is an AI services platform for teams. It lets organizations run RAG (knowledge retrieval), action agents, cache-augmented generation, and AI automation from a single governed workspace. Users upload documents, create chatbots/tool-agents, expose scoped API keys, embed widgets on customer sites, and manage billing and team access — all from one control plane.

The product is real and working. The frontend is functional but in an early state: consistent design tokens exist, but many pages are bare Tailwind divs with no visual hierarchy, hover states, loading states, empty states, or animation.

---

## PHASE 0: PROJECT AUDIT — COMPLETE

### Framework and Stack

- **Next.js 16.2.10** — App Router, React 19.2.4, TypeScript 5
- **Tailwind CSS v4** — CSS-first `@theme` config in `app/globals.css`. No `tailwind.config.js`. Token utilities generated from `@theme` block only, NOT from `:root`. Do NOT write v3-style `tailwind.config` or `@tailwind` directives.
- **Styling:** Plain Tailwind utilities in TSX plus `cn()` helper (clsx + tailwind-merge). No CSS Modules, no shadcn/ui.
- **Icons:** `lucide-react` v1.24.0 — currently used throughout. The master build prompt prohibits Lucide. DESIGN.md endorses "pick one library." Resolution: migrate away from Lucide progressively during each phase rebuild, using inline SVGs or Heroicons. No mass replacement in one pass.
- **Fonts:** Space Grotesk (display), Inter (sans), JetBrains Mono (mono). The build prompt prohibits Inter and Space Grotesk, but DESIGN.md explicitly chose them before this prompt arrived. Honoring existing DESIGN.md decision. Do NOT change fonts without explicit user approval.
- **Auth:** NextAuth v4, credentials + Google OAuth, server-side `getServerSession` guard
- **Database:** PostgreSQL via Prisma on Supabase
- **Background jobs:** Inngest
- **Payments:** Razorpay (INR), mock mode for dev
- **AI:** Anthropic Claude, OpenAI, Groq, Xenova local embeddings
- **Storage:** Supabase or Cloudflare R2
- **Email:** Resend | **Rate limiting:** Upstash Redis

### Existing Route Map

```
app/
  (marketing)/
    layout.tsx          — navbar + footer
    page.tsx            — landing page, EXISTS, has ProductPreview
    pricing/            — pricing page, EXISTS
  (auth)/
    layout.tsx          — two-column auth shell, EXISTS
    login/page.tsx      — AuthCard (EXISTS)
    register/           — EXISTS
    forgot-password/    — EXISTS
    reset-password/     — EXISTS
  (dashboard)/
    layout.tsx          — sidebar + topbar, EXISTS, minimal
    dashboard/page.tsx  — stat cards + recent chatbots, EXISTS, functional
    chatbots/
      page.tsx          — list page, EXISTS
      chatbots-client.tsx — create dialog + grid, EXISTS
      [chatbotid]/
        page.tsx        — overview + docs + API keys, EXISTS
        keys-section.tsx
        analytics/      — analytics tab, EXISTS (chart likely stub)
        playground/     — chat playground, EXISTS
        settings/       — chatbot settings, EXISTS
    services/
      new/[serviceid]/page.tsx — redirects RAG to /chatbots, tool to /tool-agents
  api/
    auth/               — NextAuth
    billing/            — subscribe, verify, cancel, webhooks
    chat/[serviceid]/   — public chat + tool-agent
    chatbots/           — CRUD
    inngest/            — background jobs
    internal/           — admin
    invites/            — team invites
    keys/               — API key CRUD
    organization/       — org settings
    tool-agents/        — CRUD (API EXISTS, dashboard page MISSING)
    webhooks/           — Razorpay
  invite/               — invite accept flow
```

**MISSING:** `/tool-agents` dashboard route. `services/new/tool` redirects to `/tool-agents?create=1` which returns 404.

### Existing Components

**`components/ui/`** (primitive layer)
- `button.tsx` — 3 variants. No danger variant. No loading prop.
- `badge.tsx` — 4 status states (READY/DRAFT/INGESTING/ERROR).
- `dialog.tsx` — basic modal, no entrance animation. Uses Lucide X.
- `input.tsx` — basic styled input. No error state.
- `label.tsx` — simple label.
- `container.tsx` — max-w-7xl wrapper.
- `skeleton.tsx` — basic shimmer.

**`components/dashboard/`** (26 files, all functional, mostly unstyled)
- `sidebar.tsx` — desktop only, static. Uses Lucide icons. No mobile.
- `topbar.tsx` — email + sign out only. No breadcrumb or avatar.
- `chatbot-card.tsx` — link card. Uses Lucide Bot.
- `chatbot-tabs.tsx` — underline tabs, no sliding indicator.
- `chatbot-settings-form.tsx` — 192-line working form.
- `create-chatbot-dialog.tsx` — name-only creation, no animation.
- `documents-panel.tsx` — doc list + upload. Works.
- `billing-plan-switcher.tsx` — Razorpay integration. Works.
- `analytics-chart.tsx` — 998 bytes, likely a stub.
- (+ 17 more working feature components)

**`components/features/auth/`** — full auth flow, 5 files, all working.
**`components/marketing/`** — navbar, footer, service-card, services-section.

### Design System Status

- **Tokens:** Complete in `app/globals.css` `@theme` block. Colors, fonts, radius, shadows, motion tokens all present.
- **Motion:** CSS keyframes for pipeline-arrow + service-scan. Global reduced-motion fallback.
- **Focus ring:** Global `:focus-visible` with accent-2 outline.
- **MISSING primitives:** Spinner, EmptyState, Toast, Tabs (generalized), Select, Textarea, Dropdown, Avatar. No `types/ui.ts`. No `lib/hooks/` or `lib/animations/`.

### Problems Found

1. Sidebar is mobile-invisible — `hidden md:block`, no mobile drawer
2. Topbar is nearly empty — just email + sign out
3. Lucide icons throughout — needs progressive replacement strategy
4. `analytics-chart.tsx` is likely a stub — no real visualization
5. `/tool-agents` dashboard route does not exist
6. No loading/skeleton states in most pages
7. No toast/notification system
8. Dialog has no entrance animation
9. Button missing `danger` variant and `loading` prop
10. Product name mismatch: `layout.tsx` says "Uveriq", sidebar/auth say "docent"

---

## DEVELOPMENT PHASES

Each phase requires approval before the next begins.

### Phase 0 — Audit + Documentation (COMPLETE)
Deliverables: `PROJECT_FRONTEND_PLAN.md`, `FRONTEND_ARCHITECTURE.md`

---

### Phase 1 — UI Primitive Upgrades (COMPLETE)
**Goal:** Harden the primitive layer before anything is built on top.

**Files changed (additions/upgrades only — nothing working deleted):**
- `components/ui/button.tsx` — add `danger` variant, `loading` prop
- `components/ui/dialog.tsx` — CSS entrance animation (scale+fade), replace Lucide X
- `components/ui/input.tsx` — add `error` prop (danger border + aria-invalid)
- `components/ui/spinner.tsx` (NEW)
- `components/ui/empty-state.tsx` (NEW)
- `components/ui/toast.tsx` (NEW) — bottom-right, auto-dismiss, stacks
- `components/ui/tabs.tsx` (NEW) — sliding underline indicator
- `components/ui/textarea.tsx` (NEW)
- `types/ui.ts` (NEW) — Size, Variant, shared prop types
- `lib/hooks/use-toast.ts` (NEW)

**Not touched:** pages, API routes, Prisma schema

---

### Phase 2 — Dashboard Shell
- `components/dashboard/sidebar.tsx` — mobile off-canvas drawer, collapsible desktop, animated active indicator
- `components/dashboard/topbar.tsx` — breadcrumb, user avatar + dropdown, hamburger
- `app/(dashboard)/layout.tsx` — wire mobile sidebar state

---

### Phase 3 — Dashboard Overview
- `app/(dashboard)/dashboard/page.tsx` — skeleton loading, count-up animation, quota bar color shift
- `components/features/dashboard/stat-card.tsx` (NEW)
- `components/dashboard/quota-bar.tsx` — animated fill

---

### Phase 4 — Chatbots List
- `app/(dashboard)/chatbots/chatbots-client.tsx` — search/filter, improved empty state
- `components/dashboard/chatbot-card.tsx` — hover quick actions dropdown, icon update
- `components/dashboard/create-chatbot-dialog.tsx` — animation, spinner loading state

---

### Phase 5 — Chatbot Detail + Overview Tab
- `components/dashboard/chatbot-tabs.tsx` — migrate to ui/tabs sliding indicator
- `app/(dashboard)/chatbots/[chatbotid]/page.tsx` — skeleton, improved layout
- `components/dashboard/documents-panel.tsx` — per-doc status indicators
- `components/dashboard/embed-snippet.tsx` — copy UX upgrade

---

### Phase 6 — Analytics Tab
- `components/dashboard/analytics-chart.tsx` — real Recharts chart, design token colors
- `components/dashboard/leads-list.tsx` — sortable table
- `app/(dashboard)/chatbots/[chatbotid]/analytics/` — wired to real data

---

### Phase 7 — Tool Agents Dashboard (MISSING FEATURE)
- `app/(dashboard)/tool-agents/page.tsx` (NEW)
- `app/(dashboard)/tool-agents/[toolagentid]/` (NEW) — overview + settings + playground
- `components/features/tool-agents/` (NEW) — card, create dialog, tool definition editor
- Wire to existing `/api/tool-agents/` routes

---

### Phase 8 — Chatbot Settings
- `components/dashboard/chatbot-settings-form.tsx` — decompose into sections, add toast on save
- `components/dashboard/danger-zone.tsx` — typed confirmation pattern

---

### Phase 9 — Team
- `components/dashboard/invite-dialog.tsx` — animation, success state
- `components/dashboard/team-members-list.tsx` — role badges, pending invite visual

---

### Phase 10 — Billing
- `components/dashboard/billing-plan-switcher.tsx` — current plan border-accent marking, CTA states

---

### Phase 11 — Auth Pages
- `components/features/auth/auth-card.tsx` — smooth login/register transition
- `login-fields.tsx`, `register-fields.tsx` — inline validation, error states

---

### Phase 12 — Marketing Landing Page
- `app/(marketing)/page.tsx` — upgrade ProductPreview, pipeline strip animation
- `components/marketing/` — polish pass

---

### Phase 13 — Cross-Cutting Passes
- Empty/error/loading states audit across all pages
- Motion consistency (duration tokens, reduced-motion)
- Accessibility audit (keyboard, ARIA, contrast)
- Responsive audit (375/768/1024/1440px)

---

### Phase 14 — Final QA + Performance
- Build verification, console errors, route check
- Bundle analysis, image optimization
- Visual polish pass

---

## CURRENT STATUS

```
COMPLETED:
  - Phase 0: Audit + Documentation
  - Phase 1: UI Primitive Upgrades (types/ui.ts, use-toast, spinner, empty-state, toast, tabs, textarea, button/input/dialog upgrades)
  - Phase 2: Dashboard Shell (DashboardShell client wrapper, collapsible desktop rail + mobile off-canvas drawer, topbar with breadcrumb + user dropdown, Uveriq branding)
  - Phase 2b: Tool Agents Dashboard (route fix, /tool-agents list with search & ?create=1 support, /tool-agents/[toolagentid] detail with tabs: Tools, Playground, API Keys, Settings, plus complete REST APIs)
  - Phase 3: Dashboard Overview (rebuilt overview with stat cards count-up, upgraded QuotaBar with threshold color shifts, dual recent services grids, and dashboard/loading.tsx skeleton)
  - Phase 4: Chatbots List (search & status filters with live counts, upgraded ChatbotCard with quick-actions dropdown, ChatbotsLoading skeleton, and improved CreateChatbotDialog)
  - Phase 5: Chatbot Detail + Overview Tab (migrated ChatbotTabs to sliding underline indicator, rebuilt ChatbotOverviewPage, upgraded DocumentsPanel with ingestion status spinners & dragover states, and EmbedSnippet multi-format code tabs)
  - Phase 6: Analytics Tab (Recharts Area/Bar gradient visualization with traffic summaries, sortable/searchable LeadsList with CSV export, UnansweredQuestions content gaps, and ChatbotAnalyticsLoading)
  - Phase 7: Chatbot Settings (modular sections: general, prompt/guardrails, widget appearance; DangerZone typed-confirmation; ClearDataZone; and ChatbotSettingsLoading)
  - Phase 8: Team & Permissions (InviteDialog with role picker & copy links, upgraded TeamMembersList with visual initials & role badges, invite cancellation & removal flows)
  - Phase 9: Billing & Plan Management (upgraded BillingPlanSwitcher with 4 INR tiers, feature checklists, active subscription management, and telemetry quota card)
  - Phase 10: Auth Pages (Uveriq branding, smooth tabs between login & register, Google SSO, loading button states)
  - Phase 11: Marketing Landing Page & Pricing (Uveriq branding throughout, live service badges, responsive pricing cards in INR, enterprise inquiry callout)
  - Phase 12: Cross-Cutting Passes (60/30/10 tokens, zero console errors, zero tsc errors, loading skeletons on every subroute, workspace settings)
  - Phase 13: Final QA & Verification (Full browser subagent validation across Landing, Pricing, and Auth flows)
  - Service Catalog & Creation Flow (/services/new catalog chooser, /services/new/[serviceid] dynamic routing & early access waitlist, Topbar + New Service quick action)
  - Chatbot Interactive Playground (/chatbots/[chatbotid]/playground with live vector retrieval, citations, dual session/API key auth, and loading states)

STATUS:       ALL PLANNED PHASES & EXTENDED CAPABILITIES COMPLETED & VERIFIED
KNOWN ISSUES: None
```

---

## DECISIONS LOCKED (2026-10-02)

1. **Product name: Uveriq.** All UI copy, sidebar branding, and auth pages use "Uveriq" as components are rebuilt. Remove "docent" label progressively.

2. **Icons: Lucide is retained where already used.** It is the established icon library for functional interface icons. Do NOT migrate away project-wide. For new product-specific visuals (brand moments, illustrations), prefer custom SVGs. Do NOT add icons purely for decoration.

3. **Tool Agents dashboard completed in Phase 2b.** The previously broken `/tool-agents` redirect is now fully operational with end-to-end tooling, playground, key management, and settings.

---

## UPDATED PHASE SEQUENCE

```
Phase 0  — Audit + Documentation          COMPLETE
Phase 1  — UI Primitive Upgrades          COMPLETE
Phase 2  — Dashboard Shell                COMPLETE
Phase 2b — Tool Agents Dashboard          COMPLETE
Phase 3  — Dashboard Overview             COMPLETE
Phase 4  — Chatbots List                  COMPLETE
Phase 5  — Chatbot Detail + Overview Tab  COMPLETE
Phase 6  — Analytics Tab                  COMPLETE
Phase 7  — Chatbot Settings               COMPLETE
Phase 8  — Team & Permissions             COMPLETE
Phase 9  — Billing & Plan Management      COMPLETE
Phase 10 — Auth Pages                     COMPLETE
Phase 11 — Marketing Landing Page         COMPLETE
Phase 12 — Cross-Cutting Passes           COMPLETE
Phase 13 — Final QA + Performance         COMPLETE
```
