"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { usePageReady } from "@/components/animations/PageTransition";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useInView, useScroll, useTransform, type MotionStyle } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

const hiddenClip: Record<Direction, string> = {
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 0% 0% 100%)",
  right: "inset(0% 100% 0% 0%)",
};
const shownClip = "inset(0% 0% 0% 0%)";

type ImageRevealProps = {
  src: string;
  alt: string;
  sizes: string;
  /** Sizing (aspect ratio / height) of the frame. */
  className?: string;
  direction?: Direction;
  /** Scroll parallax strength as a fraction of frame height, e.g. 0.1. 0 disables it. */
  parallax?: number;
  delay?: number;
  preload?: boolean;
  /** Optional video — the image becomes its poster. */
  video?: string;
  /** Tone shown while media loads. */
  tone?: string;
  /** Extra motion styles for the media layer (hover scale, cursor follow…). */
  mediaStyle?: MotionStyle;
  mediaClassName?: string;
  children?: ReactNode;
};

/** Media that is uncovered by a directional mask while it settles from a slight zoom. */
export function ImageReveal({
  src,
  alt,
  sizes,
  className,
  direction = "up",
  parallax = 0,
  delay = 0,
  preload = false,
  video,
  tone,
  mediaStyle,
  mediaClassName,
  children,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const ready = usePageReady();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = ready && inView;

  const strength = reduced ? 0 : parallax;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-strength * 100}%`, `${strength * 100}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} style={tone ? { backgroundColor: tone } : undefined}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: hiddenClip[direction], opacity: 1 }}
        animate={
          reduced
            ? // Reduced motion: no wipe, just a quiet fade once visible.
              { clipPath: show ? shownClip : hiddenClip[direction], opacity: show ? [0, 1] : 1 }
            : { clipPath: show ? shownClip : hiddenClip[direction], opacity: 1 }
        }
        transition={
          reduced
            ? { clipPath: { duration: 0 }, opacity: { duration: 0.6, ease: "linear" } }
            : { duration: 1.3, ease: ease.expo, delay }
        }
      >
        <motion.div
          className="absolute inset-x-0"
          style={{ y: strength ? y : 0, top: `${-strength * 100}%`, bottom: `${-strength * 100}%` }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.25 }}
            animate={{ scale: show || reduced ? 1 : 1.25 }}
            transition={reduced ? { duration: 0 } : { duration: 1.6, ease: ease.expo, delay }}
          >
            <motion.div className={cn("absolute inset-0 will-change-transform", mediaClassName)} style={mediaStyle}>
              {video ? (
                <LazyVideo src={video} poster={src} label={alt} />
              ) : (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes={sizes}
                  preload={preload}
                  loading={preload ? "eager" : "lazy"}
                  className="object-cover"
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
