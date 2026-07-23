// ============================================================================
// FEATURE: Server-side "current org" + role-checking helpers
// Every dashboard API route needs to know: (1) is someone logged in, and
// (2) which org do they act on behalf of. This centralizes that check so
// each route doesn't duplicate the same three lines and so the error
// response shape is consistent everywhere.
// ============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

/**
 * Returns { userId, orgId } for the signed-in user, or throws
 * UnauthorizedError. Call this at the top of any dashboard API route.
 */
export async function requireOrg() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const orgId = (session?.user as any)?.orgId as string | undefined;

  if (!userId || !orgId) {
    throw new UnauthorizedError("Not authenticated");
  }

  return { userId, orgId };
}

const ROLE_RANK: Record<Role, number> = { MEMBER: 0, ADMIN: 1, OWNER: 2 };


/**
 * Like requireOrg, but also enforces a minimum role (e.g. only ADMIN/OWNER
 * can invite or remove teammates). Throws ForbiddenError if the caller's
 * role is below the minimum.
 */
export async function requireOrgRole(minRole: Role) {
  const { userId, orgId } = await requireOrg();

  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });

  if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new ForbiddenError("Insufficient permissions");
  }

  return { userId, orgId, role: membership.role };
}

