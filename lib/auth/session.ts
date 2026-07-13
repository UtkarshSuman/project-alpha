// ============================================================================
// FEATURE: Server-side "current org" helper
//
// Every dashboard API route needs to know: (1) is someone logged in, and
// (2) which org do they act on behalf of. This centralizes that check so
// each route doesn't duplicate the same three lines and so the error
// response shape is consistent everywhere.
// ============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export class UnauthorizedError extends Error {}

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