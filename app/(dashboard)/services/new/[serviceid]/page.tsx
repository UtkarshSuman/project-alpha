// FEATURE: Service creation entry point — routes each service type to its
// actual creation flow, or renders an early access roadmap preview.
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { SERVICES } from "@/data/services";
import { EarlyAccessCard } from "@/components/features/services/early-access-card";
import { ArrowLeft, Clock, ShieldCheck, Cpu, Layers } from "lucide-react";

export default async function NewServicePage({
  params,
}: {
  params: Promise<{ serviceid: string }>;
}) {
  const { serviceid } = await params;

  if (serviceid === "rag") {
    redirect("/chatbots?create=1");
  }
  if (serviceid === "tool") {
    redirect("/tool-agents?create=1");
  }

  const service = SERVICES.find((s) => s.id === serviceid);
  if (!service) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/services/new"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Service Catalog
        </Link>
      </div>

      {/* Service Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-line"
            style={{ backgroundColor: `${service.accentColor}1A` }}
          >
            <Cpu className="h-6 w-6" style={{ color: service.accentColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
                {service.name}
              </h1>
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-ink px-2.5 py-0.5 text-xs font-semibold text-muted">
                <Clock className="h-3 w-3" />
                In Development
              </span>
            </div>
            <p className="text-sm text-muted mt-0.5">{service.tagline}</p>
          </div>
        </div>
      </div>

      {/* Description card */}
      <div className="rounded-2xl border border-line bg-surface/60 p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-text">Overview & Architecture</h2>
        <p className="text-sm text-muted leading-relaxed">{service.description}</p>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div className="flex items-start gap-3 rounded-xl border border-line bg-ink p-4">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text">Enterprise Governance</p>
              <p className="text-xs text-muted mt-1 leading-snug">
                Unified token limits, scoped API keys, and audit logging shared across all services.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-line bg-ink p-4">
            <Layers className="h-5 w-5 text-accent-2 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-text">Composable Orchestration</p>
              <p className="text-xs text-muted mt-1 leading-snug">
                Designed to chain seamlessly with your existing RAG knowledge and custom Tool Chatbots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Early Access Form */}
      <EarlyAccessCard
        serviceName={service.name}
        userEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}