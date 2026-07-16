// FEATURE: Messages-per-day bar chart using recharts
"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type DayCount = { date: string; count: number };

export function AnalyticsChart({ data }: { data: DayCount[] }) {
  return (
    <div className="h-64 rounded-lg border border-line bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="#8b92a6" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b92a6" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#131722", border: "1px solid #232838", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e7e9ee" }}
          />
          <Bar dataKey="count" fill="#f2a93b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}