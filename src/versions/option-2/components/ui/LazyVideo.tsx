"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { useEffect, useRef } from "react";

type LazyVideoProps = {
  src: string;
  /** Omit when the video sits over an image that already acts as the poster. */
  poster?: string;
  label: string;
};

/**
 * Muted, inline video that only downloads and plays while on screen.
 * Reduced-motion visitors see the poster frame.
 */
export function LazyVideo({ src, poster, label }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) video.src = src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, reduced]);

  return (
    <video
      ref={ref}
      poster={poster}
      aria-label={label}
      className="absolute inset-0 h-full w-full"
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
