// ============================================================================
// FEATURE: UveriqMascot — SVG/CSS mascot illustration with idle animations.
// Pure presentational — receives props from UveriqGuide.
// No heavy animation library used; everything is CSS keyframes defined inline
// via className so they respect globals.css's reduced-motion reset.
// ============================================================================
"use client";

import { type CSSProperties } from "react";

type Props = {
  /** Scale factor for responsive sizing */
  size?: number;
  /** Wiggle/pulse when clicked */
  isReacting?: boolean;
  /** Gentle blink/float when idle */
  isIdle?: boolean;
  /** Class name on the outermost wrapper */
  className?: string;
  style?: CSSProperties;
};

export function UveriqMascot({ size = 64, isReacting = false, className = "", style }: Props) {
  const s = size;
  const reacting = isReacting ? "mascot-react" : "";

  return (
    <>
      <style>{`
        @keyframes mascot-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes mascot-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes mascot-react {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.18) rotate(-6deg); }
          50% { transform: scale(1.12) rotate(6deg); }
          75% { transform: scale(1.06) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes mascot-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(102,187,106,0.4)); }
          50% { filter: drop-shadow(0 0 10px rgba(102,187,106,0.7)); }
        }
        @keyframes mascot-scan {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }
        .mascot-float { animation: mascot-float 3.6s ease-in-out infinite; }
        .mascot-react { animation: mascot-react 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .mascot-glow { animation: mascot-glow 3.6s ease-in-out infinite; }
        .mascot-blink { animation: mascot-blink 4s ease-in-out infinite; }
        .mascot-scan { animation: mascot-scan 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mascot-float, .mascot-react, .mascot-glow, .mascot-blink, .mascot-scan {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`mascot-float mascot-glow ${reacting} ${className}`}
        style={{ width: s, height: s, ...style }}
        aria-hidden="true"
        role="img"
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s}
          height={s}
        >
          {/* ── Body shell — hexagonal robot form ── */}
          <defs>
            <radialGradient id="mg-body" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1a3a1a" />
              <stop offset="100%" stopColor="#040d04" />
            </radialGradient>
            <radialGradient id="mg-eye-l" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#a5d6a7" />
              <stop offset="100%" stopColor="#66bb6a" />
            </radialGradient>
            <radialGradient id="mg-eye-r" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#80deea" />
              <stop offset="100%" stopColor="#26c6da" />
            </radialGradient>
            <filter id="mg-inner-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="mg-stripe" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#43a047" />
              <stop offset="50%" stopColor="#00acc1" />
              <stop offset="100%" stopColor="#fb8c00" />
            </linearGradient>
          </defs>

          {/* Outer hexagon body */}
          <path
            d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z"
            fill="url(#mg-body)"
            stroke="#2e7d32"
            strokeWidth="1.5"
          />

          {/* Inner panel / face plate */}
          <rect x="14" y="18" width="36" height="26" rx="5" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />

          {/* Brand gradient accent stripe at top */}
          <rect x="14" y="18" width="36" height="3" rx="1.5" fill="url(#mg-stripe)" opacity="0.8" className="mascot-scan" />

          {/* Left eye — green */}
          <g className="mascot-blink" style={{ transformOrigin: "24px 30px" }}>
            <ellipse cx="24" cy="30" rx="5" ry="5.5" fill="url(#mg-eye-l)" />
            <ellipse cx="24" cy="30" rx="3" ry="3.5" fill="#040d04" />
            <circle cx="25.5" cy="28.5" r="1" fill="#a5d6a7" opacity="0.8" />
          </g>

          {/* Right eye — cyan */}
          <g className="mascot-blink" style={{ transformOrigin: "40px 30px", animationDelay: "0.15s" }}>
            <ellipse cx="40" cy="30" rx="5" ry="5.5" fill="url(#mg-eye-r)" />
            <ellipse cx="40" cy="30" rx="3" ry="3.5" fill="#040d04" />
            <circle cx="41.5" cy="28.5" r="1" fill="#80deea" opacity="0.8" />
          </g>

          {/* Mouth — LED bar */}
          <rect x="22" y="38" width="20" height="3" rx="1.5" fill="#1a3a1a" />
          <rect x="23" y="38.5" width="5" height="2" rx="1" fill="#66bb6a" opacity="0.9" />
          <rect x="29.5" y="38.5" width="5" height="2" rx="1" fill="#26c6da" opacity="0.7" />
          <rect x="36" y="38.5" width="5" height="2" rx="1" fill="#fb8c00" opacity="0.6" />

          {/* Antenna */}
          <line x1="32" y1="4" x2="32" y2="10" stroke="#2e7d32" strokeWidth="1.5" />
          <circle cx="32" cy="8" r="2.5" fill="#66bb6a" opacity="0.9" className="mascot-scan" />

          {/* Left ear nub */}
          <rect x="4" y="26" width="6" height="10" rx="2" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
          <rect x="5.5" y="29" width="3" height="4" rx="1" fill="#2e7d32" opacity="0.6" />

          {/* Right ear nub */}
          <rect x="54" y="26" width="6" height="10" rx="2" fill="#0a1a0a" stroke="#1a3a1a" strokeWidth="1" />
          <rect x="55.5" y="29" width="3" height="4" rx="1" fill="#26c6da" opacity="0.6" />
        </svg>
      </div>
    </>
  );
}
