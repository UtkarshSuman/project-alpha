"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

const BILLING_TABS = ["Service executions", "API usage", "API scale"];

const TIERS = [
  {
    name: "Developer",
    price: "₹0",
    cadence: "/mo",
    quota: "100 free messages/mo",
    description: "Ideal for experimenting with grounded RAG and custom tools.",
    features: [
      "1 Chatbot or Tool Agent",
      "Standard document ingestion",
      "Basic API access",
      "Community support",
    ],
    ctaText: "Start free",
    ctaHref: "/register",
    highlight: false,
  },
  {
    name: "Builder",
    price: "₹2,400",
    cadence: "/mo",
    quota: "2,000 messages/mo",
    description: "For startups shipping their first customer-facing AI agents.",
    features: [
      "5 Chatbots & Tool Agents",
      "Fast pgvector indexing",
      "Tool function calling",
      "Webhook automations",
      "Standard email support",
    ],
    ctaText: "Get started",
    ctaHref: "/register",
    highlight: false,
  },
  {
    name: "Scale",
    price: "₹8,200",
    cadence: "/mo",
    quota: "10,000 messages/mo",
    description: "Production teams scaling AI retrieval, tools, and analytics.",
    features: [
      "Unlimited Chatbots & Agents",
      "Hybrid RAG & re-ranking",
      "Custom domain & widget styling",
      "Persistent user memory",
      "Team collaboration seats",
      "Priority response support",
    ],
    ctaText: "Get started",
    ctaHref: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    quota: "Unlimited executions",
    description: "High-volume workloads requiring dedicated capacity and SLAs.",
    features: [
      "Dedicated high-throughput index",
      "Custom LLM fine-tuning",
      "On-prem VPC deployment",
      "HIPAA BAA & SOC2 audit logs",
      "99.9% uptime SLA guarantee",
      "Dedicated account manager",
    ],
    ctaText: "Speak with team",
    ctaHref: "mailto:enterprise@uveriq.ai",
    highlight: false,
  },
];

export function PricingSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="pricing" className="border-b border-slate-200/80 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Transparent Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Predictable billing aligned with real service runs. No surprise seat
            penalties or hidden egress fees.
          </p>

          {/* Billing Mode Tabs */}
          <div className="mt-8 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {BILLING_TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === idx
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Pricing Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 ${
                tier.highlight
                  ? "border-blue-600 bg-blue-50/20 shadow-xl ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {tier.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">
                  {tier.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {tier.cadence}
                  </span>
                </div>

                <div className="mt-2 font-mono text-xs font-semibold text-blue-600">
                  {tier.quota}
                </div>

                <div className="my-5 border-t border-slate-100" />

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href={tier.ctaHref}
                  className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                    tier.highlight
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {tier.ctaText}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
