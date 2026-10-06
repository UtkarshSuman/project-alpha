"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroPipeline } from "@/components/marketing/hero-pipeline";

const CAPABILITIES = ["retrieval", "tool agents", "automation", "CAG"];

type LandingHeroProps = {
  ctaHref: string;
  ctaLabel: string;
  freeMessageQuota: number;
};

export function LandingHero({ ctaHref, ctaLabel, freeMessageQuota }: LandingHeroProps) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % CAPABILITIES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(to right, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "120px 100%",
          maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          opacity: 0.35,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-line to-accent-2" />

      <Container className="relative grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 lg:py-20">
        <div className="reveal-up max-w-2xl pt-2">
          <div className="mb-7 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Retrieval service is live
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[0.94] tracking-tight md:text-7xl">
            From documents to a production
            <span className="block text-accent">AI service.</span>
          </h1>

          <p className="mt-5 font-display text-xl text-text md:text-2xl">
            Built for{" "}
            <span key={wordIndex} className="word-swap inline-block text-accent-2">
              {CAPABILITIES[wordIndex]}
            </span>
          </p>

          <p className="mt-6 max-w-xl text-body-lg text-muted">
            Uveriq is the operating layer for retrieval, agents, automation, and cache-augmented generation.
            Start with grounded answers from your documents, then grow into services your customers and team can rely on.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={ctaHref}>{ctaLabel}</Button>
            <Button href="/#how-it-works" variant="secondary">
              See the platform
            </Button>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-line pt-6">
            <div>
              <dt className="sr-only">Service categories</dt>
              <dd className="font-display text-2xl font-semibold">4</dd>
              <p className="mt-1 text-xs leading-5 text-muted">Service categories in the roadmap</p>
            </div>
            <div>
              <dt className="sr-only">Free monthly messages</dt>
              <dd className="font-display text-2xl font-semibold">{freeMessageQuota}</dd>
              <p className="mt-1 text-xs leading-5 text-muted">Free monthly messages</p>
            </div>
            <div>
              <dt className="sr-only">API access</dt>
              <dd className="font-display text-2xl font-semibold">API</dd>
              <p className="mt-1 text-xs leading-5 text-muted">Scoped keys per service</p>
            </div>
          </dl>
        </div>

        <div className="reveal-up" style={{ animationDelay: "120ms" }}>
          <HeroPipeline />
        </div>
      </Container>
    </section>
  );
}
