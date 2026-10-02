"use client";

import { useContent } from "@/versions/main/portfolio/content";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

/** Listing title: letters rise into place and ripple toward the cursor. */
export function RippleTitle({ title }: { title: string }) {
  const root = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const rich = useRichInteractions();
  const { locale } = useContent();
  // Arabic letters join, so the ripple moves whole words there instead of single letters.
  const letters = locale === "ar" ? title.split(" ").flatMap((word, i) => (i ? [" ", word] : [word])) : Array.from(title);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reduced) return;

      gsap.from(q("[data-char]"), { yPercent: 120, rotate: 6, duration: 1.5, stagger: 0.045, ease: "expo.out", delay: 0.15 });

      if (!rich) return;
      const chars = q("[data-char-wrap]");
      const charY = chars.map((el) => gsap.quickTo(el, "y", { duration: 1, ease: "power3" }));

      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth;
        chars.forEach((el, i) => {
          const center = (i + 0.5) / chars.length;
          const proximity = Math.max(0, 1 - Math.abs(center - nx) * 3.2);
          charY[i](-proximity * 26);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [reduced, rich], revertOnUpdate: true },
  );

  return (
    <h1 ref={root} className="stretch text-display">
      <span className="sr-only">{title}</span>
      <span aria-hidden data-chars className="flex">
        {letters.map((char, i) => (
          <span key={i} data-char-wrap className="inline-block will-change-transform">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-char className="inline-block">
                {char}
              </span>
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}
