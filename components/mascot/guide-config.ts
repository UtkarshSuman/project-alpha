// ============================================================================
// FEATURE: Mascot — Guide Config
// Centralized onboarding tour steps and contextual messages.
// Edit here to customize guidance without touching component JSX.
// ============================================================================

export type TourStep = {
  /** CSS selector of the element to highlight. null = center overlay */
  target: string | null;
  title: string;
  message: string;
  /** Optional arrow position relative to the highlight box */
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

export type MascotMode = "reactive" | "guide" | "chat";

// ---------------------------------------------------------------------------
// 1. Dashboard Overview Tour
// ---------------------------------------------------------------------------
export const dashboardTour: TourStep[] = [
  {
    target: null,
    title: "Welcome to Uveriq",
    message:
      "Uveriq is your unified workspace for building AI services — from knowledge-grounded chatbots to tool-using agents and automated workflows.",
    placement: "center",
  },
  {
    target: "[data-guide-id='sidebar-chatbots']",
    title: "Knowledge Retrieval",
    message:
      "Create RAG-powered chatbots trained on your documents. Upload CSVs, PDFs, or text files and get an embeddable chat widget in minutes.",
    placement: "right",
  },
  {
    target: "[data-guide-id='sidebar-tool-agents']",
    title: "Tool Agents",
    message:
      "Build agents that can call external APIs, query databases, or run custom functions — coordinated by an AI reasoning layer.",
    placement: "right",
  },
  {
    target: "[data-guide-id='sidebar-automation-agents']",
    title: "Lead Automations",
    message:
      "Capture and qualify leads automatically. Connect forms, triggers, and AI decision logic to automate your sales funnel.",
    placement: "right",
  },
  {
    target: "[data-guide-id='topbar-theme']",
    title: "Appearance",
    message: "Switch between light and dark mode. Your preference is saved locally.",
    placement: "bottom",
  },
];

// ---------------------------------------------------------------------------
// 2. Chatbot Creation & Document Upload Tour
// ---------------------------------------------------------------------------
export const chatbotCreationTour: TourStep[] = [
  {
    target: null,
    title: "Creating a Chatbot",
    message:
      "A chatbot in Uveriq is a RAG (Retrieval-Augmented Generation) service. It learns from the documents you upload.",
    placement: "center",
  },
  {
    target: "[data-guide-id='create-chatbot-btn']",
    title: "New Chatbot",
    message: "Click here to create your first chatbot. Give it a name that describes its purpose.",
    placement: "bottom",
  },
  {
    target: "[data-guide-id='documents-panel']",
    title: "Upload Documents",
    message:
      "Upload PDFs, CSVs, or text files. Uveriq chunks, embeds, and indexes them automatically — no configuration needed.",
    placement: "top",
  },
  {
    target: "[data-guide-id='embed-snippet']",
    title: "Embed on Your Site",
    message:
      "Once your documents are processed, copy this snippet and paste it into any webpage to add the chatbot widget.",
    placement: "top",
  },
  {
    target: "[data-guide-id='api-keys-section']",
    title: "API Keys",
    message:
      "Generate API keys here to authenticate requests from your application or external integrations.",
    placement: "top",
  },
];

// ---------------------------------------------------------------------------
// 3. Playground Tour
// ---------------------------------------------------------------------------
export const playgroundTour: TourStep[] = [
  {
    target: null,
    title: "Playground",
    message:
      "Test your chatbot before embedding it. Ask questions that your users might ask — the response comes from your uploaded documents.",
    placement: "center",
  },
  {
    target: "[data-guide-id='playground-input']",
    title: "Ask a Question",
    message:
      "Type any question. The chatbot will retrieve relevant chunks from your knowledge base and generate an answer.",
    placement: "top",
  },
];

// ---------------------------------------------------------------------------
// Static contextual messages (used by useGuide hook + data-guide attribute)
// ---------------------------------------------------------------------------
export const contextualMessages: Record<string, string> = {
  "create-chatbot": "Create a new RAG chatbot trained on your own documents.",
  "upload-document": "Upload a PDF, CSV, or plain text file to add to this chatbot's knowledge base.",
  "embed-snippet": "Copy this script tag and paste it into your website's HTML to embed the chatbot widget.",
  "api-key-create": "Generate a new API key to authenticate requests to this chatbot's API endpoint.",
  "api-key-copy": "Copy this key prefix — you'll need the full key shown once at creation time.",
  "playground-send": "Send your question and see how the chatbot responds using your documents.",
  "chatbot-settings": "Adjust the system prompt, model, temperature, and other chatbot parameters.",
  "origin-settings":
    "Restrict which domains can embed this chatbot. Leave empty to allow all origins.",
  "danger-zone": "Permanent actions — deleting a chatbot or clearing its data cannot be undone.",
  "tour-restart": "Restart the guided walkthrough of this page.",
};

// ---------------------------------------------------------------------------
// Mascot idle speech bubbles (rotated randomly while idle)
// ---------------------------------------------------------------------------
export const idleMessages = [
  "Need help? I can walk you through the dashboard.",
  "Hover over any element for a quick tip.",
  "Try the Playground to test your chatbot.",
  "Upload a PDF to train your first chatbot.",
  "Use the tour button to get a guided walkthrough.",
];

// ---------------------------------------------------------------------------
// Chat mode predefined responses (no API key needed for first version)
// ---------------------------------------------------------------------------
export const chatFaqs: Array<{ q: string; a: string }> = [
  {
    q: "How do I create a chatbot?",
    a: 'Go to **Knowledge Retrieval** in the sidebar, click **New Chatbot**, give it a name, then upload your documents on the chatbot\'s overview page.',
  },
  {
    q: "What file types can I upload?",
    a: "Uveriq supports **PDF**, **CSV**, and **plain text (.txt)** files. Each file is chunked, embedded, and indexed automatically.",
  },
  {
    q: "How do I embed the chatbot on my website?",
    a: "Open a chatbot, scroll to the **Embed on your Website** section, and copy the script snippet. Paste it before `</body>` in your HTML.",
  },
  {
    q: "How do I get an API key?",
    a: "In any chatbot's overview page, scroll to **API Keys** and click **New Key**. The full key is shown once — copy it immediately.",
  },
  {
    q: "Can I restrict which sites use my chatbot?",
    a: "Yes — use the **Allowed Origins** section on the chatbot overview page to whitelist specific domains.",
  },
  {
    q: "What is the Playground?",
    a: "The Playground lets you test your chatbot by asking questions before embedding it. Open a chatbot and click **Playground** in the top-right.",
  },
];
