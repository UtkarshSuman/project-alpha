// ============================================================================
// FEATURE: Per-plan rate limiting for the public chat API
//
// Uses Upstash Redis (works from Edge runtime, unlike a normal Postgres call)
// so we can reject abusive/over-quota requests in ~5ms before they ever touch
// the database or an LLM call (which is where your real costs are).
//
// Sliding window per API key, with limits that scale by the org's plan.
// ============================================================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Plan } from "@prisma/client";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Requests per minute, per plan tier
const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 10,
  STARTER: 60,
  PRO: 300,
  SCALE: 1500,
};

const limiters = new Map<Plan, Ratelimit>();

function getLimiter(plan: Plan) {
  if (!limiters.has(plan)) {
    limiters.set(
      plan,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(PLAN_LIMITS[plan], "60 s"),
        prefix: `ratelimit:${plan}`,
      })
    );
  }
  return limiters.get(plan)!;
}

export async function checkRateLimit(apiKeyId: string, plan: Plan) {
  const limiter = getLimiter(plan);
  const result = await limiter.limit(apiKeyId);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/**
 * Monthly message quota check (separate from per-minute rate limiting).
 * Per-minute limiting stops abuse; this enforces the actual billing plan.
 */
export function isOverMonthlyQuota(messagesUsed: number, quota: number) {
  return messagesUsed >= quota;
}