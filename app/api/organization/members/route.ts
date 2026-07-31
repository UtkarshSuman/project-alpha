// ============================================================================
// FEATURE: Team members — list + invite
// GET  /api/organization/members  -> list members + pending invites
// POST /api/organization/members  -> create a shareable invite link
//        (ADMIN/OWNER only — enforced via requireOrgRole)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, requireOrgRole, UnauthorizedError, ForbiddenError } from "@/lib/auth/session";
import { z } from "zod";
import { nanoid } from "nanoid";
import { Role } from "@prisma/client";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function GET() {
  try {
    const { orgId } = await requireOrg();

    const [members, invites] = await Promise.all([
      prisma.membership.findMany({
        where: { orgId },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      }),
      prisma.invite.findMany({
        where: { orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ members, invites });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId } = await requireOrgRole(Role.ADMIN);

    const body = await req.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.invite.create({
      data: { orgId, email: parsed.data.email, role: parsed.data.role, token, expiresAt },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}