"use client";

import type { MediaRef } from "@/data/portfolio";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

type ParallaxMediaProps = {
  image: MediaRef;
  sizes: string;
  /** Frame sizing (aspect ratio / height). */
  className?: string;
  /** Scroll travel as a percentage of the frame, e.g. 10. */
  speed?: number;
  /** Start slightly zoomed and settle while scrolling through. */
  zoom?: boolean;
  tone?: string;
};

/** Image inside a clipped frame that drifts against the scroll direction. */
export function ParallaxMedia({ image, sizes, className, speed = 8, zoom = false, tone }: ParallaxMediaProps) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const layer = frame.current?.querySelector("[data-layer]");
      if (reduced || !layer) return;
      gsap.fromTo(
        layer,
        { yPercent: -speed, scale: zoom ? 1.18 : 1 },
        {
          yPercent: speed,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: frame, dependencies: [reduced, speed, zoom], revertOnUpdate: true },
  );

  return (
    <div ref={frame} className={cn("relative overflow-hidden bg-surface", className)} style={tone ? { backgroundColor: tone } : undefined}>
      <div data-layer className="absolute inset-x-0 will-change-transform" style={{ top: `-${speed}%`, bottom: `-${speed}%` }}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
