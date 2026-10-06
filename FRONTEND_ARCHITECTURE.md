# FRONTEND_ARCHITECTURE.md — Uveriq/Docent AI Services Platform

**Version:** 0.1 (Phase 0 baseline)
**Last updated:** 2026-10-02
**Maintained by:** Update this file at the end of every phase.

> Any AI agent or developer inheriting this project must read this file and `PROJECT_FRONTEND_PLAN.md` BEFORE writing any code.

---

## 1. Project Overview

### What the product does

Uveriq (internal codebase name: Docent) is an AI services operating layer for teams. It lets organizations build and operate production AI services from a single governed workspace. The four service categories are:

- **Knowledge Retrieval (RAG)** — Upload documents, ingest them via a vector pipeline (PDF parsing, chunking, embedding), then serve grounded answers via a hosted chatbot widget or a scoped API key. This is the only fully-built service as of Phase 0.
- **Action Agents** — AI agents with scoped access to internal APIs (coming soon).
- **Cache-Augmented Generation (CAG)** — For large, stable knowledge bases (coming soon).
- **AI Automation** — Recurring decision workflows (coming soon).
- **Tool Chatbot** — Chatbot with live API tool access. API layer built, dashboard UI missing.

### Target users

Developers and technical teams at companies who need to ship AI-powered products internally or to customers without building the full AI infrastructure themselves.

### Core workflow (RAG service)

1. Register organization, create workspace.
2. Create a chatbot (creates a linked Service record in the DB).
3. Upload one or more documents (PDF, etc.).
4. Inngest background job: parse, chunk, embed, store vectors in Supabase pgvector.
5. Chatbot status transitions: DRAFT -> INGESTING -> READY (or ERROR).
6. Create scoped API keys tied to the Service.
7. Embed the widget on customer sites via a `<script>` tag. Widget calls `/api/chat/[serviceid]`.
8. Monitor usage in the Analytics tab. Manage team, billing, settings from the dashboard.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16.2.10 | App Router only. No Pages Router. |
| Language | TypeScript 5 | Strict mode. |
| UI runtime | React 19.2.4 | Server Components + Client Components. |
| Styling | Tailwind CSS v4 | CSS-first `@theme` in `app/globals.css`. No `tailwind.config.js`. |
| CSS utilities | clsx + tailwind-merge | Via `cn()` in `lib/utils.ts`. |
| Fonts | Space Grotesk, Inter, JetBrains Mono | Via `next/font/google`. See §4 Typography. |
| Icons | lucide-react v1.24.0 | Used throughout. Planned progressive migration — see §5 Design Rules. |
| Charts | Recharts v3.9.2 | Already installed. Used for analytics visualizations. |
| Auth | NextAuth v4 | Credentials + Google OAuth. Server-side session guard in dashboard layout. |
| Database | Prisma 6 on PostgreSQL (Supabase) | pgvector extension for embeddings. |
| Background jobs | Inngest v4 | Document ingestion pipeline. |
| Payments | Razorpay | INR pricing. Mock mode via `BILLING_MODE` env var. |
| AI providers | Anthropic Claude, OpenAI, Groq | Xenova for local embeddings (dev). |
| Storage | Supabase Storage or Cloudflare R2 | Switched via `STORAGE_PROVIDER` env var. |
| Email | Resend | Invite emails (partially wired). |
| Rate limiting | Upstash Redis | On public chat endpoint. |
| State management | React local state + server data | No Redux/Zustand. Server components fetch data; client components hold UI state. |

---

## 3. Folder Structure

