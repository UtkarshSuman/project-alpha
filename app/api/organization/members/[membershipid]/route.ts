// ============================================================================
// FEATURE: Remove a team member — ADMIN/OWNER only, and blocks removing the
// last remaining OWNER (an org must always have at least one owner).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrgRole, UnauthorizedError, ForbiddenError } from "@/lib/auth/session";
import { Role } from "@prisma/client";

type RouteParams = { params: Promise<{ membershipid: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { membershipid } = await params;
    const { orgId } = await requireOrgRole(Role.ADMIN);

    const membership = await prisma.membership.findUnique({ where: { id: membershipid } });
    if (!membership || membership.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (membership.role === "OWNER") {
      const ownerCount = await prisma.membership.count({ where: { orgId, role: "OWNER" } });
      if (ownerCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner of a workspace" }, { status: 400 });
      }
    }

    await prisma.membership.delete({ where: { id: membershipid } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}