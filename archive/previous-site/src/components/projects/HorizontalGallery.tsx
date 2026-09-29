"use client";

import { ImageReveal } from "@/components/animations/ImageReveal";
import { useDirectionSign } from "@/i18n/LocaleProvider";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GalleryImage = { src: string; alt: string };

const frameClass = ["aspect-[4/3] h-[62vh]", "aspect-[4/5] h-[72vh]", "aspect-square h-[56vh]", "aspect-[16/10] h-[64vh]"];

/**
 * Desktop: vertical scroll drives a pinned horizontal track.
 * Touch / narrow screens: native swipeable scroll-snap strip.
 * Reduced motion: simple stacked images.
 */
export function HorizontalGallery({ images, tone }: { images: GalleryImage[]; tone: string }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div className="gutter grid grid-cols-1 gap-6 md:grid-cols-2">
        {images.map((image) => (
          <ImageReveal key={image.src} src={image.src} alt={image.alt} sizes="(min-width: 768px) 50vw, 100vw" tone={tone} className="aspect-[4/5]" />
        ))}
      </div>
    );
  }

  if (!wide) {
    return (
      <ul className="gutter flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none]" data-lenis-prevent-horizontal>
        {images.map((image) => (
          <li key={image.src} className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center overflow-hidden" style={{ backgroundColor: tone }}>
            <Image src={image.src} alt={image.alt} fill sizes="82vw" className="object-cover" />
          </li>
        ))}
      </ul>
    );
  }

  return <PinnedTrack images={images} tone={tone} />;
}

function PinnedTrack({ images, tone }: { images: GalleryImage[]; tone: string }) {
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
            <li key={image.src} className={cn("relative shrink-0 overflow-hidden", frameClass[i % frameClass.length])} style={{ backgroundColor: tone }}>
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
