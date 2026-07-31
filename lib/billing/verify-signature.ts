// ============================================================================
// FEATURE: Razorpay signature verification
// Two distinct signatures Razorpay uses:
// 1. Checkout success signature — proves the payment callback from the
//    browser modal is genuine, not forged by a malicious client.
// 2. Webhook signature — proves an incoming webhook POST actually came
//    from Razorpay, not an attacker hitting your endpoint directly.
// ============================================================================

import { createHmac } from "crypto";

export function verifyPaymentSignature(
  razorpaySubscriptionId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
    .digest("hex");
  return expected === razorpaySignature;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}