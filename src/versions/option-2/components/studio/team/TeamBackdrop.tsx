"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

type TeamBackdropProps = {
  tone?: "light" | "dark";
  /** Floating outline shapes on top of the gradient field. */
  shapes?: boolean;
  className?: string;
};

const palettes = {
  light: {
    blobs: ["rgba(136,187,216,0.55)", "rgba(171,205,221,0.6)", "rgba(18,36,67,0.14)"],
    line: "rgba(18,36,67,0.14)",
    shape: "#122443",
  },
  dark: {
    blobs: ["rgba(136,187,216,0.22)", "rgba(18,36,67,0.9)", "rgba(171,205,221,0.12)"],
    line: "rgba(242,243,245,0.12)",
    shape: "#88bbd8",
  },
};

/* Soft radial gradients (no CSS blur filter) drifting on long, offset loops. */
const blobs = [
  { className: "-left-[20vmax] -top-[25vmax] size-[70vmax]", duration: 28, delay: 0 },
  { className: "-right-[25vmax] top-[10%] size-[60vmax]", duration: 34, delay: -8 },
  { className: "bottom-[-35vmax] left-[25%] size-[65vmax]", duration: 40, delay: -16 },
];

/* Organic flow lines echoing the identity's "connected flow". */
const paths = [
  "M-50 520 C 220 380, 420 640, 700 470 S 1180 300, 1500 430",
  "M-50 640 C 260 560, 520 760, 820 600 S 1260 520, 1500 640",
  "M-50 300 C 300 200, 560 420, 860 260 S 1300 160, 1500 240",
];

/* Floating shapes; `data-depth` feeds the hero's pointer parallax. */
const floaters = [
  { kind: "ring", className: "left-[8%] top-[22%] size-16 md:size-24", depth: 0.6, duration: 9 },
  { kind: "blob", className: "right-[12%] top-[16%] size-10 md:size-14", depth: 1.2, duration: 7 },
  { kind: "plus", className: "left-[46%] top-[12%] size-6 md:size-8", depth: 0.9, duration: 11 },
  { kind: "pill", className: "right-[42%] top-[30%] h-6 w-14 md:h-8 md:w-20", depth: 0.4, duration: 10 },
  { kind: "star", className: "bottom-[26%] right-[8%] size-12 md:size-16", depth: 1, duration: 13 },
] as const;

/**
 * Lightweight living background: drifting gradient field, flowing dashed
 * lines and floating shapes. Pure CSS loops on transform / dash offset only,
 * paused by an IntersectionObserver whenever the section is off screen.
 * The global reduced-motion rule freezes every loop.
 */
export function TeamBackdrop({ tone = "light", shapes = true, className }: TeamBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const palette = palettes[tone];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => el.toggleAttribute("data-paused", !entry.isIntersecting), {
      rootMargin: "10% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className={cn("team-backdrop pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {blobs.map((blob, index) => (
        <div
          key={index}
          className={cn("absolute rounded-full will-change-transform", blob.className)}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${palette.blobs[index]} 0%, transparent 62%)`,
            animation: `team-drift ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
          }}
        />
      ))}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {paths.map((d, index) => (
          <path
            key={d}
            data-draw
            d={d}
            stroke={palette.line}
            strokeWidth={index === 0 ? 1.5 : 1}
            strokeDasharray={index === 0 ? undefined : "2 10"}
            style={index === 0 ? undefined : { animation: `team-dash ${18 + index * 6}s linear infinite` }}
          />
        ))}
      </svg>

      {shapes
        ? floaters.map((floater) => (
            <div key={floater.kind} data-float data-depth={floater.depth} className={cn("absolute", floater.className)}>
              <div className="h-full w-full" style={{ animation: `team-float ${floater.duration}s ease-in-out infinite` }}>
                <Floater kind={floater.kind} color={palette.shape} />
              </div>
            </div>
          ))
        : null}
    </div>
  );
}

function Floater({ kind, color }: { kind: (typeof floaters)[number]["kind"]; color: string }) {
  switch (kind) {
    case "ring":
      return <span className="block h-full w-full rounded-full border-[1.5px]" style={{ borderColor: color }} />;
    case "blob":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path fill={color} d="M50 4c20 0 42 14 44 38s-14 52-40 54S6 82 5 55 30 4 50 4Z" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" style={{ animation: "team-spin 18s linear infinite" }}>
          <path d="M12 2v20M2 12h20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "pill":
      return <span className="block h-full w-full rounded-full border-[1.5px]" style={{ borderColor: color }} />;
    case "star":
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" style={{ animation: "team-spin 30s linear infinite" }}>
          <path
            fill="none"
            stroke={color}
            strokeWidth="2"
            d="M50 2c3 26 22 45 48 48-26 3-45 22-48 48-3-26-22-45-48-48C28 47 47 28 50 2Z"
          />
        </svg>
      );
  }
}
