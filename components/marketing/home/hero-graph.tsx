"use client";

import { useState } from "react";
import { Database, Zap, Workflow, Activity, Cpu, Brain } from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  coord: { x: number; y: number };
}

const NODES: NodeItem[] = [
  {
    id: "retrieve",
    name: "RETRIEVE",
    sub: "Knowledge / Context",
    icon: Database,
    color: "#2563eb",
    coord: { x: 130, y: 80 },
  },
  {
    id: "act",
    name: "ACT",
    sub: "Tools / APIs",
    icon: Zap,
    color: "#059669",
    coord: { x: 350, y: 38 },
  },
  {
    id: "automate",
    name: "AUTOMATE",
    sub: "Workflows",
    icon: Workflow,
    color: "#7c3aed",
    coord: { x: 570, y: 80 },
  },
  {
    id: "observe",
    name: "OBSERVE",
    sub: "Analytics / Monitoring",
    icon: Activity,
    color: "#0891b2",
    coord: { x: 570, y: 380 },
  },
  {
    id: "cache",
    name: "CACHE",
    sub: "Low-latency Intelligence",
    icon: Cpu,
    color: "#ea580c",
    coord: { x: 350, y: 422 },
  },
  {
    id: "remember",
    name: "REMEMBER",
    sub: "Permanent Context",
    icon: Brain,
    color: "#db2777",
    coord: { x: 130, y: 380 },
  },
];

export function HeroGraph() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const centerCoord = { x: 350, y: 230 };

  return (
    <div className="relative mx-auto w-full max-w-[720px] select-none">
      {/* Background radial ambient glow */}
      <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-emerald-500/10 blur-3xl" />

      {/* Outer Card with enlarged canvas and semantic theme tokens */}
      <div className="relative aspect-[700/460] w-full rounded-3xl border border-line bg-surface/90 p-5 shadow-md backdrop-blur-md md:p-8 overflow-hidden transition-colors duration-fast">
        {/* SVG connection lines between center and surrounding nodes */}
        <svg
          viewBox="0 0 700 460"
          className="absolute inset-0 h-full w-full pointer-events-none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {NODES.map((node) => {
            const isHovered = activeNode === node.id;
            const isAnyHovered = activeNode !== null;
            const strokeColor = isHovered ? node.color : "var(--color-line)";
            const strokeWidth = isHovered ? 3 : 1.75;
            const opacity = isHovered ? 1 : isAnyHovered ? 0.35 : 0.75;

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
                  strokeDasharray={isHovered ? "none" : "4 4"}
                  opacity={opacity}
                  className="transition-all duration-300"
                />

                {/* Animated pulse dot moving along the path */}
                <circle
                  r={isHovered ? 4 : 2.5}
                  fill={isHovered ? node.color : "#3b82f6"}
                  opacity={isHovered ? 1 : 0.75}
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
          <div className="group relative flex flex-col items-center rounded-2xl border-2 border-line bg-ink px-6 py-4 text-center shadow-xl hover:shadow-2xl sm:px-8 sm:py-5">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase sm:text-xs">
              AI Service Control Plane
            </span>
            <div className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl">
              <span>UVERIQ</span>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="mt-1.5 inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-muted sm:text-[11px]">
              AI SERVICE LAYER
            </div>
          </div>
        </div>

        {/* 6 Peripheral Service Nodes with Wide Gaps */}
        {NODES.map((node) => {
          const isHovered = activeNode === node.id;
          const Icon = node.icon;

          // Position styles based on coordinate percentages of 700 x 460
          const leftPercent = (node.coord.x / 700) * 100;
          const topPercent = (node.coord.y / 460) * 100;

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
                className={`flex items-center gap-2.5 rounded-2xl border bg-surface px-3 py-2 shadow-xs transition-all sm:gap-3 sm:px-3.5 sm:py-2.5 ${
                  isHovered
                    ? "border-accent ring-2 ring-accent/20 shadow-md"
                    : "border-line hover:border-text/40"
                }`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl sm:h-9 sm:w-9"
                  style={{
                    backgroundColor: `${node.color}15`,
                    color: node.color,
                  }}
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-[11px] font-bold tracking-wider text-text sm:text-xs">
                    {node.name}
                  </div>
                  <div className="text-[10px] font-medium text-muted sm:text-[11px] whitespace-nowrap">
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
