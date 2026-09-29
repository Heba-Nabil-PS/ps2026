"use client";

import type { StudioMedia } from "@/data/studioHome";
import { gsap, useGSAP } from "@/lib/gsap";
import Image from "next/image";
import { useRef } from "react";

type ReelMediaProps = {
  video?: string;
  slides: readonly StudioMedia[];
};

/**
 * Showreel surface. Plays a muted loop when `video` is set; otherwise
 * crossfades the slides with a slow push-in so the frame never feels static.
 */
export function ReelMedia({ video, slides }: ReelMediaProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (video || slides.length < 2) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-slide]");
        // Opacity only: visibility:hidden would stop the browser fetching the images.
        gsap.set(items, { opacity: 0 });
        gsap.set(items[0], { opacity: 1 });
        const tl = gsap.timeline({ repeat: -1 });
        items.forEach((item, index) => {
          const next = items[(index + 1) % items.length];
          tl.fromTo(item, { scale: 1.12 }, { scale: 1, duration: 3.6, ease: "none" }, index * 3)
            .set(next, { zIndex: index + 2 }, index * 3 + 2.4)
            .to(next, { opacity: 1, duration: 0.9, ease: "power2.inOut" }, index * 3 + 2.4)
            .set(item, { opacity: 0, zIndex: 1 }, index * 3 + 3.4);
        });
      });
    },
    { scope: root, dependencies: [video, slides.length] },
  );

  if (video) {
    return (
      <video
        className="absolute inset-0 size-full object-cover"
        src={video}
        poster={slides[0]?.image}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <div ref={root} className="absolute inset-0">
      {slides.map((slide, index) => (
        <div key={slide.image} data-slide className="absolute inset-0" style={{ zIndex: index === 0 ? 2 : 1 }}>
          <Image src={slide.image} alt={slide.alt} fill sizes="100vw" quality={85} className="object-cover" loading="eager" preload={index === 0} />
        </div>
      ))}
    </div>
  );
}
