"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { usePageReady } from "@/components/animations/PageTransition";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type HeroMediaCycleProps = {
  images: { src: string; alt: string }[];
  sizes: string;
  className?: string;
};

/** A frame that cycles through recent work (inline in the headline on desktop, full-width on mobile). */
export function HeroMediaCycle({ images, sizes, className }: HeroMediaCycleProps) {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  const ready = usePageReady();

  useEffect(() => {
    if (reduced || images.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % images.length), 1800);
    return () => window.clearInterval(id);
  }, [images.length, reduced]);

  const current = images[index];

  return (
    <motion.span
      aria-hidden
      className={cn("relative inline-block overflow-hidden bg-surface align-middle", className)}
      initial={{ clipPath: "inset(0% 50% 0% 50%)" }}
      animate={{ clipPath: ready ? "inset(0% 0% 0% 0%)" : "inset(0% 50% 0% 50%)" }}
      transition={{ duration: 1.2, ease: ease.expo, delay: 0.55 }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={current.src}
          className="absolute inset-0"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: ease.expo }}
        >
          <Image src={current.src} alt="" fill sizes={sizes} className="object-cover" />
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
