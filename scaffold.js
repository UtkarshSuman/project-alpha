const fs = require("fs");
const path = require("path");

// Folders to create
const folders = [
  "app/(dashboard)",
  "app/(dashboard)/dashboard",
  "app/(dashboard)/chatbots",
  "app/(dashboard)/chatbots/[botId]",
  "app/(dashboard)/chatbots/[botId]/documents",
  "app/(dashboard)/chatbots/[botId]/settings",
  "app/(dashboard)/chatbots/[botId]/analytics",
  "app/(dashboard)/chatbots/[botId]/api-keys",
  "app/(dashboard)/chatbots/[botId]/playground",

  "app/(marketing)",
  "app/(marketing)/pricing",

  "app/api/chat/[botId]",
  "app/api/ingest",
  "app/api/webhooks/stripe",
  "app/api/keys",
  "app/api/internal/usage",
  "app/api/auth/[...nextauth]",

  "components/ui",
  "components/dashboard",
  "components/marketing",
  "components/widget",

  "hooks",

  "lib",
  "lib/ai",
  "lib/auth",
  "lib/billing",
  "lib/db",
  "lib/queue",
  "lib/queue/jobs",

  "prisma",

  "types",

  "widget",

  "workers",
];

// Files to create (only if they don't already exist)
const files = {
  // Dashboard
  "app/(dashboard)/layout.tsx":
`export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`,

  "app/(dashboard)/dashboard/page.tsx":
`export default function DashboardPage() {
  return <div>Dashboard</div>;
}
`,

  "app/(dashboard)/chatbots/page.tsx":
`export default function ChatbotsPage() {
  return <div>Chatbots</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/layout.tsx":
`export default function BotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`,

  "app/(dashboard)/chatbots/[botId]/page.tsx":
`export default function BotPage() {
  return <div>Bot Overview</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/documents/page.tsx":
`export default function DocumentsPage() {
  return <div>Documents</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/settings/page.tsx":
`export default function SettingsPage() {
  return <div>Settings</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/analytics/page.tsx":
`export default function AnalyticsPage() {
  return <div>Analytics</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/api-keys/page.tsx":
`export default function ApiKeysPage() {
  return <div>API Keys</div>;
}
`,

  "app/(dashboard)/chatbots/[botId]/playground/page.tsx":
`export default function PlaygroundPage() {
  return <div>Playground</div>;
}
`,

  // Marketing
  "app/(marketing)/layout.tsx":
`export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`,

  "app/(marketing)/pricing/page.tsx":
`export default function PricingPage() {
  return <div>Pricing</div>;
}
`,

  // API Routes
  "app/api/chat/[botId]/route.ts":
`import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: true });
}
`,

  "app/api/ingest/route.ts":
`import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: true });
}
`,

  "app/api/webhooks/stripe/route.ts":
`import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ received: true });
}
`,

  "app/api/keys/route.ts":
`import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}
`,

  "app/api/internal/usage/route.ts":
`import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({});
}
`,

  "app/api/auth/[...nextauth]/route.ts":
`export {};
`,

  // Prisma
  "prisma/schema.prisma":
`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`,

  // Library placeholders
  "lib/db/index.ts": "",
  "lib/auth/index.ts": "",
  "lib/ai/index.ts": "",
  "lib/billing/index.ts": "",
  "lib/queue/index.ts": "",
  "lib/queue/jobs/index.ts": "",

  // Hooks
  "hooks/index.ts": "",

  // Types
  "types/index.ts": "",

  // Widget
  "widget/index.ts": "",

  // Workers
  "workers/index.ts": "",

  // Keep empty component folders in Git
  "components/ui/.gitkeep": "",
  "components/dashboard/.gitkeep": "",
  "components/marketing/.gitkeep": "",
  "components/widget/.gitkeep": "",
};

// Create folders
folders.forEach((folder) => {
  fs.mkdirSync(folder, { recursive: true });
});

// Create files only if they don't exist
Object.entries(files).forEach(([file, content]) => {
  const dir = path.dirname(file);

  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    console.log(`✓ Created ${file}`);
  } else {
    console.log(`↷ Skipped ${file}`);
  }
});

console.log("\n🎉 Next.js scaffold completed!");