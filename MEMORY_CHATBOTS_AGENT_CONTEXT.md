# Memory Chatbots — Agent Context Document
**Project:** Uveriq AI Platform (`project-alpha`)  
**Your task:** Implement backend logic for two new chatbot memory types:
1. **Short-term Memory** — session-scoped conversation history
2. **Persistent Memory** — cross-session, per-user long-term memory

Frontend routes, placeholder pages, and sidebar navigation are **already built**. You add the Prisma schema changes, backend logic, and replace placeholder pages with real working lists/detail pages.

---

## 1. Codebase Overview

### Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.10, App Router, React 19, TypeScript 5 |
| Database | PostgreSQL (Supabase) via Prisma 6, pgvector for embeddings |
| AI | Groq (primary chat), Anthropic/OpenAI (optional), Xenova (local embeddings) |
| Auth | NextAuth v4 — credentials + Google OAuth |
| Background jobs | Inngest v4 |
| Rate limiting | Upstash Redis |
| Styling | Tailwind CSS v4 (`@theme` in `app/globals.css`) — NO `tailwind.config.js` |

### Key env vars
```
DATABASE_URL         — Supabase pooler (pgbouncer), port 6543
GROQ_API_KEY         — chat completions
GROQ_MODEL           — "openai/gpt-oss-20b"
CHAT_PROVIDER        — "groq"
EMBEDDINGS_PROVIDER  — "local"
UPSTASH_REDIS_REST_URL / TOKEN — rate limiting
```

---

## 2. Existing Chatbot Pipeline (Simple — Full Stack)

### Prisma models (relevant excerpt)

```prisma
model Chatbot {
  id                 String         @id @default(cuid())
  orgId              String
  name               String
  systemPrompt       String         @default("You are a helpful assistant...")
  model              String         @default("claude-sonnet-4-6")
  temperature        Float          @default(0.3)
  widgetTitle        String         @default("Chat with us")
  widgetColor        String         @default("#6366f1")
  welcomeMessage     String         @default("Hi! Ask me anything about this site.")
  suggestedQuestions String?        @db.Text
  restrictToContext  Boolean        @default(true)
  leadCaptureEnabled Boolean        @default(false)
  status             ChatbotStatus  @default(READY)
  allowedOrigins     String?
  widgetPosition     String         @default("bottom-right")
  widgetTheme        String         @default("classic")
  widgetSize         String         @default("medium")
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  org                Organization   @relation(fields: [orgId], references: [id])
  conversations      Conversation[]
  documents          Document[]
  serviceId          String         @unique
  service            Service        @relation(fields: [serviceId], references: [id])
  @@index([orgId])
}

model Conversation {
  id           String    @id @default(cuid())
  chatbotId    String
  sessionId    String
  visitorEmail String?
  leadQuestion String?
  createdAt    DateTime  @default(now())
  messages     Message[]
  @@index([chatbotId, createdAt])
}

model Message {
  id              String   @id @default(cuid())
  conversationId  String
  role            String   -- "user" | "assistant"
  content         String
  wasAnswered     Boolean  @default(true)
  relatedQuestion String?
  createdAt       DateTime @default(now())
  @@index([conversationId])
}
```

### Chat endpoint: `app/api/chat/[chatbotid]/route.ts`

```
Flow:
1. Auth: API key (Bearer) or session cookie (requireOrg)
2. Rate limit check (Upstash Redis)
3. Monthly quota check (org.messagesUsedThisPeriod)
4. Parse { message, sessionId } from request body
5. Get/create Conversation by chatbotId + sessionId
6. retrieveRelevantChunks(chatbotId, message) — pgvector similarity
7. Build grounded system prompt with doc context
8. Fetch last 6 messages as history
9. generateChatCompletion(systemPrompt, history, message)
10. Persist user + assistant messages
11. Log usage to UsageLog
12. Return { reply, sessionId }
```

### Key library functions

```ts
// lib/ai/retrieve.ts
retrieveRelevantChunks(chatbotId: string, query: string): Promise<{ content: string, filename: string }[]>

// lib/ai/chat.ts
generateChatCompletion(
  systemPrompt: string,
  history: { role: "user" | "assistant", content: string }[],
  message: string
): Promise<string>

// lib/auth/api-key.ts
validateApiKey(rawKey: string): Promise<ApiKey & { service: { chatbot, org } } | null>

// lib/auth/rate-limit.ts
checkRateLimit(apiKeyId: string, plan: Plan): Promise<{ allowed: boolean }>
isOverMonthlyQuota(used: number, quota: number): boolean

// lib/db/prisma.ts — singleton PrismaClient
import { prisma } from "@/lib/db/prisma"
```

---

## 3. Frontend Routes Already Built (DO NOT break)

### Routes you must NOT touch

