// FEATURE: Reusable quota usage bar (also usable on the overview page later)
export function QuotaBar({ used, quota }: { used: number; quota: number }) {
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text">{used.toLocaleString()} / {quota.toLocaleString()} messages</span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink">
        <div className={`h-full ${pct >= 90 ? "bg-red-400" : "bg-accent"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}