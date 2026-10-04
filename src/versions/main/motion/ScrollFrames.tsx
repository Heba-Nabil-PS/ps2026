"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { motionGate } from "./useMotionGate";

/**
 * A video played as a frame sequence scrubbed to scroll: scrolling down plays
 * it forward, scrolling up plays it back. Frames are drawn to a canvas (cover
 * fit) and only start loading as the block nears the viewport. With reduced
 * motion the last frame is shown still.
 *
 * Frames live at `${path}/001.webp` … `${path}/${count}.webp`.
 */
export function ScrollFrames({
  path,
  count,
  className,
  start = "top 85%",
  end = "bottom 25%",
}: {
  path: string;
  count: number;
  className?: string;
  start?: string;
  end?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const src = (index: number) => `${path}/${String(index + 1).padStart(3, "0")}.webp`;
      const frames: (HTMLImageElement | undefined)[] = new Array(count);
      let current = 0;
      let drawn = -1;

      // Nearest frame at or before `index` that has finished loading.
      const ready = (index: number) => {
        for (let i = index; i >= 0; i--) if (frames[i]?.complete && frames[i]!.naturalWidth) return frames[i];
        return undefined;
      };

      const draw = (force = false) => {
        const index = Math.round(current);
        if (index === drawn && !force) return;
        const img = ready(index);
        if (!img) return;
        drawn = index;
        const { width, height } = canvas;
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        draw(true);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      const load = (index: number) => {
        if (frames[index]) return;
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (Math.abs(index - Math.round(current)) <= 1 || drawn < 0) draw(true);
        };
        img.src = src(index);
        frames[index] = img;
      };

      // Load the frame on screen first, then the rest in order.
      const loadAll = (first: number) => {
        load(first);
        for (let i = 0; i < count; i++) load(i);
      };

      let loading = false;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || loading) return;
          loading = true;
          observer.disconnect();
          loadAll(Math.round(current));
        },
        { rootMargin: "100% 0px" },
      );
      observer.observe(canvas);

      const revert = motionGate(
        () => {
          const state = { frame: 0 };
          current = 0;
          draw(true);
          gsap.to(state, {
            frame: count - 1,
            ease: "none",
            scrollTrigger: { trigger: canvas, start, end, scrub: 0.5 },
            onUpdate: () => {
              current = state.frame;
              draw();
            },
          });
        },
        () => {
          current = count - 1;
          draw(true);
        },
      );

      return () => {
        revert();
        observer.disconnect();
        resizeObserver.disconnect();
      };
    },
    { dependencies: [path, count, start, end] },
  );

  return <canvas ref={canvasRef} data-media aria-hidden className={cn("block size-full", className)} />;
}
