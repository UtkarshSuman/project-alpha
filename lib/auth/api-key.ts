// ============================================================================
// FEATURE: API key generation + validation (secures the public /api/chat/[chatbotid])
//
// Security model:
// - The raw key (e.g. "sk_live_XXXXXXXXXXXXXXXXXXXX") is shown to the customer
//   EXACTLY ONCE at creation time, then never stored or retrievable again —
//   same pattern Stripe/OpenAI use.
// - We store only a SHA-256 hash of the key in the DB. On each request we
//   hash the incoming key and look up by hash, so a DB leak doesn't expose
//   usable keys.
// - `keyPrefix` (first 16 chars) IS stored in plaintext so the dashboard can
//   show "sk_live_a1b2...” to help customers tell keys apart without ever
//   re-exposing the full secret.
// ============================================================================

import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `sk_live_${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 16);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Validates an incoming API key from the widget/public API.
 * Returns the associated chatbot + org (with plan info for quota checks)
 * or null if invalid/inactive.
 */
export async function validateApiKey(rawKey: string | null) {
  if (!rawKey || !rawKey.startsWith("sk_")) return null;

  const hash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: {
      chatbot: {
        include: { org: true },
      },
    },
  });

  if (!apiKey || !apiKey.isActive) return null;

  // Fire-and-forget last-used timestamp update (don't block the request on it)
  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return apiKey;
}