"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroGraph } from "./hero-graph";

interface HeroSectionProps {
  ctaHref: string;
  ctaLabel?: string;
}

export function HeroSection({
  ctaHref = "/register",
  ctaLabel = "Start building",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
      {/* Green ambient radial — derived from logo vivid green */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-hero-bg)" }} />

      {/* Animated brand gradient top stripe */}
      <div className="absolute inset-x-0 top-0 h-[3px] brand-stripe" />

      {/* Subtle vertical grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "linear-gradient(to right, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "120px 100%",
          maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          opacity: 0.25,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline and Call-to-actions (5 cols) */}
          <div className="text-left lg:col-span-5">

            {/* Live badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-accent shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              Retrieval service is live
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl lg:text-[58px] lg:leading-[1.08]">
              Build AI services that{" "}
              <span
                className="block"
                style={{
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually do something.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
              Build, connect, deploy, and scale AI services from one platform —
              from intelligent retrieval and tool-using agents to automated
              workflows and real-time business operations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={ctaHref}
                className="inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow active:scale-[0.98]"
                style={{ background: "var(--gradient-cta)" }}
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a
                href="#composer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-text shadow-sm transition-all duration-200 hover:bg-surface-hover hover:border-accent/40 active:scale-[0.98]"
              >
                Explore architecture
              </a>
            </div>

            {/* Stats row */}
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-line pt-6">
              <div>
                <dt className="sr-only">Service categories</dt>
                <dd className="font-display text-2xl font-semibold text-accent">4</dd>
                <p className="mt-1 text-xs leading-5 text-muted">Service categories in the roadmap</p>
              </div>
              <div>
                <dt className="sr-only">API-first</dt>
                <dd className="font-display text-2xl font-semibold text-accent-2">API</dd>
                <p className="mt-1 text-xs leading-5 text-muted">Scoped keys per service</p>
              </div>
              <div>
                <dt className="sr-only">Real-time</dt>
                <dd
                  className="font-display text-2xl font-semibold"
                  style={{ color: "#fb8c00" }}
                >
                  Live
                </dd>
                <p className="mt-1 text-xs leading-5 text-muted">Streaming inference</p>
              </div>
            </dl>
          </div>

          {/* Right Column: Hero Graph (7 cols) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <HeroGraph />
          </div>
        </div>
      </div>
    </section>
  );
}
