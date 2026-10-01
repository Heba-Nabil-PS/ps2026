"use client";

import type { MediaRef } from "@/data/portfolio";
import { useDirectionSign } from "@/versions/main/portfolio/content";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const frameClass = ["aspect-[4/3] h-[62vh]", "aspect-[4/5] h-[72vh]", "aspect-square h-[56vh]", "aspect-[16/10] h-[64vh]"];

/**
 * The project's visuals as one horizontal strip (the option-2 case-study gallery).
 * Desktop: vertical scroll drives a pinned horizontal track.
 * Touch / narrow screens: native swipeable scroll-snap strip.
 * Reduced motion: simple stacked images.
 */
export function ProjectHorizontalGallery({ images, tone, label }: { images: MediaRef[]; tone: string; label: string }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const reduced = usePrefersReducedMotion();

  let body;
  if (reduced) {
    body = (
      <ul className="gutter grid grid-cols-1 gap-6 md:grid-cols-2">
        {images.map((image) => (
          <li key={image.src} className="relative aspect-[4/5] overflow-hidden rounded-card" style={{ backgroundColor: tone }}>
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </li>
        ))}
      </ul>
    );
  } else if (!wide) {
    body = (
      <ul className="gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none]" data-lenis-prevent-horizontal>
        {images.map((image) => (
          <li key={image.src} className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center overflow-hidden rounded-card" style={{ backgroundColor: tone }}>
            <Image src={image.src} alt={image.alt} fill sizes="82vw" className="object-cover" />
          </li>
        ))}
      </ul>
    );
  } else {
    body = <PinnedTrack images={images} tone={tone} />;
  }

  return (
    <section aria-label={label} className="py-16 md:py-0">
      {body}
    </section>
  );
}

function PinnedTrack({ images, tone }: { images: MediaRef[]; tone: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);
  // The track overflows toward the inline end: left in LTR, right in RTL.
  const sign = useDirectionSign();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance * sign]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.ul ref={trackRef} className="gutter flex w-max items-center gap-8 will-change-transform" style={{ x }}>
          {images.map((image, i) => (
            <li key={image.src} className={cn("relative shrink-0 overflow-hidden rounded-card", frameClass[i % frameClass.length])} style={{ backgroundColor: tone }}>
              <Image src={image.src} alt={image.alt} fill sizes="60vw" className="object-cover" />
            </li>
          ))}
        </motion.ul>
        <div className="gutter mt-10">
          <div className="h-px w-full bg-line">
            <motion.div className="h-px bg-fg" style={{ width: progress }} />
          </div>
        </div>
      </div>
    </div>
  );
}
