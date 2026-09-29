"use client";

import type { MediaRef } from "@/data/portfolio";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import Image from "next/image";
import { useRef } from "react";

/** Full-bleed image that opens from a framed inset to edge-to-edge as it scrolls in. */
export function ProjectFullWidthImage({ image, caption }: { image: MediaRef; caption?: string }) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true } })
        .fromTo(q("[data-frame]"), { clipPath: "inset(6% 7% 6% 7%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
        .fromTo(q("[data-layer]"), { scale: 1.3 }, { scale: 1, ease: "none" }, 0);
      gsap.to(q("[data-layer]"), {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <figure ref={root} className="relative py-10">
      <div data-frame className="relative h-[70svh] overflow-hidden bg-surface md:h-[100svh]">
        <div data-layer className="absolute inset-0 will-change-transform">
          <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
        </div>
      </div>
      {caption ? <figcaption className="gutter text-label mt-5 text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