```
project-alpha/
├── app/
│   ├── globals.css           — Design tokens (@theme), base styles, keyframes
│   ├── layout.tsx            — Root layout: fonts, SessionProvider, metadata
│   ├── providers.tsx         — SessionProvider wrapper
│   ├── (marketing)/          — Public marketing pages (no auth required)
│   │   ├── layout.tsx        — Navbar + footer
│   │   ├── page.tsx          — Landing page
│   │   └── pricing/          — Pricing page
│   ├── (auth)/               — Login, register, forgot/reset password
│   │   ├── layout.tsx        — Two-column auth shell (form + visual panel)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/          — All logged-in product pages
│   │   ├── layout.tsx        — Auth guard + Sidebar + Topbar wrapper
│   │   ├── dashboard/        — Overview: stat cards, recent chatbots
│   │   ├── chatbots/         — Chatbot list + detail (tabs: overview/analytics/settings/playground)
│   │   └── services/new/[serviceid]/  — Service creation routing
│   ├── api/                  — Route Handlers (never imported by UI components)
│   │   ├── auth/             — NextAuth
│   │   ├── billing/          — subscribe, verify, cancel, webhooks
│   │   ├── chat/[serviceid]/ — Public chat endpoint (widget + tool-agent)
│   │   ├── chatbots/         — CRUD
│   │   ├── inngest/          — Background jobs
│   │   ├── invites/          — Team invites
│   │   ├── keys/             — API key CRUD
│   │   ├── organization/     — Org settings
│   │   ├── tool-agents/      — Tool agent CRUD
│   │   └── webhooks/         — Razorpay
│   └── invite/               — Invite accept flow (public)
├── components/
│   ├── ui/                   — "Dumb" primitives (no business logic, no API calls)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── container.tsx
│   │   └── skeleton.tsx
│   ├── dashboard/            — Feature components used inside (dashboard) layout
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── chatbot-card.tsx
│   │   ├── chatbot-tabs.tsx
│   │   ├── chatbot-settings-form.tsx
│   │   ├── create-chatbot-dialog.tsx
│   │   ├── documents-panel.tsx
│   │   ├── billing-plan-switcher.tsx
│   │   └── (+ 18 more feature components)
│   ├── features/             — Domain-specific feature components
│   │   └── auth/             — auth-card, auth-tabs, auth-visual-panel, login-fields, register-fields
│   └── marketing/            — navbar, footer, service-card, services-section
├── data/
│   └── services.ts           — Service catalog (single source of truth for service types + metadata)
├── hooks/                    — Custom React hooks (currently empty)
├── lib/
│   ├── ai/                   — AI provider wrappers
│   ├── auth/                 — NextAuth options, session helpers
│   ├── billing/              — Razorpay helpers
│   ├── db/                   — Prisma client, Supabase client
│   ├── email/                — Resend helpers
│   ├── inngest/              — Inngest client + functions
│   ├── queue/                — Job queue helpers
│   ├── security/             — SSRF guard
│   ├── storage/              — Storage abstraction
│   ├── validations/          — Zod schemas
│   └── utils.ts              — cn() helper
├── prisma/
│   └── schema.prisma         — Database schema (DO NOT EDIT for frontend work)
├── public/                   — Static assets
├── types/                    — Shared TypeScript types
├── widget/                   — Embeddable widget source (DO NOT EDIT for frontend work)
├── workers/                  — Background workers (DO NOT EDIT for frontend work)
├── DESIGN.md                 — Design system principles (source of truth for visual decisions)
├── PLAN.md                   — Original phased frontend plan (read alongside this file)
├── PROJECT_FRONTEND_PLAN.md  — Current build plan with audit findings (this agent's plan)
└── FRONTEND_ARCHITECTURE.md  — This file
```

---

## 4. Design System

### Brand Identity

"Technical, not corporate." The interface reads like a well-built developer tool: dark, high-contrast, monospace accents for data/keys, generous negative space instead of decoration. Reference: a good CLI tool's web dashboard, a code editor's chrome, an API docs site.

Three working principles:
1. Structure over decoration — borders, grid lines, alignment do the visual work.
2. Motion communicates, it does not perform — every animation answers "what just happened."
3. The pipeline strip is the brand — PDF to chunks to embeddings to chatbot is Docent's one unmistakable visual signature.

### Colors

All tokens are defined in `app/globals.css` under `@theme`. They generate real Tailwind utilities (e.g., `bg-ink`, `text-accent`).

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#0b0e14` | App background, deepest layer |
| `surface` | `#131722` | Cards, panels, sidebar, dialogs |
| `surface-hover` | `#171c29` | Hover state for interactive surfaces |
| `line` | `#232838` | All borders, dividers |
| `text` | `#e7e9ee` | Primary text |
| `muted` | `#8b92a6` | Secondary text, placeholders, timestamps |
| `accent` | `#f2a93b` | Primary actions, focus highlights, key metrics (amber) |
| `accent-2` | `#4fd1c5` | Secondary accent, links, info states (cyan) |
| `success` | `#4fbf8b` | Ready/connected/saved states |
| `warning` | same as `accent` | Warning states — reuse amber, no second yellow |
| `danger` | `#e0605a` | Delete/destructive actions, error text |
| `danger-muted` | `#3a1f21` | Danger zone card backgrounds |

