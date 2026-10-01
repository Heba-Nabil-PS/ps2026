"use client";

import { RevealText } from "@/versions/main/portfolio/ui/RevealText";
import type { MediaRef } from "@/data/portfolio";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

/** Collage slots repeat for any number of images; each drifts at its own depth. */
const slots = [
  { className: "md:col-span-7", aspect: "aspect-[4/5]", speed: 6, sizes: "(min-width: 768px) 58vw, 100vw" },
  { className: "md:col-span-5 md:mt-[14vh]", aspect: "aspect-square", speed: -10, sizes: "(min-width: 768px) 42vw, 100vw" },
  { className: "md:col-span-8 md:col-start-3", aspect: "aspect-[16/10]", speed: 4, sizes: "(min-width: 768px) 66vw, 100vw" },
];

export function ProjectGallery({ title, images }: { title?: string; images: MediaRef[] }) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>("[data-item]", root.current).forEach((item) => {
        const speed = Number(item.dataset.speed);
        gsap.fromTo(
          item.querySelector("[data-frame]"),
          { clipPath: "inset(20% 0% 20% 0%)", opacity: 0.4 },
          { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.5, scrollTrigger: { trigger: item, start: "top 88%", once: true } },
        );
        gsap.fromTo(
          item,
          { yPercent: speed },
          { yPercent: -speed, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="gutter py-20 md:py-36">
      {title ? (
        <RevealText as="h2" className="text-label mb-12 text-muted md:mb-20">
          {title}
        </RevealText>
      ) : null}
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
        {images.map((image, i) => {
          const slot = slots[i % slots.length];
          return (
            <li key={`${image.src}-${i}`} data-item data-speed={slot.speed} className={cn("will-change-transform", slot.className)}>
              <div data-frame className={cn("relative overflow-hidden bg-surface", slot.aspect)}>
                <Image src={image.src} alt={image.alt} fill sizes={slot.sizes} className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-expo)] hover:scale-105" />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