| Route | File | Status |
|---|---|---|
| `/chatbots/overview` | `app/(dashboard)/chatbots/overview/page.tsx` | Built — hub showing 3 types |
| `/chatbots` | `app/(dashboard)/chatbots/page.tsx` | Built — simple chatbot list |
| `/chatbots/[chatbotid]` | `app/(dashboard)/chatbots/[chatbotid]/page.tsx` | Built |
| `/chatbots/[chatbotid]/analytics` | `.../analytics/page.tsx` | Built |
| `/chatbots/[chatbotid]/settings` | `.../settings/page.tsx` | Built |
| `/chatbots/[chatbotid]/playground` | `.../playground/page.tsx` | Built |

### Sidebar (already updated)

`components/dashboard/sidebar.tsx` has an expandable "Chatbots" group with 3 sub-items:
- **Simple** → `/chatbots`
- **Short-term Memory** → `/chatbots/short-term`
- **Persistent Memory** → `/chatbots/long-term`

### Placeholder pages (replace these)

| File | Current state | Replace with |
|---|---|---|
| `app/(dashboard)/chatbots/short-term/page.tsx` | "Coming soon" info page | Real chatbot list filtered by `memoryType = "short_term"` |
| `app/(dashboard)/chatbots/long-term/page.tsx` | "Coming soon" info page | Real chatbot list filtered by `memoryType = "long_term"` |

---

## 4. Schema Changes Required

### Step 1: Add `memoryType` to `Chatbot`

```prisma
model Chatbot {
  // ... all existing fields ...
  memoryType  String  @default("simple")
  // Values: "simple" | "short_term" | "long_term"
}
```

### Step 2: Add `UserMemory` model (for long-term only)

```prisma
model UserMemory {
  id                  String   @id @default(cuid())
  chatbotId           String
  visitorIdentifier   String   -- email, userId, or stable device fingerprint
  content             String   @db.Text    -- extracted memory fact, e.g. "User prefers dark mode"
  importance          Float    @default(0.5)   -- 0.0 to 1.0
  embedding           Unsupported("vector")?   -- for semantic retrieval
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  chatbot             Chatbot  @relation(fields: [chatbotId], references: [id], onDelete: Cascade)

  @@index([chatbotId, visitorIdentifier])
}
```

Add relation to `Chatbot`:
```prisma
userMemories  UserMemory[]
```

### Step 3: Apply changes

```bash
npx prisma db push
npx prisma generate
```

---

## 5. Backend Logic to Implement

### 5a. Short-term Memory

**Only change:** The chat endpoint passes the FULL conversation history (not just last 6 messages) to the LLM.

In `app/api/chat/[chatbotid]/route.ts`, after fetching `chatbot`:

```ts
let history: { role: "user" | "assistant"; content: string }[] = [];

if (chatbot.memoryType === "short_term") {
  // ALL messages in this session, oldest first
  const allMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });
  history = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  
  // Token budget guard: if history is very long, keep last N chars
  const MAX_HISTORY_CHARS = 16000; // approx 4000 tokens
  const totalChars = history.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_HISTORY_CHARS) {
    // Trim from oldest, keep recent messages that fit
    while (history.length > 1) {
      history.shift();
      const chars = history.reduce((s, m) => s + m.content.length, 0);
      if (chars <= MAX_HISTORY_CHARS) break;
    }
  }
} else {
  // simple: existing last-6 logic
  const recentMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  history = recentMessages
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}
```

No other changes needed for short-term.

### 5b. Long-term Memory

**Request body:** Caller must send `{ message, sessionId, visitorIdentifier }`.  
`visitorIdentifier` is a stable string (email address, or a UUID the client generates once and stores in localStorage).

**Chat flow additions:**

```ts
if (chatbot.memoryType === "long_term") {
  const visitorIdentifier: string = body?.visitorIdentifier;
  if (!visitorIdentifier) {
    return NextResponse.json({ error: "visitorIdentifier is required for this chatbot" }, { status: 400 });
  }

  // 1. Fetch relevant memories (semantic search or recency)
  const memories = await prisma.userMemory.findMany({
    where: { chatbotId, visitorIdentifier },
    orderBy: { importance: "desc" },
    take: 10,
  });
  const memoryBlock = memories.length > 0
    ? `\n\nUser memory (facts known about this visitor):\n${memories.map(m => `- ${m.content}`).join("\n")}`
    : "";

  // 2. Inject into system prompt
  systemPrompt = `${chatbot.systemPrompt}${memoryBlock}`;

  // 3. After generating reply, emit Inngest event for memory extraction
  await inngest.send({
    name: "chat/memory.extract",
    data: { conversationId: conversation.id, chatbotId, visitorIdentifier },
  });
}
```

**Inngest job** (`lib/inngest/functions/extract-memory.ts`):

