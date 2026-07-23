import type { NextConfig } from "next";

// FEATURE: Widget + chat API headers — CORS for cross-origin embedding,
// plus no-cache on widget.js so script updates (and by extension, any
// behavior tied to fresh loads) are never served stale from browser cache.

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/chat/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;