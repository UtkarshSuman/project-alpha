import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrgRole, UnauthorizedError, ForbiddenError } from "@/lib/auth/session";
import { Role } from "@prisma/client";

type RouteParams = { params: Promise<{ inviteid: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { inviteid } = await params;
    const { orgId } = await requireOrgRole(Role.ADMIN);

    const invite = await prisma.invite.findUnique({ where: { id: inviteid } });
    if (!invite || invite.orgId !== orgId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    await prisma.invite.delete({ where: { id: inviteid } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Only admins can revoke invites" }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
