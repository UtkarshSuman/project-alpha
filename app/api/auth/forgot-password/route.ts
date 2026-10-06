// ============================================================================
// FEATURE: Request a password reset
// Always returns success regardless of whether the email exists — this
// prevents account enumeration (an attacker probing which emails are
// registered by checking response differences).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendResetEmail } from "@/lib/email/send-reset-email";
import { nanoid } from "nanoid";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: true }); // still don't leak validation info
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user && user.passwordHash) {
    // Only makes sense for credentials-based accounts, not OAuth-only users
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await sendResetEmail({ to: user.email, resetUrl: `${appUrl}/reset-password?token=${token}` });
  }

  return NextResponse.json({ success: true });
}