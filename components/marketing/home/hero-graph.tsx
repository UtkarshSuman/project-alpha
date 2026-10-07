"use client";

import { useState } from "react";
import { Database, Zap, Workflow, Activity, Cpu, Brain } from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  position: "top-left" | "top" | "top-right" | "bottom-right" | "bottom" | "bottom-left";
  coord: { x: number; y: number };
}

const NODES: NodeItem[] = [
  {
    id: "retrieve",
    name: "RETRIEVE",
    sub: "Knowledge / Context",
    icon: Database,
    color: "#2563eb",
    position: "top-left",
    coord: { x: 135, y: 70 },
  },
  {
    id: "act",
    name: "ACT",
    sub: "Tools / APIs",
    icon: Zap,
    color: "#059669",
    position: "top",
    coord: { x: 320, y: 38 },
  },
  {
    id: "automate",
    name: "AUTOMATE",
    sub: "Workflows",
    icon: Workflow,
    color: "#7c3aed",
    position: "top-right",
    coord: { x: 505, y: 70 },
  },
  {
    id: "observe",
    name: "OBSERVE",
    sub: "Analytics / Monitoring",
    icon: Activity,
    color: "#0891b2",
    position: "bottom-right",
    coord: { x: 505, y: 310 },
  },
  {
    id: "cache",
    name: "CACHE",
    sub: "Low-latency Intelligence",
    icon: Cpu,
    color: "#ea580c",
    position: "bottom",
    coord: { x: 320, y: 342 },
  },
  {
    id: "remember",
    name: "REMEMBER",
    sub: "Permanent Context",
    icon: Brain,
    color: "#db2777",
    position: "bottom-left",
    coord: { x: 135, y: 310 },
  },
];

export function HeroGraph() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const centerCoord = { x: 320, y: 190 };

  return (
    <div className="relative mx-auto w-full max-w-[640px] select-none">
      {/* Background radial ambient glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-100/40 via-indigo-50/20 to-emerald-50/30 blur-2xl" />

      {/* Outer Card with expanded boundary and white/translucent background */}
      <div className="relative aspect-[640/380] w-full rounded-3xl border border-slate-200/90 bg-white/80 p-4 shadow-sm backdrop-blur-md md:p-6 overflow-hidden">
        {/* SVG connection lines between center and surrounding nodes */}
        <svg
          viewBox="0 0 640 380"
          className="absolute inset-0 h-full w-full pointer-events-none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {NODES.map((node) => {
            const isHovered = activeNode === node.id;
            const isAnyHovered = activeNode !== null;
            const strokeColor = isHovered ? node.color : "#cbd5e1";
            const strokeWidth = isHovered ? 2.5 : 1.5;
            const opacity = isHovered ? 1 : isAnyHovered ? 0.35 : 0.7;

            // Curved bezier path from center to node
            const dx = node.coord.x - centerCoord.x;
            const dy = node.coord.y - centerCoord.y;
            const cx1 = centerCoord.x + dx * 0.45;
            const cy1 = centerCoord.y + dy * 0.1;
            const cx2 = centerCoord.x + dx * 0.55;
            const cy2 = centerCoord.y + dy * 0.9;
            const pathD = `M ${centerCoord.x} ${centerCoord.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${node.coord.x} ${node.coord.y}`;

            return (
              <g key={node.id}>
                {/* Static or hovered line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isHovered ? "none" : "3 3"}
                  opacity={opacity}
                  className="transition-all duration-300"
                />

                {/* Animated pulse dot moving along the path */}
                <circle
                  r={isHovered ? 3.5 : 2}
                  fill={isHovered ? node.color : "#3b82f6"}
                  opacity={isHovered ? 1 : 0.6}
                >
                  <animateMotion
                    path={pathD}
                    dur={isHovered ? "1.8s" : "3.2s"}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Central Core: AI Service Control Plane / UVERIQ */}
        <div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-default transition-all duration-300"
        >
          <div className="group relative flex flex-col items-center rounded-2xl border border-slate-900 bg-slate-950 px-5 py-3.5 text-center shadow-lg hover:shadow-xl sm:px-6 sm:py-4">
            <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase sm:text-[10px]">
              AI Service Control Plane
            </span>
            <div className="mt-0.5 flex items-center gap-1.5 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              <span>UVERIQ</span>
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="mt-1 inline-flex items-center rounded-full bg-slate-800/90 px-2 py-0.5 text-[9px] font-medium tracking-wide text-slate-300 sm:text-[10px]">
              AI SERVICE LAYER
            </div>
          </div>
        </div>

        {/* 6 Peripheral Service Nodes (Comfortably positioned inside the card boundary) */}
        {NODES.map((node) => {
          const isHovered = activeNode === node.id;
          const Icon = node.icon;

          // Position styles based on coordinate percentages of 640 x 380
          const leftPercent = (node.coord.x / 640) * 100;
          const topPercent = (node.coord.y / 380) * 100;

          return (
            <div
              key={node.id}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
              className={`absolute z-30 cursor-pointer transition-all duration-200 ${
                isHovered ? "scale-105 z-40" : "hover:scale-102"
              }`}
            >
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-2.5 py-1.5 shadow-xs transition-all sm:gap-2.5 sm:px-3 sm:py-2 ${
                  isHovered
                    ? "border-slate-800 ring-2 ring-blue-500/20 shadow-md"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                  style={{
                    backgroundColor: `${node.color}15`,
                    color: node.color,
                  }}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-[10px] font-bold tracking-wider text-slate-900 sm:text-[11px]">
                    {node.name}
                  </div>
                  <div className="text-[9px] font-medium text-slate-500 sm:text-[10px] whitespace-nowrap">
                    {node.sub}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
