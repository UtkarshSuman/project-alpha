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
      {/* Subtle background ambient mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.06),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="text-left lg:col-span-6">
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[62px] lg:leading-[1.08]">
              Build AI services that{" "}
              <span className="block text-slate-900">actually do something.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8">
              Build, connect, deploy, and scale AI services from one platform —
              from intelligent retrieval and tool-using agents to automated
              workflows and real-time business operations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={ctaHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow active:scale-[0.98]"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <a
                href="#composer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Explore architecture
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Central Hub Architecture Graph */}
          <div className="lg:col-span-6">
            <HeroGraph />
          </div>
        </div>
      </div>
    </section>
  );
}
