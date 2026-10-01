"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { motionGate } from "./useMotionGate";

/**
 * Oversized words that drift sideways as the page scrolls: solid and outlined
 * in turn, each followed by a sky square. Decorative, so hidden from assistive tech.
 * `speed` 1 travels a quarter of the row while the band crosses the screen.
 */
export function WordMarquee({ items, speed = 1, className }: { items: readonly string[]; speed?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () =>
      motionGate(() => {
        gsap.fromTo(
          track.current,
          { xPercent: 0 },
          {
            xPercent: -25 * speed,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      }),
    { scope: root, dependencies: [speed] },
  );

  return (
    <div ref={root} aria-hidden className={cn("overflow-hidden", className)}>
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={i % 2 ? "text-outline" : "text-fg"}>{item}</span>
            <span className="mx-[0.25em] inline-block size-[0.18em] bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
