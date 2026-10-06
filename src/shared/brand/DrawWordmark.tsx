"use client";

import { LOGO_PATHS, LOGO_VIEWBOX, viewBoxOf } from "@/shared/brand/logo-paths";
import { useEffect, useState, type CSSProperties } from "react";

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
/** Seconds between one letter starting and the next. */
const STAGGER = 0.14;
/** Seconds a letter's outline takes to draw. */
const OUTLINE = 0.8;
/** The letter fills in once its outline is nearly closed. */
const FILL_AT = 0.85;

/**
 * The "PSdigital" wordmark writing itself letter by letter: each glyph's outline
 * is traced by a fine pen, then the letter fills in and the pen line fades. It
 * draws on mount, so it writes itself again each time it is shown. With reduced
 * motion it simply appears.
 */
export function DrawWordmark({ delay = 0, className }: { delay?: number; className?: string }) {
  const [drawn, setDrawn] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Two frames so the hidden state paints before the transition starts.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (reduced) setInstant(true);
        setDrawn(true);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const glyphStyle = (index: number): CSSProperties => {
    const start = delay + index * STAGGER;
    const fill = start + OUTLINE * FILL_AT;
    return {
      strokeDashoffset: drawn ? 0 : 1,
      fillOpacity: drawn ? 1 : 0,
      strokeOpacity: drawn ? 0 : 1,
      transition: instant
        ? "none"
        : `stroke-dashoffset ${OUTLINE}s ${EASE} ${start}s, fill-opacity 0.45s ease ${fill}s, stroke-opacity 0.5s ease ${fill + 0.3}s`,
    };
  };

  return (
    <svg viewBox={viewBoxOf(LOGO_VIEWBOX.wordmark)} focusable="false" aria-hidden className={className}>
      {LOGO_PATHS.wordmark.map((d, index) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 2"
          style={glyphStyle(index)}
        />
      ))}
    </svg>
  );
}
