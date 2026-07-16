// ============================================================================
// FEATURE: Public widget config endpoint with origin restriction
// GET /api/chat/:chatbotid/config
// Returns only branding/display fields (never system prompt or anything
// sensitive) — the widget calls this once on load to render with the
// customer's chosen title/color/welcome message.
// ============================================================================


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
  if (!apiKey || apiKey.chatbot.id !== chatbotid) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders() });
  }

  const requestOrigin = req.headers.get("origin");
  if (!isOriginAllowed(apiKey.chatbot.allowedOrigins, requestOrigin)) {
    return NextResponse.json(
      { error: "This domain is not authorized to use this chatbot." },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { widgetTitle, widgetColor, widgetLogoUrl, welcomeMessage } = apiKey.chatbot;

  return NextResponse.json(
    { widgetTitle, widgetColor, widgetLogoUrl, welcomeMessage },
    { headers: corsHeaders() }
  );
}