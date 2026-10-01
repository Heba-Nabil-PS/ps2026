"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

/** When the slideshows' shared clock started (seconds on GSAP's ticker). */
let clockStart: number | null = null;

/**
 * The showreel's slideshow, for any frame: the slides crossfade with a slow
 * push-in, as in Showreel, so the frame never feels static. It only runs while
 * the frame is on screen, on a clock shared by every slideshow; with reduced
 * motion the first slide simply stands.
 */
export function ReelSlides({ slides, sizes, className }: { slides: readonly { image: string; alt: string }[]; sizes: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || slides.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-slide]", el);
        // Opacity only: visibility:hidden would stop the browser fetching the images.
        gsap.set(items, { opacity: 0 });
        gsap.set(items[0], { opacity: 1 });
        const loop = gsap.timeline({ repeat: -1, paused: true });
        items.forEach((item, index) => {
          const next = items[(index + 1) % items.length];
          loop
            .fromTo(item, { scale: 1.12 }, { scale: 1, duration: 3.6, ease: "none" }, index * 3)
            .set(next, { zIndex: index + 2 }, index * 3 + 2.4)
            .to(next, { opacity: 1, duration: 0.9, ease: "power2.inOut" }, index * 3 + 2.4)
            .set(item, { opacity: 0, zIndex: 1 }, index * 3 + 3.4);
        });
        // Every slideshow keeps to one shared clock, so two frames showing the same reel (the positioning frame
        // handing over to the showreel) are always on the same slide at the same moment.
        // The clock starts the first time any of them is seen, so the reel always opens on its first slide.
        const resume = () => {
          clockStart ??= gsap.ticker.time;
          loop.time((gsap.ticker.time - clockStart) % loop.duration()).play();
        };
        // The section, not the frame: a sticky frame's own box would read as gone while it is still pinned on screen.
        ScrollTrigger.create({ trigger: el.closest("section") ?? el, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? resume() : loop.pause()) });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [slides.length] },
  );

  return (
    <div ref={root} data-media className={cn("absolute inset-0", className)}>
      {slides.map((slide, index) => (
        <div key={slide.image} data-slide className="absolute inset-0 will-change-transform" style={{ zIndex: index === 0 ? 2 : 1 }}>
          <Image src={slide.image} alt={slide.alt} fill sizes={sizes} quality={80} className="object-cover" />
        </div>
      ))}
    </div>
  );
}
