"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * "What you get" as a scroll-driven spotlight. On desktop a sticky stage
 * holds a large glyph, a rolling counter and a progress ring; the item that
 * crosses the middle of the viewport (or is hovered) lights up and the stage
 * morphs to its glyph. Phones get a plain stacked list with inline glyphs.
 * All motion is CSS transitions and stops with reduced motion.
 */
export function DeliverableGrid({ items }: { items: readonly { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const pad = (value: number) => String(value).padStart(2, "0");

  useEffect(() => {
    const rows = root.current?.querySelectorAll<HTMLElement>("[data-index]");
    if (!rows?.length) return;
    // A zero-height band across the middle of the viewport: whichever row crosses it is active.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="dlv mt-14 md:mt-20" style={{ "--i": active, "--n": items.length } as CSSProperties}>
      <div aria-hidden className="dlv-stage">
        <svg viewBox="0 0 120 120" className="dlv-ring">
          <circle cx="60" cy="60" r="58" pathLength={1} className="dlv-ring-track" />
          <circle cx="60" cy="60" r="58" pathLength={1} className="dlv-ring-fill" />
        </svg>
        {items.map((item, index) => (
          <div key={item.title} className="dlv-glyph" data-on={index === active || undefined}>
            <Glyph variant={index % 6} className="deliverable-glyph" />
          </div>
        ))}
        <div className="dlv-count">
          <span className="dlv-count-track">
            {items.map((item, index) => (
              <span key={item.title}>{pad(index + 1)}</span>
            ))}
          </span>
          <span className="dlv-count-total">/ {pad(items.length)}</span>
        </div>
      </div>

      <Reveal as="ol" className="dlv-list" stagger={0.08}>
        {items.map((item, index) => (
          <li
            key={item.title}
            data-reveal-item
            data-index={index}
            data-on={index === active || undefined}
            onPointerEnter={() => setActive(index)}
            className="dlv-item"
          >
            <span aria-hidden className="deliverable-rule" />
            <div className="flex items-center justify-between gap-6">
              <span className="text-label flex items-center gap-2 tabular-nums text-subtle">
                <span className="deliverable-dot" />
                {pad(index + 1)} / {pad(items.length)}
              </span>
              <Glyph variant={index % 6} className="deliverable-glyph dlv-item-glyph shrink-0" />
            </div>
            <h3 className="dlv-title">{item.title}</h3>
            <p className="dlv-body">{item.body}</p>
          </li>
        ))}
      </Reveal>
    </div>
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
