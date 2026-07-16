// ============================================================================
// FEATURE: Origin/domain restriction for the public chat + config endpoints
//
// Without this, a leaked API key works from ANY website — anyone who gets
// hold of a customer's key could embed the widget elsewhere and consume
// their quota. This checks the browser-sent `Origin` header against a
// customer-configured allowlist stored on the Chatbot.
//
// Design choices:
// - allowedOrigins is OPTIONAL (null/empty = unrestricted) so local dev and
//   first-time setup aren't blocked before a customer configures anything.
// - Matching is by hostname, not full origin string, so both "example.com"
//   and "https://example.com" typed into the settings UI work the same way.
// - Requests with NO Origin header (e.g. server-to-server calls, curl,
//   Postman) are allowed through — origin checking is a browser-only
//   concept; non-browser clients should instead be constrained by rotating
//   keys and rate limits, which we already have.
// ============================================================================

export function isOriginAllowed(allowedOriginsRaw: string | null, requestOrigin: string | null): boolean {
  // No restriction configured -> allow everything (dev-friendly default)
  if (!allowedOriginsRaw || allowedOriginsRaw.trim() === "") return true;

  // No Origin header -> non-browser request (curl, server-to-server, etc.) -> allow
  if (!requestOrigin) return true;

  const allowedHosts = allowedOriginsRaw
    .split(",")
    .map((s) => normalizeHost(s))
    .filter(Boolean);

  const requestHost = normalizeHost(requestOrigin);
  return allowedHosts.includes(requestHost);
}

function normalizeHost(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    // Handles both "https://example.com" and bare "example.com" input
    const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}