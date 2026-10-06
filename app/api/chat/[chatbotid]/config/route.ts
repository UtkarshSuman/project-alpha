// ============================================================================
// FEATURE: Public widget config endpoint with origin restriction
// GET /api/chat/:chatbotid/config
// Returns only branding/display fields (never system prompt or anything
// sensitive) — the widget calls this once on load to render with the
// customer's chosen title/color/welcome message.
// Public widget config endpoint — force-dynamic + no-store so
// branding changes take effect immediately, never served from cache.
// ============================================================================
// ============================================================================
// FEATURE: Public widget config endpoint — force-dynamic + no-store so
// branding changes take effect immediately, never served from cache.
// Now reads apiKey.service.chatbot instead of apiKey.chatbot, since API
// keys belong to Service (shared across future service types).
// ============================================================================
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { isOriginAllowed } from "@/lib/security/origin-check";

type RouteParams = { params: Promise<{ chatbotid: string }> };

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*" };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request, { params }: RouteParams) {
  const { chatbotid } = await params;
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.replace("Bearer ", "") ?? null;

  const apiKey = await validateApiKey(rawKey);
  if (!apiKey || apiKey.service.chatbot?.id !== chatbotid) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders() });
  }

  const requestOrigin = req.headers.get("origin");
  if (!isOriginAllowed(apiKey.service.chatbot.allowedOrigins, requestOrigin)) {
    return NextResponse.json(
      { error: "This domain is not authorized." },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { widgetTitle, widgetColor, widgetLogoUrl, welcomeMessage, widgetPosition, widgetTheme, widgetSize, suggestedQuestions } =
    apiKey.service.chatbot;

  // Parse newline-separated text into a clean array, capped at 4 questions
  // so the widget never gets visually overwhelmed regardless of input.
  const questionList = (suggestedQuestions || "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 4);

  return NextResponse.json(
    { widgetTitle, widgetColor, widgetLogoUrl, welcomeMessage, widgetPosition, widgetTheme, widgetSize,suggestedQuestions: questionList },
    { headers: { ...corsHeaders(), "Cache-Control": "no-store" } }
  );
}