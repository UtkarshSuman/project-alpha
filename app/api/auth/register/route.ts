// ============================================================================
// FEATURE: Registration endpoint — the piece the register page calls.
//
// - Validates input with zod (never trust client-side validation alone)
// - Hashes password with bcrypt before storing
// - Creates the User AND their Organization + OWNER Membership in one
//   transaction, so a partial failure never leaves an orphaned user with
//   no workspace (which would break the dashboard layout's org lookup)
// ============================================================================

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    });

    await tx.organization.create({
      data: {
        name: `${name}'s Workspace`,
        memberships: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  });

  return NextResponse.json({ success: true }, { status: 201 });
}