// ============================================================================
// FEATURE: Accept an invite
// GET  /api/invites/:token  -> invite details (org name, inviting role) —
//        public-ish, but reveals minimal info (no need to be logged in to
//        preview what you're being invited to)
// POST /api/invites/:token  -> accept — REQUIRES login, and the logged-in
//        user's email must match the invite's email (prevents someone else
//        who guesses/intercepts the link from joining under your invite)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { org: { select: { name: true } } },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite is invalid or has expired" }, { status: 404 });
  }

  return NextResponse.json({ orgName: invite.org.name, email: invite.email, role: invite.role });
}

export async function POST(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "You must be signed in to accept an invite" }, { status: 401 });
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite is invalid or has expired" }, { status: 404 });
  }

  if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: `This invite was sent to ${invite.email}. Sign in with that email to accept it.` },
      { status: 403 }
    );
  }

  const userId = (session.user as any).id as string;

  const existing = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId: invite.orgId } },
  });

  if (!existing) {
    await prisma.$transaction([
      prisma.membership.create({ data: { userId, orgId: invite.orgId, role: invite.role } }),
      prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
    ]);
  }

  return NextResponse.json({ success: true, orgId: invite.orgId });
}