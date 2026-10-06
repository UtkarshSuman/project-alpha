// ============================================================================
// FEATURE: SSRF protection for tool calls
// Before EVER making an outbound request to a customer-configured URL, this
// validates the resolved IP isn't pointing at internal/private infrastructure.
// This is checked at CALL TIME (not just when the tool is saved), because
// DNS can change between save and use, and because save-time checks alone
// are trivially bypassed by pointing a domain at a public IP first, then
// repointing DNS to an internal one later (DNS rebinding).
// ============================================================================

import dns from "dns/promises";
import net from "net";

const BLOCKED_HOSTNAMES = ["localhost", "0.0.0.0"];

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10) return true;                                   // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true;               // 192.168.0.0/16
    if (parts[0] === 127) return true;                                   // loopback
    if (parts[0] === 169 && parts[1] === 254) return true;               // link-local (cloud metadata!)
    if (parts[0] === 0) return true;
    return false;
  }
  // IPv6 loopback / unique local / link-local
  return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80");
}

export async function assertUrlIsSafe(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http(s) URLs are allowed");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new Error("Requests to this host are not allowed");
  }

  // Resolve the actual IP the hostname points to — blocks DNS-rebinding
  // style bypasses where the domain itself looks fine but resolves internal.
  let addresses: string[];
  try {
    const result = await dns.lookup(hostname, { all: true });
    addresses = result.map((r) => r.address);
  } catch {
    throw new Error("Could not resolve host");
  }

  for (const addr of addresses) {
    if (isPrivateIp(addr)) {
      throw new Error("Requests to internal/private addresses are not allowed");
    }
  }
}