// ============================================================================
// FEATURE: Public invite acceptance page
// Not inside (dashboard) or (marketing) route groups since it needs its own
// simple layout — works whether the visitor is logged in or not.
// ============================================================================
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InviteAcceptButton } from "./accept-button";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { org: { select: { name: true } } },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
        <p className="text-muted">This invite is invalid or has expired.</p>
      </div>
    );
  }

  if (!session) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 text-center">
        <h1 className="font-display text-lg font-semibold">Join {invite.org.name}</h1>
        <p className="mt-2 text-sm text-muted">
          You've been invited as a {invite.role.toLowerCase()}.
        </p>
        <InviteAcceptButton token={token} />
      </div>
    </div>
  );
}