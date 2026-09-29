"use client";

import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { LOGO_PATHS } from "@/shared/brand/logo-paths";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * Stroke timings in seconds, in drawing order: the outer loop, then the stem
 * from the junction (35% along the loop), then the thin inner line.
 */
const TIMING = {
  main: { delay: 0, duration: 1.5 },
  stem: { delay: 0.5, duration: 0.55 },
  inner: { delay: 0.85, duration: 1.2 },
} as const;
/** The wordmark letters rise in once the mark is mostly drawn. */
const WORDMARK_DELAY = 1.5;
/** After the first draw, the logo wipes and draws itself again this often (seconds), unless `redrawEvery` says otherwise. */
const REDRAW_EVERY = 30 * 60;

/**
 * The PSdigital logo drawing itself as if by one pen, shared by every design.
 * `trigger="load"` draws on mount (headers); `trigger="view"` waits until the
 * logo scrolls into view (footers). It then redraws every `redrawEvery`
 * seconds (REDRAW_EVERY by default) while the page stays open. With reduced motion it simply appears.
 */
export function DrawLogo({
  variant = "full",
  trigger = "load",
  delay = 0,
  redrawEvery = REDRAW_EVERY,
  accent = true,
  title = "PSdigital",
  className,
}: {
  variant?: "full" | "mark";
  trigger?: "load" | "view";
  /** Seconds before drawing starts. */
  delay?: number;
  /** Seconds between redraws once drawn. */
  redrawEvery?: number;
  accent?: boolean;
  title?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let timer = 0;
    // Two frames so the hidden state paints before the transition starts.
    const nextPaint = (fn: () => void) => {
      frame = requestAnimationFrame(() => (frame = requestAnimationFrame(fn)));
    };
    // Wipe the drawing instantly, then draw it again.
    const redraw = () => {
      setInstant(true);
      setDrawn(false);
      nextPaint(() => {
        setInstant(false);
        setDrawn(true);
      });
    };
    const play = () => {
      nextPaint(() => setDrawn(true));
      timer = window.setInterval(redraw, redrawEvery * 1000);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => {
        setInstant(true);
        setDrawn(true);
      });
      return () => cancelAnimationFrame(frame);
    }
    if (trigger === "load") {
      play();
      return stop;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [trigger, redrawEvery]);

  const strokeStyle = (name: keyof typeof TIMING): CSSProperties => ({
    strokeDashoffset: drawn ? 0 : 1,
    transition: instant ? "none" : `stroke-dashoffset ${TIMING[name].duration}s ${EASE} ${delay + TIMING[name].delay}s`,
  });

  return (
    <span ref={ref} className="inline-flex">
      <DrawableLogo
        variant={variant}
        accent={accent}
        title={title}
        className={className}
        renderStroke={(stroke) => <path {...stroke} pathLength={1} strokeDasharray="1 2" style={strokeStyle(stroke["data-draw"])} />}
      >
        {variant === "full" ? (
          <g fill="currentColor">
            {LOGO_PATHS.wordmark.map((d, index) => (
              <path
                key={d}
                d={d}
                style={{
                  opacity: drawn ? 1 : 0,
                  transform: drawn ? "none" : "translateY(24px)",
                  transition: instant ? "none" : `opacity 0.7s ease ${delay + WORDMARK_DELAY + index * 0.05}s, transform 0.9s ${EASE} ${delay + WORDMARK_DELAY + index * 0.05}s`,
                }}
              />
            ))}
          </g>
        ) : null}
      </DrawableLogo>
    </span>
  );
}
