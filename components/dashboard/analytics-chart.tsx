// ============================================================================
// FEATURE: Analytics time-series visualization
// Uses Recharts with design tokens (accent/surface/line).
// Supports Area and Bar view modes, custom styled tooltips, and volume summaries.
// ============================================================================

"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DayCount = { date: string; count: number };

type Props = {
  data: DayCount[];
};

export function AnalyticsChart({ data }: Props) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const avg = data.length > 0 ? (total / data.length).toFixed(1) : "0";
  const peak = data.reduce((max, d) => (d.count > max.count ? d : max), { date: "—", count: 0 });

  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-elevate-sm">
      {/* Chart Toolbar & Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line/50 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-medium text-text">
              Traffic Volume (Last 14 Days)
            </h3>
            <span className="inline-flex items-center gap-1 rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <TrendingUp size={12} />
              {total} total messages
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Average: <span className="font-medium text-text">{avg}</span> msg/day · Peak:{" "}
            <span className="font-medium text-text">{peak.count}</span> ({peak.date})
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-md border border-line bg-surface-hover/50 p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={cn(
              "flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
              chartType === "area"
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text"
            )}
            title="Area chart"
          >
            <LineChart size={13} />
            <span>Area</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={cn(
              "flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors duration-fast",
              chartType === "bar"
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text"
            )}
            title="Bar chart"
          >
            <BarChart3 size={13} />
            <span>Bar</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2a93b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f2a93b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#232838" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8b92a6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#8b92a6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-line bg-surface p-2.5 shadow-elevate-md text-xs space-y-1">
                        <p className="text-muted font-medium">{label}</p>
                        <p className="font-display font-semibold text-text">
                          {payload[0].value} <span className="text-muted font-normal">messages</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f2a93b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#analyticsGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#232838" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#8b92a6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#8b92a6"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-line bg-surface p-2.5 shadow-elevate-md text-xs space-y-1">
                        <p className="text-muted font-medium">{label}</p>
                        <p className="font-display font-semibold text-text">
                          {payload[0].value} <span className="text-muted font-normal">messages</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#f2a93b" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}