```ts
export const extractMemory = inngest.createFunction(
  { id: "extract-memory" },
  { event: "chat/memory.extract" },
  async ({ event, step }) => {
    const { conversationId, chatbotId, visitorIdentifier } = event.data;

    // Fetch conversation messages
    const messages = await step.run("fetch-messages", async () => {
      return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });
    });

    // Extract facts via LLM
    const extractionPrompt = `From this conversation, extract 1-5 key facts about the user (preferences, context, identity). Return a JSON array of strings. Only include facts that would be useful for future conversations. If there are no notable facts, return [].`;

    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const factsJson = await step.run("extract-facts", async () => {
      return generateChatCompletion(extractionPrompt, [], conversationText);
    });

    let facts: string[] = [];
    try { facts = JSON.parse(factsJson); } catch { return; }
    if (!Array.isArray(facts) || facts.length === 0) return;

    // Save new memories
    await step.run("save-memories", async () => {
      for (const fact of facts) {
        await prisma.userMemory.create({
          data: { chatbotId, visitorIdentifier, content: fact, importance: 0.5 },
        });
      }
    });
  }
);
```

Register in `lib/inngest/functions/index.ts` (or wherever existing Inngest functions are exported).

---

## 6. New UI Routes to Build

### Short-term list page
Replace `app/(dashboard)/chatbots/short-term/page.tsx` with a list page. Copy the pattern from `app/(dashboard)/chatbots/page.tsx` and `chatbots-client.tsx`. Filter chatbots by `memoryType = "short_term"`.

### Short-term detail pages
Create `app/(dashboard)/chatbots/short-term/[chatbotid]/` with same structure as `app/(dashboard)/chatbots/[chatbotid]/`. The only difference in the UI is the breadcrumb path.

Create a `ShortTermChatbotTabs` component (copy `ChatbotTabs`, change base paths from `/chatbots/` to `/chatbots/short-term/`).

### Long-term list + detail pages
Same as short-term, plus add a **"Memories"** tab to the detail page.

### Memories tab
**File:** `app/(dashboard)/chatbots/long-term/[chatbotid]/memories/page.tsx`  
**Component:** `components/features/chatbots/memory-viewer.tsx`

Displays a searchable table of `UserMemory` records for this chatbot:
- Search/filter by `visitorIdentifier`
- Show `content`, `importance`, `createdAt`
- Delete button per row (calls `DELETE /api/chatbots/[id]/memories/[memoryid]`)
- "Clear all for visitor" action

### Memory API routes to build
```
GET    /api/chatbots/[id]/memories           — list memories, ?visitorId= filter
DELETE /api/chatbots/[id]/memories/[mid]     — delete single memory
DELETE /api/chatbots/[id]/memories           — delete all for a visitor (?visitorId=)
```

### Update `CreateChatbotDialog`
Add a memory type selector (3 radio cards or a select). Pass `memoryType` in the POST body to `/api/chatbots`.

---

## 7. Component Reuse Map

| Existing component | Path | Reuse approach |
|---|---|---|
| `ChatbotCard` | `components/dashboard/chatbot-card.tsx` | Use as-is, pass correct href |
| `CreateChatbotDialog` | `components/dashboard/create-chatbot-dialog.tsx` | Add `defaultMemoryType` prop |
| `ChatbotTabs` | `components/dashboard/chatbot-tabs.tsx` | Copy, rename, change base path |
| `DocumentsPanel` | `components/dashboard/documents-panel.tsx` | Use as-is |
| `EmbedSnippet` | `components/dashboard/embed-snippet.tsx` | Use as-is |
| `AnalyticsChart` | `components/dashboard/analytics-chart.tsx` | Use as-is |
| `ChatbotSettingsForm` | `components/dashboard/chatbot-settings-form.tsx` | Use as-is |
| `DangerZone` | `components/dashboard/danger-zone.tsx` | Use as-is |
| `ChatbotPlayground` | `components/features/chatbots/chatbot-playground.tsx` | Use as-is |

---

## 8. Design Constraints (MUST follow)

- Color tokens only: `text-text`, `text-muted`, `bg-surface`, `bg-ink`, `border-line`, `text-accent` (amber), `text-accent-2` (cyan). No hex values.
- Fonts: `font-display` for headings, `font-mono` for keys/IDs.
- No shadcn/ui, no CSS Modules.
- Lucide icons (`lucide-react`) — already installed.
- No `alert()` — use `use-toast` hook.
- Every `Promise.all` in Server Components needs `.catch()` fallbacks.
- `npx tsc --noEmit` must pass with **0 errors**.

---

## 9. Implementation Order

1. Add `memoryType` to `Chatbot` schema + `UserMemory` model → `npx prisma db push` + `npx prisma generate`
2. Extend chat endpoint with `short_term` and `long_term` branches
3. Build the Inngest memory extraction job
4. Replace short-term placeholder page with real list
5. Build `/chatbots/short-term/[chatbotid]/` detail + tabs
6. Replace long-term placeholder page with real list
7. Build `/chatbots/long-term/[chatbotid]/` detail + Memories tab
8. Update `CreateChatbotDialog` with memory type selector
9. Add memory API routes
10. Run `npx tsc --noEmit` — must be 0 errors
