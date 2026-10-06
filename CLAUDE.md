# Project: Uveriq — GenAI Chatbot SaaS (Frontend-Only Session)

I'm building an advanced frontend for an existing, fully working full-stack SaaS product.

The backend, database, auth, billing, and API are ALL DONE and deployed — I need you to

focus exclusively on frontend/UI work in this conversation. Do not modify API routes,

Prisma schema, or business logic.

## Repo access
You have direct read/write access to this folder — it's the live local project.
Read app/, components/, and prisma/schema.prisma first before making changes.

Please read the repo structure first — especially `app/`, `components/`, and

`prisma/schema.prisma` — to understand what already exists before proposing changes.

## What the product does

Uveriq lets users upload a PDF/text document and get a custom AI chatbot (RAG-based)

with its own API key, embeddable via a JS widget on any website. Think Chatbase/DocsBot.

## Tech stack (already built, don't change)

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4

- Auth: NextAuth (Google OAuth + credentials)

- Database: Postgres (Supabase) + pgvector, via Prisma

- AI: Groq (chat) + local embeddings (free tier), swappable to OpenAI/Anthropic

- Billing: Razorpay (subscriptions)

- Background jobs: Inngest (document ingestion pipeline)

- Email: Resend

- Deployed on Vercel at [your production URL]

## Existing brand identity (feel free to elevate, not necessarily replace)

- Product name: Uveriq

- Palette: ink navy background (#0b0e14), surface (#131722), border (#232838),

  text (#e7e9ee), muted (#8b92a6), accent amber (#f2a93b), accent cyan (#4fd1c5)

- Type: Space Grotesk (display), Inter (body), JetBrains Mono (code/API keys)

- Signature motif used on the landing page: a "pipeline strip" showing

  PDF → chunks → embeddings → chatbot

## Current frontend state (functional but NOT visually advanced — this is your job)

- Marketing: landing page, pricing page

- Auth: login, register, forgot/reset password

- Dashboard: overview, chatbots list/detail (tabs: overview/analytics/settings),

  team, billing, settings

- Embeddable widget (vanilla JS, Shadow DOM) — separate from the React app, in /public/widget.js

## What "advanced frontend" means for this project

- Real motion/interaction design (not just Tailwind defaults) — micro-interactions,

  meaningful transitions, loading states that feel considered

- A genuinely distinctive visual identity, not a generic dashboard template

- Polished empty states, error states, and onboarding flow

- Better data visualization on the analytics page

- A more compelling, conversion-focused landing page

- Fully responsive, accessible (keyboard nav, focus states, ARIA where needed)

## Constraints

- Don't touch: /app/api/**, /lib/**, /prisma/**, /public/widget.js (backend logic)

- DO touch: /app/(marketing)/**, /app/(dashboard)/**, /app/(auth)/**, /components/**,

  /app/globals.css, tailwind config

- All existing API contracts must stay exactly as-is — you're restyling/restructuring

  the UI layer that CALLS these APIs, not changing what they return. I can paste specific

  endpoint request/response shapes if you need one to build against.

- Follow the file/folder structure guidance I'll give you separately for any new

  components, so it merges cleanly back into the main repo later.

Let's start with [pick where you want to begin: landing page redesign / dashboard shell

redesign / analytics visualization / etc]. 