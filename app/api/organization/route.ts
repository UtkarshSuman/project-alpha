// ============================================================================
// FEATURE: Organization settings — get + rename
// GET   /api/organization   -> current org details
// PATCH /api/organization   -> rename the org
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { updateOrgSchema } from "@/lib/validations/organization";

export async function GET() {
  try {
    const { orgId } = await requireOrg();
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ organization: org });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orgId } = await requireOrg();

    const body = await req.json().catch(() => null);
    const parsed = updateOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { name: parsed.data.name },
    });

    return NextResponse.json({ organization: org });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}