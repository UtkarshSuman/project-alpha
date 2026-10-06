import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Container } from "@/components/ui/container";
import { ServicesSection } from "@/components/marketing/services-section";

const proof = [
  { value: "4", label: "Service categories in the roadmap" },
  { value: "100", label: "Free monthly messages" },
  { value: "API", label: "Scoped keys per service" },
];

const features = [
  {
    title: "Knowledge that moves with the work",
    desc: "Upload source material, track processing states, and keep grounded responses tied to the right workspace.",
  },
  {
    title: "Services instead of one-off demos",
    desc: "Run retrieval today, then add agents, cache-augmented generation, and automation without rethinking the platform.",
  },
  {
    title: "Workspace governance from day one",
    desc: "Invite teammates, track usage, manage billing, and revoke keys from the same operational control plane.",
  },
  {
    title: "Customer surfaces with real constraints",
    desc: "Embed where needed, expose APIs where useful, and keep production behavior scoped by service, key, and organization.",
  },
];

const platformLayers = [
  "Retrieval",
  "Agents",
  "Automation",
  "CAG",
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const ctaHref = session ? "/chatbots" : "/register";
  const ctaLabel = session ? "Go to dashboard" : "Start with retrieval";

  return (
    <>
      <section className="overflow-hidden border-b border-line">
        <Container className="grid min-h-[calc(100vh-4rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:py-20">
          <div className="pt-4 lg:pb-16">
            <div className="mb-7 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">
              <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgb(79_191_139_/_0.16)]" />
              Retrieval service is live
            </div>
            <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[0.96] tracking-tight md:text-7xl">
              AI services for teams that need more than a chatbot.
            </h1>
            <p className="mt-7 max-w-xl text-body-lg text-muted">
              Uveriq is an operating layer for retrieval, agents, automation, and cache-augmented generation. Start with
              grounded answers from your documents, then grow into services your customers and team can rely on.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={ctaHref}
                className="inline-flex h-11 items-center justify-center rounded-md bg-text px-5 text-sm font-semibold text-ink transition duration-fast hover:brightness-95"
              >
                {ctaLabel}
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-5 text-sm font-semibold text-text transition-colors duration-fast hover:bg-surface-hover"
              >
                See the platform
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-line pt-6">
              {proof.map((item) => (
                <div key={item.label}>
                  <p className="font-display text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <ProductPreview />
        </Container>
      </section>

      <ServicesSection />

      <section id="how-it-works" className="border-t border-line py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Operating layer</p>
              <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
                Built around the lifecycle of production AI services.
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-2 text-sm text-muted">
                {platformLayers.map((layer) => (
                  <span key={layer} className="border-l border-line px-3 py-2">
                    {layer}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-md border border-line bg-surface p-6 transition duration-base hover:-translate-y-1 hover:bg-surface-hover">
                  <h3 className="font-display text-lg font-medium">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-line py-24">
        <Container>
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Ready when the first service is</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight">
                Start with one grounded AI service, then build the platform around it.
              </h2>
              <p className="mt-4 max-w-lg text-muted">
                The free plan gives you enough room to test a real customer workflow before adding billing or teammates.
              </p>
            </div>
            <Link
              href={ctaHref}
              className="inline-flex h-11 items-center justify-center rounded-md bg-text px-5 text-sm font-semibold text-ink transition duration-fast hover:brightness-95"
            >
              {session ? "Go to dashboard" : "Create your workspace"}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function ProductPreview() {
  const cells = Array.from({ length: 24 });

  return (
    <div className="relative min-h-[560px] lg:min-h-[620px]" aria-label="Uveriq product preview">
      <div className="absolute right-0 top-4 w-full max-w-[620px] overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-display text-base font-medium">AI service control plane</p>
            <p className="mt-1 text-xs text-muted">workspace: acme operations</p>
          </div>
          <span className="rounded-sm bg-accent-2/10 px-2 py-1 text-xs font-semibold text-accent-2">LIVE</span>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-ink p-4">
            <div className="mb-4 flex items-center justify-between gap-4 text-xs text-muted">
              <span>Knowledge retrieval</span>
              <span>ready</span>
            </div>
            <div className="space-y-2">
              <span className="block h-2 w-11/12 rounded-sm bg-muted/30" />
              <span className="block h-2 w-8/12 rounded-sm bg-muted/30" />
              <span className="block h-2 w-full rounded-sm bg-muted/30" />
              <span className="block h-2 w-7/12 rounded-sm bg-muted/30" />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-ink p-4">
            <div className="mb-4 flex items-center justify-between gap-4 text-xs text-muted">
              <span>Service map</span>
              <span>4 modules</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {cells.map((_, index) => (
                <span
                  key={index}
                  className={`aspect-square rounded-sm ${index % 5 === 0 ? "service-scan bg-accent-2/40" : index % 3 === 0 ? "bg-accent-2/30" : "bg-accent/20"}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-ink p-4 md:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-4 text-xs text-muted">
              <span>Production surface</span>
              <span>scoped key</span>
            </div>
            <div className="space-y-3">
              <p className="ml-auto max-w-[78%] rounded-md bg-accent/15 px-3 py-2 text-sm leading-6">
                What should the agent do when the renewal policy is unclear?
              </p>
              <p className="max-w-[86%] rounded-md border border-line bg-surface px-3 py-2 text-sm leading-6">
                Answer from policy context, cite the source, and route exceptions to the operations queue.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-sm bg-muted/10 px-2 py-1 text-xs text-muted">retrieval: policy.pdf p.8</span>
              <span className="rounded-sm bg-muted/10 px-2 py-1 text-xs text-muted">agent: renewal triage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-[300px] rounded-lg border border-line bg-surface p-4 shadow-elevate-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-10 items-center justify-center rounded-md bg-danger-muted text-xs font-bold text-danger">
            API
          </div>
          <div>
            <p className="text-sm font-medium">ops-renewal-agent</p>
            <p className="mt-1 text-xs text-muted">Tool access pending approval</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/20">
          <div className="h-full w-3/4 rounded-full bg-accent-2" />
        </div>
      </div>
    </div>
  );
}
