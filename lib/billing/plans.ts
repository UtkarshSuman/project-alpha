// ============================================================================
// FEATURE: Single source of truth for plan <-> Razorpay plan ID mapping.
// FREE quota now reads from config.ts instead of being hardcoded, so it can
// be throttled via env var without a code change.
// ============================================================================

import { Plan } from "@prisma/client";
import { FREE_PLAN_MESSAGE_QUOTA } from "./config";

export const PLAN_QUOTAS: Record<Plan, number> = {
  FREE: FREE_PLAN_MESSAGE_QUOTA,
  STARTER: 2000,
  PRO: 10000,
  SCALE: 100000,
};

export const PLAN_PRICES_INR: Record<Plan, number> = {
  FREE: 0,
  STARTER: 2400,
  PRO: 8200,
  SCALE: 24800,
};

export const PLAN_TO_RAZORPAY_PLAN_ID: Partial<Record<Plan, string>> = {
  STARTER: process.env.RAZORPAY_PLAN_ID_STARTER,
  PRO: process.env.RAZORPAY_PLAN_ID_PRO,
  SCALE: process.env.RAZORPAY_PLAN_ID_SCALE,
};

export function planFromRazorpayPlanId(planId: string | undefined | null): Plan | null {
  if (!planId) return null;
  for (const [plan, id] of Object.entries(PLAN_TO_RAZORPAY_PLAN_ID)) {
    if (id === planId) return plan as Plan;
  }
  return null;
}