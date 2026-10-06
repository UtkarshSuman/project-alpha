import { SERVICES } from "@/data/services";
import { Container } from "@/components/ui/container";
import { ServiceCard } from "./service-card";

export function ServicesSection() {
  return (
    <section id="services" className="py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">Service catalog</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
              One workspace for a growing portfolio of AI services.
            </h2>
          </div>
          <p className="max-w-2xl text-body-lg leading-8 text-muted lg:pt-9">
            Launch with grounded retrieval today. The surrounding product is shaped for action-taking agents,
            workflow automation, cached knowledge systems, team access, billing, and usage governance.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
