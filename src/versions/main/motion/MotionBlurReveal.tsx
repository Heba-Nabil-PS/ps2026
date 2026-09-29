"use client";

import { useDirectionSign } from "@/i18n/locale-context";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useId, useRef, type ReactNode } from "react";
import { motionGate, showNow } from "./useMotionGate";

/**
 * Movement as motion blur (principle P3). The frame wipes open along the
 * reading direction while a horizontal-only blur resolves to sharp, like the
 * walking figures in the moodboard. The SVG filter is removed once settled,
 * so it costs nothing after the reveal.
 */
export function MotionBlurReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const filterId = `mb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sign = useDirectionSign();

  useGSAP(
    () => {
      const el = root.current;
      const node = blur.current;
      if (!el || !node) return;
      const media = el.querySelector<HTMLElement>("[data-media]") ?? el;

      return motionGate(
        () => {
          const hidden = sign > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
          gsap.set(el, { autoAlpha: 1, clipPath: hidden });
          gsap.set(media, { filter: `url(#${filterId})`, xPercent: -6 * sign, scale: 1.12 });
          gsap.set(node, { attr: { stdDeviation: "48 0" } });

          const tl = gsap.timeline({
            delay,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onComplete: () => gsap.set(media, { clearProps: "filter" }),
          });
          tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut" }, 0)
            .to(media, { xPercent: 0, scale: 1, duration: 1.8, ease: "expo.out" }, 0.1)
            .to(node, { attr: { stdDeviation: "0 0" }, duration: 1.5, ease: "expo.out" }, 0.25);
        },
        () => showNow(el),
      );
    },
    { scope: root, dependencies: [sign, delay] },
  );

  return (
    <div ref={root} data-reveal className={cn("relative overflow-hidden", className)}>
      <svg aria-hidden className="absolute size-0" focusable="false">
        <filter id={filterId} x="-20%" y="0" width="140%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blur} stdDeviation="0 0" />
        </filter>
      </svg>
      {children}
    </div>
  );
}