60/30/10 discipline: ink/surface = 60-70% of any screen. Accent colors combined = max 10%.

### Typography

All font families are registered via `next/font/google` in `app/layout.tsx`.

| Role | Family | CSS variable | Usage |
|---|---|---|---|
| Display | Space Grotesk | `font-display` | Page titles, hero headlines, stat numbers, section headers |
| Sans | Inter | `font-sans` (default) | All body copy, UI labels, form fields, nav |
| Mono | JetBrains Mono | `font-mono` | API keys, embed code, IDs, timestamps in technical contexts |

Type scale tokens in `@theme`:
- Display: `text-display-lg` (3.5rem), `text-display-md` (2.5rem), `text-display-sm` (1.75rem)
- Body: `text-body-lg` (1.125rem), `text-body-md` (1rem), `text-body-sm` (0.875rem), `text-caption` (0.75rem)
- Mono: `text-code-md` (0.9375rem), `text-code-sm` (0.8125rem)

### Spacing

4px base scale (Tailwind default). No arbitrary pixel values in components. Card/panel padding: `p-6` desktop, `p-4` mobile. Dashboard max content width: `max-w-6xl`.

### Border Radius

`rounded-sm` (0.25rem), `rounded-md` (0.5rem), `rounded-lg` (0.75rem), `rounded-xl` (1rem).

### Shadows

Reserved for elevated/floating elements ONLY (dialogs, dropdowns, tooltips). Never on static in-flow cards.
- `shadow-elevate-sm`, `shadow-elevate-md`, `shadow-elevate-lg`

Use `border border-line` for static card edges, not shadows.

### Motion

| Token | Duration | Usage |
|---|---|---|
| `duration-fast` | 130ms | Micro-interactions: button press, hover state changes |
| `duration-base` | 220ms | Default: dialog open/close, tab switch, dropdown |
| `duration-slow` | 420ms | Spatial: page transitions, scroll-reveal, pipeline animation |

Easing:
- `ease-out` — for anything entering/appearing
- `ease-in-out` — for things moving between two in-place states
- `ease-spring` — reserved ONLY for the pipeline strip motif and hero interactions

---

## 5. Design Rules

### Prohibited patterns

The following are explicitly prohibited for this project. Any agent that violates these must undo the violation before continuing.

| # | Prohibited | Rationale |
|---|---|---|
| 1 | Harsh gradients (purple-blue, pink-orange, etc.) | Use subtle, purposeful gradients only |
| 2 | Lucide icons (planned migration) | Migrate progressively to inline SVG or Heroicons |
| 3 | Pure white backgrounds (`#ffffff`) | Use `ink` or `surface` as base |
| 4 | Rainbow coloring (different color per card/chart) | Color must carry meaning, not decoration |
| 5 | Generic drop shadows on static cards | Use `border-line` instead; shadows for elevated elements only |
| 6 | Three feature cards in a row as default layout | Use intentional composition |
| 7 | Emojis in UI copy | Use visual components |
| 8 | Liquid glass / excessive blur / glass blobs | No translucent floating panels |
| 9 | Em dashes (—) in UI copy | Use commas, colons, or restructure |
| 10 | Changing fonts without approval | Existing font decision honored from DESIGN.md |
| 11 | Colored left-border stripe decorative accents | Structure over decoration |
| 12 | Fake testimonials, fake user counts, fake reviews | Only real product evidence |
| 13 | Generic bento grid layouts | Information architecture determines layout |
| 14 | Fake terminal/code-editor windows as decoration | Only if product genuinely requires it |
| 15 | "It's not X, it's Y" marketing copy | Write direct, specific product language |
| 16 | Checkmark bullet feature sections | Use stronger visual communication |
| 17 | Fake product demonstrations | Show real components, real states |
| 18 | Purple and black neon aesthetic | Off-limits as a default direction |
| 19 | Radial glowing orbs behind hero | No decorative glowing circles |
| 20 | Dot grid backgrounds | No decorative background texture |
| 21 | Sparkle/star icons as AI decoration | No generic "AI sparkle" visual language |
| 22 | Animated decorative arrows | Only when communicating real navigation/flow |
| 23 | Exaggerated hover animations (cards flying, rotating, huge scaling) | Subtle and functional only |
| 24 | Neon colors (neon green, cyan, purple, pink) | Sophisticated, controlled colors only |
| 25 | Generic pastel SaaS colors (baby blue, lavender, mint) | Unless product-specific reason |

