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
    <section className="bg-slate-950 py-20 md:py-28 text-white relative overflow-hidden">
      {/* Subtle radial ambient grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0.15),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto">
          Build the AI service your product actually needs.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
          Ground answers in real documents, equip models with deterministic
          tools, and deploy governed services in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-[0.98]"
          >
            {ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <a
            href="#composer"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
          >
            Explore architecture
          </a>
        </div>
      </div>
    </section>
  );
}
