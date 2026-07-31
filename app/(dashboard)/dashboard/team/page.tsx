// FEATURE: Team page — list members + pending invites, invite dialog
import { prisma } from "@/lib/db/prisma";
import { requireOrg } from "@/lib/auth/session";
import { TeamPageClient } from "./team-client";

export default async function TeamPage() {
  const { userId, orgId } = await requireOrg();

  const [members, invites, currentMembership] = await Promise.all([
    prisma.membership.findMany({
      where: { orgId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    }),
    prisma.invite.findMany({
      where: { orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
    }),
    prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId } } }),
  ]);

  const canManage = currentMembership?.role === "OWNER" || currentMembership?.role === "ADMIN";

  return (
    <TeamPageClient
      currentUserId={userId}
      canManage={canManage}
      initialMembers={members}
      initialInvites={invites.map((i) => ({ id: i.id, email: i.email, role: i.role }))}
    />
  );
}