"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ScrollMarqueeProps = {
  items: readonly string[];
  /** Positive moves left while scrolling down, negative moves right. */
  speed?: number;
  className?: string;
};

/** Oversized decorative type that drifts horizontally with scroll. */
export function ScrollMarquee({ items, speed = 1, className }: ScrollMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `${-25 * speed}%`]);

  return (
    <div ref={ref} aria-hidden className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max whitespace-nowrap will-change-transform"
        style={{ x: reduced ? 0 : x, marginLeft: speed < 0 ? "-25%" : undefined }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={cn(i % 2 ? "text-outline" : "text-fg")}>{item}</span>
            <span className="mx-[0.25em] inline-block size-[0.18em] bg-accent" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
