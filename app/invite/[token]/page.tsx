// FEATURE: Public invite acceptance page with Uveriq styling and session handling
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InviteAcceptButton } from "./accept-button";
import Link from "next/link";
import { Building2, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { org: { select: { name: true } } },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-text">
        <Link
          href="/"
          className="mb-8 font-display text-lg font-semibold tracking-tight hover:text-accent transition-colors"
        >
          uveriq<span className="text-accent">.</span>
        </Link>
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm space-y-4">
          <AlertTriangle className="mx-auto h-8 w-8 text-accent" />
          <h1 className="font-display text-lg font-bold text-text">Invitation Invalid</h1>
          <p className="text-xs text-muted leading-relaxed">
            This invitation link is invalid, has already been claimed, or has expired after 7 days.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-accent-2 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Uveriq home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-text">
      <Link
        href="/"
        className="mb-8 font-display text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        uveriq<span className="text-accent">.</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-ink text-accent">
          <Building2 className="h-6 w-6" />
        </div>

        <div>
          <h1 className="font-display text-xl font-bold text-text">Join {invite.org.name}</h1>
          <p className="mt-1 text-xs text-muted">
            You've been invited to collaborate on this workspace as a{" "}
            <span className="font-semibold text-text uppercase font-mono">{invite.role}</span>.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-ink/60 p-3 text-xs text-muted flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent-2 shrink-0" />
          <span>Signed in as <strong className="text-text">{session.user?.email}</strong></span>
        </div>

        <InviteAcceptButton token={token} />
      </div>
    </div>
  );
}