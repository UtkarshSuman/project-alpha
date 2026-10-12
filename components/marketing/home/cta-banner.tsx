"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerProps {
  ctaHref?: string;
  ctaLabel?: string;
}

export function CtaBanner({
  ctaHref = "/register",
  ctaLabel = "Start building",
}: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 text-white" style={{ background: "#040d04" }}>
      {/* Animated brand gradient stripe at top */}
      <div className="absolute inset-x-0 top-0 h-[3px] brand-stripe" />

      {/* Green radial ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(67,160,71,0.14), transparent)",
        }}
      />

      {/* Subtle teal secondary glow offset */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,172,193,0.08), transparent)",
        }}
      />

      {/* Amber warm accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 30% 30% at 80% 20%, rgba(251,140,0,0.07), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo mark above headline */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-white/70 uppercase">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--gradient-brand)" }}
          />
          Uveriq Platform
        </div>

        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto">
          Build the AI service{" "}
          <span
            style={{
              background: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            your product actually needs.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
          Ground answers in real documents, equip models with deterministic
          tools, and deploy governed services in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-110 hover:shadow-green-900/30 active:scale-[0.98]"
            style={{ background: "var(--gradient-cta)" }}
          >
            {ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <a
            href="#composer"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            Explore architecture
          </a>
        </div>
      </div>

      {/* Animated brand gradient stripe at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] brand-stripe opacity-80" />
    </section>
  );
}
