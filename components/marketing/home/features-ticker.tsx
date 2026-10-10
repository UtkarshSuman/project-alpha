"use client";

const BADGES = [
  { label: "MULTI-SERVICE", color: "#43a047" },
  { label: "API-FIRST", color: "#00acc1" },
  { label: "PRODUCTION READY", color: "#7cb342" },
  { label: "OBSERVABLE", color: "#fb8c00" },
];

export function FeaturesTicker() {
  return (
    <div className="w-full border-y border-line bg-surface/50 py-4 select-none transition-colors duration-fast">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center sm:gap-x-10">
          {BADGES.map((badge, idx) => (
            <div key={badge.label} className="flex items-center gap-x-6 sm:gap-x-10">
              <span
                className="font-mono text-xs font-bold tracking-[0.18em] uppercase sm:text-sm transition-colors"
                style={{ color: badge.color }}
              >
                {badge.label}
              </span>
              {idx < BADGES.length - 1 && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${BADGES[idx].color}, ${BADGES[idx + 1].color})`,
                    opacity: 0.7,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
