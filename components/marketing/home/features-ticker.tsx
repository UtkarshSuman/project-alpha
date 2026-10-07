"use client";

const BADGES = [
  "MULTI-SERVICE",
  "API-FIRST",
  "PRODUCTION READY",
  "OBSERVABLE",
];

export function FeaturesTicker() {
  return (
    <div className="w-full border-y border-slate-200/80 bg-slate-100/60 py-4 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center sm:gap-x-10">
          {BADGES.map((badge, idx) => (
            <div key={badge} className="flex items-center gap-x-6 sm:gap-x-10">
              <span className="font-mono text-xs font-bold tracking-[0.18em] text-slate-700 uppercase sm:text-sm">
                {badge}
              </span>
              {idx < BADGES.length - 1 && (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
