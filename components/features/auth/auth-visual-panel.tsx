import { cn } from "@/lib/utils";

interface AuthVisualPanelProps {
  className?: string;
}

const workflowSteps = [
  {
    step: "01",
    title: "Connect knowledge",
    text: "Docs, policies, and product data enter one governed workspace.",
  },
  {
    step: "02",
    title: "Choose an AI service",
    text: "Start with retrieval, then add agents, caching, and automation.",
  },
  {
    step: "03",
    title: "Ship with controls",
    text: "Scoped keys, usage limits, team access, and live status stay visible.",
  },
];

const serviceRows = [
  { name: "Retrieval API", status: "Live", value: "186 chunks" },
  { name: "Agent runbook", status: "Review", value: "4 tools" },
  { name: "Cache layer", status: "Queued", value: "32 docs" },
];

export function AuthVisualPanel({ className }: AuthVisualPanelProps) {
  return (
    <aside className={cn("relative min-h-[680px] overflow-hidden border-l border-line bg-ink", className)}>
      <div className="absolute inset-y-12 left-14 w-px bg-line" />
      <div className="absolute right-0 top-20 h-56 w-56 border-l border-t border-line/70" />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">AI operations layer</p>
          <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
            Build the first service, then keep the platform ready for the next one.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-muted">
            Retrieval, agents, automation, and cache-augmented generation share the same workspace controls.
          </p>
        </div>

        <div className="space-y-4">
          {workflowSteps.map((item) => (
            <WorkflowStep key={item.step} {...item} />
          ))}
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-display text-base font-medium">Acme AI workspace</p>
              <p className="mt-1 text-xs text-muted">Production services across support and operations</p>
            </div>
            <span className="rounded-sm bg-accent-2/10 px-2 py-1 text-xs font-semibold text-accent-2">HEALTHY</span>
          </div>
          <div className="mt-5 divide-y divide-line rounded-md border border-line bg-ink">
            {serviceRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">{row.name}</p>
                  <p className="mt-1 text-xs text-muted">{row.value}</p>
                </div>
                <span className="text-xs font-semibold text-accent-2">{row.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function WorkflowStep({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface font-mono text-xs text-muted">
        {step}
      </div>
      <div className="rounded-md border border-line bg-surface p-4 transition-colors duration-fast hover:bg-surface-hover">
        <h3 className="font-display text-base font-medium">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
      </div>
    </div>
  );
}
