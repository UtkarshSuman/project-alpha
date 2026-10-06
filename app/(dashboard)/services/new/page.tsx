// FEATURE: Services catalog selector — choose an AI service to deploy
import Link from "next/link";
import { SERVICES } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Bot, Zap, Box, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";

const iconMap: Record<string, any> = {
  Bot,
  Zap,
  Box,
};

export default function ServicesCatalogPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Deploy New AI Service
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
          Select a Service Type
        </h1>
        <p className="mt-1 text-sm text-muted max-w-2xl leading-relaxed">
          Uveriq provides modular AI infrastructure. Deploy grounded retrieval chatbots, function-calling tool agents, or request early access to autonomous workflows.
        </p>
      </div>

      {/* Grid of services */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = iconMap[service.icon] || Zap;
          const isAvailable = service.status === "available";

          return (
            <div
              key={service.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                isAvailable
                  ? "border-line bg-surface/70 hover:border-line/90 hover:bg-surface shadow-sm"
                  : "border-line/60 bg-surface/30 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-line"
                    style={{ backgroundColor: `${service.accentColor}1A` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: service.accentColor }} />
                  </div>

                  {isAvailable ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-line bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                      <Clock className="h-3 w-3" />
                      In Development
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-display text-lg font-bold text-text">{service.name}</h3>
                <p className="mt-2 text-xs font-medium text-text/90 leading-snug">{service.tagline}</p>
                <p className="mt-2 text-xs text-muted leading-relaxed">{service.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60">
                {isAvailable ? (
                  <Button
                    href={`/services/new/${service.id}`}
                    variant="primary"
                    className="w-full gap-2 text-xs font-semibold"
                  >
                    Deploy {service.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    href={`/services/new/${service.id}`}
                    variant="secondary"
                    className="w-full text-xs text-muted hover:text-text"
                  >
                    View Roadmap & Waitlist
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
