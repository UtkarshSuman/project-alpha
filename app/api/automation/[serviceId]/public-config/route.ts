// FEATURE: Public widget config — now lives under /api/automation/[serviceId],
// matching the leads submission route's identifier, so the embed snippet
// only ever needs ONE id (the Service id), never the dashboard-internal
// AutomationAgent id.
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { prisma } from "@/lib/db/prisma";

type RouteParams = { params: Promise<{ serviceId: string }> };

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*" };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: Request, { params }: RouteParams) {
  const { serviceId } = await params;
  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.replace("Bearer ", "") ?? null;
  const apiKey = await validateApiKey(rawKey);

  if (!apiKey || apiKey.serviceId !== serviceId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders() });
  }

  const agent = await prisma.automationAgent.findUnique({ where: { serviceId } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders() });

  return NextResponse.json(
    { widgetTitle: agent.widgetTitle, widgetColor: agent.widgetColor, successMessage: agent.successMessage },
    { headers: { ...corsHeaders(), "Cache-Control": "no-store" } }
  );
}