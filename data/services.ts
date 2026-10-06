// ============================================================================
// FEATURE: Service catalog — single source of truth for every service the
// platform offers. Add a new entry here and it automatically appears on the
// marketing page — no component changes needed for new services.
// ============================================================================

export type ServiceStatus = "available" | "coming-soon" | "beta";

export type Service = {
  id: string;           // stable slug, used in routing (e.g. /services/new/rag)
  name: string;
  tagline: string;       // one-line hook shown on the card
  description: string;   // slightly longer, shown on hover/expanded
  icon: string;          // lucide-react icon name
  status: ServiceStatus;
  accentColor: string;   // hex, used for the card's icon background
};

export const SERVICES: Service[] = [
  {
    id: "rag",
    name: "Knowledge Retrieval",
    tagline: "Ground answers in the documents, policies, and systems your team trusts.",
    description:
      "Launch a production RAG service with source-aware responses, API keys, and an embeddable customer surface.",
    icon: "Bot",
    status: "available",
    accentColor: "#f2a93b",
  },
  {
    id: "agent",
    name: "Action Agents",
    tagline: "Give AI scoped tools so it can resolve work, not just describe it.",
    description:
      "Connect internal APIs, queues, and approvals so agents can execute controlled workflows across your stack.",
    icon: "Zap",
    status: "coming-soon",
    accentColor: "#4fd1c5",
  },
  {
    id: "cag",
    name: "Cache-Augmented Gen",
    tagline: "Serve large, stable knowledge bases with lower latency and fewer retrieval hops.",
    description:
      "Precompute durable context for technical libraries, policy sets, and catalogs where speed matters.",
    icon: "Box",
    status: "coming-soon",
    accentColor: "#8b92a6",
  },
  {
    id: "automation",
    name: "AI Automation",
    tagline: "Turn recurring operational decisions into monitored AI workflows.",
    description:
      "Schedule checks, route exceptions, and keep humans in the loop for revenue, support, and compliance operations.",
    icon: "Zap",
    status: "coming-soon",
    accentColor: "#e0605a",
  },
    {
    id: "tool",
    name: "Tool Chatbot",
    tagline: "Give your chatbot live access to your own APIs.",
    description:
      "Connect any API endpoint as a tool — your chatbot calls it in real time to fetch and explain live data.",
    icon: "Zap",
    status: "available",
    accentColor: "#4fd1c5",
  },
];
