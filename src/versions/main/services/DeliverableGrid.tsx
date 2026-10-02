"use client";

import { useRichInteractions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import type { PointerEvent } from "react";

/**
 * "What you get": a bento of deliverables. Every card carries a slowly moving
 * line glyph, a ghosted index and a sky spotlight that follows the pointer
 * and lights the card's edge. Wide cards alternate so the grid never reads
 * as a flat spreadsheet. All motion is CSS and pauses with reduced motion.
 */
export function DeliverableGrid({ items }: { items: readonly string[] }) {
  const rich = useRichInteractions();

  const track = (event: PointerEvent<HTMLLIElement>) => {
    if (!rich) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--px", `${event.clientX - rect.left}px`);
    el.style.setProperty("--py", `${event.clientY - rect.top}px`);
  };

  return (
    <Reveal as="ul" className="deliverables mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3" stagger={0.08}>
      {items.map((item, index) => {
        const wide = index % 4 === 0 || index % 4 === 3;
        return (
          <li
            key={item}
            data-reveal-item
            onPointerMove={track}
            className={cn("deliverable group relative isolate flex min-h-64 flex-col overflow-hidden rounded-card p-7 md:p-8", wide && "lg:col-span-2")}
          >
            <span aria-hidden className="deliverable-glow" />
            <span aria-hidden className="deliverable-index">{String(index + 1).padStart(2, "0")}</span>

            <div className="flex items-start justify-between gap-6">
              <span className="text-label flex items-center gap-2 tabular-nums text-subtle">
                <span className="deliverable-dot" />
                {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <Glyph variant={index % 6} className={cn("deliverable-glyph shrink-0", wide ? "size-28 md:size-32" : "size-24")} />
            </div>

            <h3 className="text-title mt-auto max-w-[16ch] pt-12 font-medium transition-transform duration-700 ease-expo group-hover:-translate-y-1">{item}</h3>
            <span aria-hidden className="deliverable-rule" />
          </li>
        );
      })}
    </Reveal>
  );
}

/** Six abstract line drawings, one per slot, each with its own slow loop. */
function Glyph({ variant, className }: { variant: number; className?: string }) {
  const common = { viewBox: "0 0 120 120", fill: "none", stroke: "currentColor", strokeWidth: 1, "aria-hidden": true, className: cn("text-sky", className) } as const;

  switch (variant) {
    case 0: // orbit
      return (
        <svg {...common}>
          <circle cx="60" cy="60" r="44" className="opacity-25" />
          <g className="glyph-spin">
            <ellipse cx="60" cy="60" rx="44" ry="16" className="opacity-60" />
            <circle cx="104" cy="60" r="3.5" fill="currentColor" stroke="none" />
          </g>
          <g className="glyph-spin-rev">
            <ellipse cx="60" cy="60" rx="16" ry="44" className="opacity-40" />
            <circle cx="60" cy="16" r="2.5" fill="currentColor" stroke="none" />
          </g>
          <circle cx="60" cy="60" r="6" fill="currentColor" stroke="none" className="glyph-pulse" />
        </svg>
      );
    case 1: // calendar grid
      return (
        <svg {...common}>
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x={14 + (i % 4) * 24}
              y={14 + Math.floor(i / 4) * 24}
              width="16"
              height="16"
              rx="4"
              className="glyph-cell"
              style={{ animationDelay: `${((i * 7) % 16) * 0.22}s` }}
            />
          ))}
        </svg>
      );
    case 2: // signal waves
      return (
        <svg {...common}>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M6 ${42 + i * 12} C 30 ${22 + i * 12}, 46 ${62 + i * 12}, 60 ${42 + i * 12} S 90 ${22 + i * 12}, 114 ${42 + i * 12}`}
              className="glyph-wave"
              style={{ animationDelay: `${i * -0.6}s`, opacity: 1 - i * 0.2 }}
            />
          ))}
        </svg>
      );
    case 3: // community nodes
      return (
        <svg {...common}>
          <g className="glyph-spin-slow">
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              // Rounded so server and client render identical attributes.
              const x = Math.round((60 + 40 * Math.cos((deg * Math.PI) / 180)) * 100) / 100;
              const y = Math.round((60 + 40 * Math.sin((deg * Math.PI) / 180)) * 100) / 100;
              return (
                <g key={deg}>
                  <line x1="60" y1="60" x2={x} y2={y} className="opacity-30" />
                  <circle cx={x} cy={y} r="5" className="glyph-node" style={{ animationDelay: `${deg / 120}s` }} />
                </g>
              );
            })}
          </g>
          <circle cx="60" cy="60" r="9" fill="currentColor" stroke="none" className="glyph-pulse" />
        </svg>
      );
    case 4: // concentric reach
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="60" cy="60" r="12" className="glyph-ripple" style={{ animationDelay: `${i * 1.1}s` }} />
          ))}
          <circle cx="60" cy="60" r="5" fill="currentColor" stroke="none" />
        </svg>
      );
    default: // rising bars
      return (
        <svg {...common}>
          <path d="M10 108 H110" className="opacity-30" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={16 + i * 19}
              y="28"
              width="11"
              height="80"
              rx="3"
              className="glyph-bar"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </svg>
      );
  }
}