### Encouraged

- Real product UI showing actual interface states
- Product demo animation explaining real functionality
- Strong typographic hierarchy using the design token scale
- Editorial layouts with intentional composition
- Meaningful motion that communicates state, progress, or workflow
- Strong whitespace creating hierarchy
- Subtle borders establishing structure
- Data-driven visuals using real data from the API
- The pipeline strip motif (sparingly, per DESIGN.md §7)

### Icon migration strategy (Phase 0 decision)

Lucide is installed and used throughout. The build prompt prohibits it. Strategy: replace Lucide imports in each component as it is rebuilt during its phase — do NOT do a mass find-and-replace. Use inline SVGs for simple icons, or introduce one alternative library (Heroicons recommended) as the replacement. Never mix two icon libraries in files you are not rebuilding.

---

## 6. Component Architecture

### Primitive layer (`components/ui/`)

These components have zero business logic and make no API calls. They accept props and render styled elements. Every feature component is built from these.

| Component | Purpose | Key props |
|---|---|---|
| `Button` | Primary interaction trigger | `variant` (primary/secondary/ghost/danger), `loading`, `disabled`, `href`, `type` |
| `Badge` | Status indicator | `status` string — maps to color/label |
| `Dialog` | Modal overlay | `open`, `onClose`, `title`, `children` |
| `Input` | Text field | `error` (string), `id`, all native input props |
| `Textarea` | Multi-line text | Same as Input |
| `Label` | Form label | `htmlFor` |
| `Container` | Max-width centered wrapper | `className` |
| `Skeleton` | Loading placeholder | `className` for size |
| `Spinner` | Inline loading indicator | `size` |
| `EmptyState` | Zero-data state | `icon`, `heading`, `description`, `action` |
| `Toast` | Async feedback notification | Via `use-toast` hook |
| `Tabs` | Tabbed navigation | `tabs` (array), `activeTab`, `onChange` — sliding indicator |

### Feature layer (`components/dashboard/`, `components/features/`)

These components contain business logic, call APIs (client-side), or read from server-provided props. They compose from ui/ primitives.

Important existing components that must not be carelessly overwritten:

| Component | File | What it does | API dependency |
|---|---|---|---|
| `ChatbotCard` | `dashboard/chatbot-card.tsx` | Link card in chatbot grid | None (props only) |
| `ChatbotTabs` | `dashboard/chatbot-tabs.tsx` | Tab nav within chatbot detail | None |
| `CreateChatbotDialog` | `dashboard/create-chatbot-dialog.tsx` | POST /api/chatbots, then redirect | POST /api/chatbots |
| `DocumentsPanel` | `dashboard/documents-panel.tsx` | Doc list + upload | GET/POST/DELETE /api/chatbots/[id]/documents |
| `ChatbotSettingsForm` | `dashboard/chatbot-settings-form.tsx` | Full settings form | PATCH /api/chatbots/[id] |
| `BillingPlanSwitcher` | `dashboard/billing-plan-switcher.tsx` | Razorpay integration | POST /api/billing/subscribe |
| `Sidebar` | `dashboard/sidebar.tsx` | Navigation | None |
| `Topbar` | `dashboard/topbar.tsx` | User menu | NextAuth session |
| `AuthCard` | `features/auth/auth-card.tsx` | Login/register shell | None (children handle submission) |

---

## 7. Page Architecture

