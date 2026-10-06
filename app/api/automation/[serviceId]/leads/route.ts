// ============================================================================
// FEATURE: Public lead submission endpoint — what the embedded form posts to.
// Same auth model as every other public endpoint: API key + origin check.
// Creates the LeadRecord instantly (fast response for the widget), fires
// the Inngest event, all real AI work happens async in the background.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { checkRateLimit, isOverMonthlyQuota } from "@/lib/auth/rate-limit";
import { isOriginAllowed } from "@/lib/security/origin-check";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";

type RouteParams = { params: Promise<{ serviceId: string }> };

const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { serviceId } = await params;

  try {
    const authHeader = req.headers.get("authorization");
    const rawKey = authHeader?.replace("Bearer ", "") ?? null;
    const apiKey = await validateApiKey(rawKey);

    if (!apiKey || apiKey.serviceId !== serviceId) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders() });
    }

    const agent = await prisma.automationAgent.findUnique({ where: { serviceId } });
    if (!agent) return NextResponse.json({ error: "Automation agent not configured" }, { status: 404, headers: corsHeaders() });

    const requestOrigin = req.headers.get("origin");
    if (!isOriginAllowed(agent.allowedOrigins, requestOrigin)) {
      return NextResponse.json({ error: "This domain is not authorized." }, { status: 403, headers: corsHeaders() });
    }

    const service = apiKey.service;
    const rateLimit = await checkRateLimit(apiKey.id, service.plan);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: corsHeaders() });
    }
    if (isOverMonthlyQuota(service.messagesUsedThisPeriod, service.messageQuota)) {
      return NextResponse.json({ error: "Monthly quota exceeded." }, { status: 403, headers: corsHeaders() });
    }

    const body = await req.json().catch(() => null);
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400, headers: corsHeaders() });
    }

    const lead = await prisma.leadRecord.create({
      data: { automationAgentId: agent.id, ...parsed.data, status: "PENDING" },
    });

    await prisma.service.update({ where: { id: service.id }, data: { messagesUsedThisPeriod: { increment: 1 } } });
    await inngest.send({ name: "automation/lead.submitted", data: { leadId: lead.id } });

    return NextResponse.json({ success: true, successMessage: agent.successMessage }, { status: 201, headers: corsHeaders() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}