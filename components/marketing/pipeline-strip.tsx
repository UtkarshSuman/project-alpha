import { Container } from "@/components/ui/container";

const STEPS = [
  { label: "PDF", hint: "source" },
  { label: "CHUNKS", hint: "parse" },
  { label: "EMBEDDINGS", hint: "index" },
  { label: "CHATBOT", hint: "serve" },
];

export function PipelineStrip() {
  return (
    <section className="border-b border-line bg-surface/50 py-8" aria-label="Document to chatbot pipeline">
      <Container>
        <ol className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {STEPS.map((step, index) => (
            <li key={step.label} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-mono text-[10px] text-accent-2">0{index + 1}</span>
                <div>
                  <p className="font-mono text-xs font-semibold tracking-[0.16em] text-text">{step.label}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{step.hint}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <span className="relative mx-2 hidden h-px flex-1 overflow-hidden bg-line sm:block" aria-hidden="true">
                  <span className="flow-pulse absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
