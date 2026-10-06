// ============================================================================
// FEATURE: Environment banner — shows a visible "STAGING" ribbon whenever
// running anywhere other than the real production deployment, so it's
// never ambiguous which environment you're looking at.
// ============================================================================

export function EnvBanner() {
  // VERCEL_ENV is automatically set by Vercel: "production" | "preview" | "development"
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV;
  if (env === "production") return null;

  return (
    <div className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-ink">
      {env === "preview" ? "STAGING ENVIRONMENT" : "LOCAL DEVELOPMENT"} — no real data here
    </div>
  );
}