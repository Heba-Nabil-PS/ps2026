"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { LazyVideo } from "@/versions/main/portfolio/ui/LazyVideo";
import { useRef } from "react";

type ProjectFullWidthVideoProps = { src: string; label: string; caption?: string };

/** Full-bleed muted film that opens from a framed inset to edge-to-edge as it scrolls in, then drifts as it leaves. */
export function ProjectFullWidthVideo({ src, label, caption }: ProjectFullWidthVideoProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true } })
        .fromTo(q("[data-frame]"), { clipPath: "inset(8% 10% 8% 10% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
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
    <figure ref={root} className="relative py-6 md:py-10">
      <div data-frame className="relative h-[70svh] overflow-hidden bg-surface md:h-[100svh]">
        <div data-layer className="absolute inset-0 will-change-transform">
          <LazyVideo src={src} label={label} className="object-cover" />
        </div>
      </div>
      {caption ? <figcaption className="gutter text-label mt-5 text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