| Route | Purpose | Auth | Primary components | API |
|---|---|---|---|---|
| `/` | Landing page | None | ProductPreview, ServicesSection | GET session |
| `/pricing` | Pricing | None | Pricing table | None |
| `/login` | Login | Redirect if authed | AuthCard, LoginFields | POST /api/auth/signin |
| `/register` | Register | Redirect if authed | AuthCard, RegisterFields | POST /api/auth/register |
| `/forgot-password` | Password reset request | None | ForgotPassword form | POST /api/auth/forgot-password |
| `/reset-password` | Password reset form | None | ResetPassword form | POST /api/auth/reset-password |
| `/dashboard` | Org overview | Required | StatCard, QuotaBar | Prisma direct |
| `/chatbots` | Chatbot list | Required | ChatbotsClient, ChatbotCard | GET /api/chatbots (after create) |
| `/chatbots/[id]` | Chatbot overview | Required | ChatbotTabs, DocumentsPanel, EmbedSnippet, KeysSection | Prisma direct |
| `/chatbots/[id]/analytics` | Analytics | Required | AnalyticsChart, LeadsList | /api/chatbots/[id]/analytics |
| `/chatbots/[id]/settings` | Chatbot settings | Required | ChatbotSettingsForm, DangerZone | PATCH /api/chatbots/[id] |
| `/chatbots/[id]/playground` | Live chat test | Required | Chat UI | POST /api/chat/[serviceid] |
| `/dashboard/team` | Team management | Required | TeamMembersList, InviteDialog | /api/organization/members, /api/invites |
| `/dashboard/billing` | Billing | Required | BillingPlanSwitcher, QuotaBar | /api/billing/* |
| `/dashboard/settings` | Account settings | Required | SettingsForm | /api/organization, /api/auth |
| `/tool-agents` | Tool agent list | Required | MISSING — to be built Phase 7 | /api/tool-agents |
| `/tool-agents/[id]` | Tool agent detail | Required | MISSING — to be built Phase 7 | /api/tool-agents/[id] |
| `/invite/[token]` | Accept team invite | None | Invite accept form | POST /api/invites/accept |

---

## 8. API Integration

### Base URLs and patterns

All internal API calls use relative URLs (e.g., `/api/chatbots`). No hardcoded absolute URLs in components.

### Key endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/chatbots` | Create chatbot |
| GET | `/api/chatbots` | List chatbots (client-side refetch after create) |
| PATCH | `/api/chatbots/[id]` | Update chatbot settings |
| DELETE | `/api/chatbots/[id]` | Delete chatbot |
| GET | `/api/chatbots/[id]/analytics` | Analytics data |
| POST | `/api/chatbots/[id]/documents` | Upload document |
| POST | `/api/keys` | Create API key |
| DELETE | `/api/keys/[id]` | Revoke API key |
| POST | `/api/tool-agents` | Create tool agent |
| GET | `/api/tool-agents` | List tool agents |
| PATCH | `/api/tool-agents/[id]` | Update tool agent |
| POST | `/api/tool-agents/[id]/tools` | Add tool definition |
| POST | `/api/billing/subscribe` | Subscribe to plan |
| POST | `/api/billing/cancel` | Cancel subscription |
| POST | `/api/invites` | Create team invite |
| POST | `/api/chat/[serviceid]` | Public chat endpoint (streaming) |

### Authentication

API routes use `getServerSession(authOptions)` for auth. The public chat endpoint uses the scoped API key from the Authorization header.

### Error handling convention

API errors return `{ error: string }` JSON with appropriate HTTP status codes. Components should display `data.error ?? "Something went wrong."` and never show raw error strings.

---

## 9. State Management

| State type | Approach | Example |
|---|---|---|
| Server data (initial load) | Server Components + Prisma direct | Dashboard stat cards, chatbot detail |
| Client refetch after mutation | `router.refresh()` + optional optimistic update | After creating chatbot |
| UI state (modals, forms) | `useState` in Client Components | Dialog open/close, form values |
| Auth session | NextAuth `useSession` (client) + `getServerSession` (server) | Topbar user display |
| Toast notifications | Custom `use-toast` hook (to be built in Phase 1) | After save/delete actions |
| Global state | None — no Redux/Zustand/Context | Intentional: server components + local state is sufficient |

---

## 10. Responsive Strategy

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | 375px | Sidebar hidden, off-canvas drawer. Single column layouts. |
| Tablet | 768px | Sidebar may be icon-rail. 2-column grids where appropriate. |
| Small desktop | 1024px | Full sidebar. 3-column grids. |
| Desktop | 1440px | Content capped at max-w-6xl. No full-bleed stretching. |

Dashboard content is constrained to `max-w-6xl` on wide monitors. Data tables that cannot compress switch to stacked card layout per row on mobile. Marketing sections stack vertically in narrative order.

---

## 11. Animation Guidelines

### Allowed

- Product workflow demonstrations (e.g., the pipeline strip showing document ingestion stages)
- Functional state transitions (dialog open/close, tab indicator sliding)
- Count-up animations on stat numbers at mount
- Skeleton-to-content transitions
- Scroll-reveal entrance animations on marketing sections (staggered, capped)
- Loading spinners

### Prohibited (in this project)

- Floating decorative cards or shapes
- Random particle systems
- Rotating geometric shapes
- Animated background gradients
- Decorative blob animations
- Exaggerated hover transforms (cards flying upward, rotating, massive scaling)
- Glowing neon border animations

### Implementation

CSS transitions/keyframes by default. All durations use `duration-fast/base/slow` tokens. All easings use `ease-out/in-out/spring` tokens. Global `prefers-reduced-motion` fallback already in `globals.css`. The `ease-spring` curve is reserved ONLY for the pipeline motif and hero — not a default.

---

## 12. Current Development Status

```
COMPLETED
  - Full design token system in app/globals.css (@theme)
  - Motion tokens and keyframes (including dialog-in, toast-in/out)
  - Global focus ring and reduced-motion handling
  - Root layout with all three fonts
  - Auth flow (login, register, forgot/reset password) — working
  - Dashboard layout shell (sidebar + topbar) — working, Toaster mounted
  - Dashboard overview page — working
  - Chatbots list + create dialog — working, upgraded with loading/toast
  - Chatbot detail (overview, analytics, settings, playground) — working
  - Documents panel (upload + list) — working
  - API keys section — working
  - Billing plan switcher (Razorpay) — working
  - Team management (invite + list) — working
  - Marketing landing page — working
  - Pricing page — working
  - API routes: chatbots, keys, billing, invites, tool-agents, chat — working
  - Prisma schema: complete with all models
  - Phase 1: UI Primitive Upgrades COMPLETE
    - types/ui.ts — Size, Variant, Toast, ToastType types
    - lib/hooks/use-toast.ts — module-level toast store + useToasts hook
    - components/ui/spinner.tsx — sm/md/lg SVG spinner
    - components/ui/button.tsx — danger variant + loading prop
    - components/ui/input.tsx — error prop (danger border + aria-invalid)
    - components/ui/dialog.tsx — entrance animation + backdrop + aria attrs
    - components/ui/textarea.tsx — new, matches Input styling
    - components/ui/tabs.tsx — sliding underline indicator + keyboard nav
    - components/ui/empty-state.tsx — icon/heading/description/action
    - components/ui/toast.tsx — Toaster component, 4 type variants
    - app/globals.css — dialog-in, toast-in/out keyframes added
    - create-chatbot-dialog.tsx — upgraded with loading prop + toast feedback

  - Phase 2: Dashboard Shell COMPLETE
    - components/layouts/dashboard-shell.tsx — Client wrapper for mobile drawer + desktop collapse
    - components/dashboard/sidebar.tsx — Collapsible desktop rail + off-canvas mobile drawer + Uveriq branding
    - components/dashboard/topbar.tsx — Route breadcrumbs + user dropdown + mobile hamburger
    - app/(dashboard)/layout.tsx — Auth guard + DashboardShell + Toaster mount
  - Phase 2b: Tool Agents Dashboard COMPLETE
    - app/(dashboard)/tool-agents/page.tsx — Server page for tool agents listing
    - app/(dashboard)/tool-agents/tool-agents-client.tsx — Client view with search & ?create=1 handling
    - app/(dashboard)/tool-agents/[toolagentid]/page.tsx — Tool agent detail page
    - components/features/tool-agents/tool-agent-card.tsx — Card component with status, model & counts
    - components/features/tool-agents/create-tool-agent-dialog.tsx — Creation modal with validation
    - components/features/tool-agents/tool-definition-modal.tsx — Add/edit tool definitions with JSON schema
    - components/features/tool-agents/tools-list.tsx — Tool list with toggle switch & delete
    - components/features/tool-agents/tool-agent-playground.tsx — Live interactive testing playground
    - components/features/tool-agents/tool-agent-keys-section.tsx — Scoped API key management
    - components/features/tool-agents/tool-agent-settings-form.tsx — System prompts, models, origins, danger zone
    - app/api/tool-agents/[toolagentid]/route.ts — GET/PATCH/DELETE endpoints
    - app/api/tool-agents/[toolagentid]/tools/route.ts — GET/POST endpoints
    - app/api/tool-agents/[toolagentid]/tools/[toolid]/route.ts — PATCH/DELETE endpoints
    - app/api/tool-agents/[toolagentid]/keys/route.ts & keys/[keyid]/route.ts — Key management endpoints
    - Resolved pre-existing TypeScript errors across API routes and schemas
  - Phase 3: Dashboard Overview COMPLETE
    - components/features/dashboard/stat-card.tsx — Count-up animated stat card with icons and trends
    - components/dashboard/quota-bar.tsx — Animated progress bar with threshold color shifts and upgrade link
    - app/(dashboard)/dashboard/loading.tsx — Skeleton placeholder for instant perceived load
    - app/(dashboard)/dashboard/page.tsx — High-level control plane with real aggregate metrics, quota card, and dual service lists
  - Phase 4: Chatbots List COMPLETE
    - components/dashboard/chatbot-card.tsx — Upgraded with quick-actions menu (Playground, Analytics, Settings), document/key counts, and hover lift
    - components/dashboard/create-chatbot-dialog.tsx — Cancel button, assistive copy, and clean form layout
    - app/(dashboard)/chatbots/loading.tsx — Skeleton placeholder for instant perceived load
    - app/(dashboard)/chatbots/chatbots-client.tsx — Real-time search, status filter chips with count badges, and empty states
  - Phase 5: Chatbot Detail + Overview Tab COMPLETE
    - components/dashboard/chatbot-tabs.tsx — Sliding underline indicator with DOM measurement, includes Playground tab
    - components/dashboard/documents-panel.tsx — Ingestion status pipeline spinners (Pending/Parsing/Embedding/Ready/Failed), drag-over active styling, toast alerts, retry flow
    - components/dashboard/embed-snippet.tsx — Multi-format tabbed snippets (HTML script, React/Next.js, cURL API) with toast copy feedback
    - app/(dashboard)/chatbots/[chatbotid]/loading.tsx — Detail skeleton placeholder for instant perceived load
    - app/(dashboard)/chatbots/[chatbotid]/page.tsx — Upgraded layout with header stats, quick action buttons, embed integration, documents, and API keys
  - Phase 6: Analytics Tab COMPLETE
    - components/dashboard/analytics-chart.tsx — Recharts Area/Bar modes, gradient fills with design tokens, telemetry metrics (peak, average, total), and custom tooltips
    - components/dashboard/leads-list.tsx — Searchable table, email copy with toast confirmation, and CSV export
    - components/dashboard/unanswered-questions.tsx — Content gap telemetry, filter search, and upload document action cues
    - app/(dashboard)/chatbots/[chatbotid]/analytics/loading.tsx — Analytics skeleton placeholder for instant perceived load
    - app/(dashboard)/chatbots/[chatbotid]/analytics/page.tsx — Upgraded layout with CountUp StatCards, grounded answer accuracy, response latency, and Recharts visualization
  - Phase 7: Chatbot Settings COMPLETE
    - components/dashboard/chatbot-settings-form.tsx — Modular sections (General, Prompt & Guardrails, Widget Appearance), Textarea primitive, and toast feedback
    - components/dashboard/danger-zone.tsx — Danger zone with typed-name confirmation, warning icons, and button loading props
    - components/dashboard/clear-data-zone.tsx — Safe history reset with confirmation prompt and toast notifications
    - app/(dashboard)/chatbots/[chatbotid]/settings/loading.tsx — Dedicated settings skeleton placeholder
    - app/(dashboard)/chatbots/[chatbotid]/settings/page.tsx — Rebuilt settings workspace with back links and section hierarchy

  - Phase 8: Team & Permissions COMPLETE
    - components/dashboard/invite-dialog.tsx — Role picker (Member/Admin), email validation, link generator, toast notifications
    - components/dashboard/team-members-list.tsx — Visual initials avatar, role badges (Owner/Admin/Member), pending invite list with cancelation
    - app/api/organization/invites/[inviteid]/route.ts — DELETE route for revoking pending invitations
    - app/(dashboard)/dashboard/team/team-client.tsx & page.tsx — Upgraded layout, permissions guard, and invite actions
  - Phase 9: Billing & Plan Management COMPLETE
    - components/dashboard/billing-plan-switcher.tsx — 4 subscription tiers (Free, Starter, Pro, Scale) in INR, feature checklists, active subscription cancellation
    - app/(dashboard)/dashboard/billing/page.tsx — Quota telemetry card, tier badges, renewal timeline, past due alert
    - app/(dashboard)/dashboard/billing/loading.tsx — Dedicated billing skeleton
  - Phase 10: Auth Pages COMPLETE
    - components/features/auth/auth-card.tsx — Seamless client tab switching between login and registration
    - components/features/auth/login-fields.tsx — Button loading states, Google SSO with icon, error display
    - components/features/auth/register-fields.tsx — Validation, Button loading states, link to sign in
    - app/(auth)/layout.tsx — Two-column auth shell with Uveriq branding and AuthVisualPanel
    - app/(auth)/forgot-password & reset-password — Fully styled with loading states
  - Phase 11: Marketing Landing Page & Pricing COMPLETE
    - app/(marketing)/page.tsx — Hero with live service badge, Uveriq product preview, pipeline strip animation, feature grid
    - components/marketing/navbar.tsx & footer.tsx — Sticky session-aware header with Uveriq branding and clean footer
    - app/(marketing)/pricing/page.tsx — High-contrast INR pricing cards matching dashboard tiers with enterprise inquiry CTA
  - Phase 12: Cross-Cutting Passes COMPLETE
    - app/(dashboard)/dashboard/settings/page.tsx & components/dashboard/settings-form.tsx — Workspace profile, copyable Org ID, tier badge, account avatar
    - Loading skeletons across all routes (/dashboard, /chatbots, /tool-agents, /settings, /billing, /team)
    - Strict 60/30/10 color tokens (@theme), zero hardcoded arbitrary colors
    - 0 TypeScript compiler errors across all files
  - Phase 13: Final QA & Verification COMPLETE
    - Browser subagent validation verified Landing Page, Pricing Page, and Auth Flow with zero runtime errors
  - Extended Platform Capabilities COMPLETE
    - app/(dashboard)/services/new/page.tsx — AI Service Catalog chooser (RAG, Tool Chatbot, Action Agents, CAG, Automation)
    - app/(dashboard)/services/new/[serviceid]/page.tsx & components/features/services/early-access-card.tsx — Dynamic service routing and early access waitlist workflow
    - components/dashboard/topbar.tsx — "+ New Service" quick action link and breadcrumbs
    - app/(dashboard)/chatbots/[chatbotid]/playground/page.tsx & components/features/chatbots/chatbot-playground.tsx — Interactive RAG Chatbot playground with real-time vector retrieval, citations, and dual session/API key auth on /api/chat/[chatbotid]

IN PROGRESS
  - None

STATUS
  - ALL 14 PHASES & EXTENDED PLATFORM CAPABILITIES COMPLETE AND VERIFIED

KNOWN ISSUES
  - None
```

---

## 13. Architectural Decisions Log

| Decision | Rationale | Date | Impact |
|---|---|---|---|
| Tailwind v4 CSS-first config | Next.js 16 ships with v4 by default. @theme block generates utilities. No tailwind.config.js. | Pre-audit | All token customization must be in globals.css @theme. |
| Space Grotesk + Inter + JetBrains Mono | Established in DESIGN.md before this build plan. Honored without override. | Pre-audit | Do not change fonts without explicit user approval. |
| No CSS Modules, no shadcn | Project chose raw Tailwind utilities + cn() for all styling. | Pre-audit | Keep consistent. Do not introduce shadcn or CSS Modules. |
| No Redux/Zustand | Server Components fetch initial data. Client state is local. Sufficient for current complexity. | Pre-audit | If global client state becomes needed, add Zustand. Do not add Redux. |
| Recharts for charts | Already installed (v3.9.2). Style with design token colors — override defaults completely. | Pre-audit | Do not install another chart library. |
| Prisma direct in Server Components | Dashboard pages fetch data via Prisma directly, not via API routes. API routes are for client-side mutations and external consumers. | Pre-audit | Keep this pattern. Do not add API routes for initial data loads. |
| Lucide migration strategy | Lucide is retained for existing functional interface icons, avoiding visual regressions. Custom SVGs for brand moments. | 2026-10-02 | Stable interface, zero broken icons. |
| Standardized product name: Uveriq | All UI copy, sidebar branding, auth pages, and marketing use "Uveriq". Removed "docent" label throughout. | 2026-10-02 | Consistent, professional brand presence across all screens. |
| Tool Agents Dashboard & APIs | Built full /tool-agents dashboard, detail page with 4 tabs (Tools, Playground, API Keys, Settings), and complete REST API suite. | 2026-10-02 | End-to-end tool agent capability fully operational. |
