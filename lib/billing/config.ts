// ============================================================================
// FEATURE: Central billing + free-plan configuration
//
// BILLING_MODE:
// - "mock"     -> upgrade/cancel flows update the org directly in the DB,
//                 completely bypassing Razorpay. Used while
//                 Razorpay account is still completing KYC/activation for
//                 Subscriptions, so we can keep testing the full billing
//                 UI and quota enforcement without being blocked.
// - "razorpay" -> real flow: Checkout.js modal, signature verification,
//                 webhooks. Use once the account is activated.
// SAFETY: forced to "razorpay" in production regardless of the env var —
// mock billing can never accidentally ship live and give away paid plans
// for free.
//
// FREE_PLAN_ENABLED / FREE_PLAN_MESSAGE_QUOTA / FREE_PLAN_CHATBOT_LIMIT:
// lets you throttle or fully retire the free tier without touching code —
// set FREE_PLAN_CHATBOT_LIMIT=0 to stop free orgs from creating any
// chatbot at all, or FREE_PLAN_ENABLED=false to mark it unavailable
// everywhere it's shown (pricing page, billing page).
// ============================================================================

export const BILLING_MODE: "mock" | "razorpay" =
  process.env.NODE_ENV === "production"
    ? "razorpay"
    : process.env.BILLING_MODE === "mock"
    ? "mock"
    : "razorpay";

export const FREE_PLAN_ENABLED = process.env.FREE_PLAN_ENABLED !== "false"; // default: enabled
export const FREE_PLAN_MESSAGE_QUOTA = parseInt(process.env.FREE_PLAN_MESSAGE_QUOTA || "100", 10);
export const FREE_PLAN_CHATBOT_LIMIT = parseInt(process.env.FREE_PLAN_CHATBOT_LIMIT || "1", 10);