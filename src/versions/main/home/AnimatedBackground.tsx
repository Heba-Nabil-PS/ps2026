"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

/** Number of lines in the field. */
const LINES = 28;
/** Horizontal step between points along each line, in CSS pixels. */
const STEP = 22;
/** Where the lines pinch together, as a fraction of the width (the "pen" the flow runs through). */
const WAIST_X = 0.68;
/** Line colour (the brand sky, --color-sky) as RGB. */
const SKY = "140, 196, 230";

/**
 * The home hero's living background: a field of fine lines that flow through a
 * single waist, like the continuous stroke of the PSdigital logo. Each line is
 * a sum of slow sine waves, so the loop never visibly repeats.
 *
 * Canvas 2D, capped device pixel ratio, paused while off screen or while the tab
 * is hidden, and drawn once (still) when the visitor prefers reduced motion. The
 * waist leans gently towards the pointer.
 */
export function AnimatedBackground({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let time = 0;
    let last = performance.now();
    // Pointer influence, eased so the field drifts instead of snapping.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const centre = height * 0.52 + pointer.y * height * 0.06;
      const waist = width * (WAIST_X + pointer.x * 0.03);
      // Tied to the width as well, so tall narrow screens fan out gently instead of into a sharp V.
      const gap = Math.min(Math.max(height, 520), width * 0.9) / LINES;

      for (let i = 0; i < LINES; i++) {
        const offset = i - (LINES - 1) / 2;
        const phase = i * 0.37;
        // Lines near the middle of the bundle are brighter; one runs as the accent.
        const accent = i === Math.floor(LINES / 2) + 3;
        const alpha = accent ? 0.55 : 0.05 + 0.16 * (1 - Math.abs(offset) / (LINES / 2));

        ctx.beginPath();
        for (let x = -STEP; x <= width + STEP; x += STEP) {
          const u = (x - waist) / width;
          // Tight at the waist, fanning open towards both edges.
          const spread = 0.12 + 2.1 * Math.pow(Math.abs(u), 1.25);
          const wave =
            Math.sin(x * 0.0042 + time * 0.22 + phase) * 26 +
            Math.sin(x * 0.0017 - time * 0.13 + phase * 1.7) * 44 +
            Math.sin(x * 0.009 + time * 0.31 + i) * 6 * spread;
          const y = centre + offset * gap * spread + wave * Math.min(1, 0.25 + spread);
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${SKY}, ${alpha})`;
        ctx.lineWidth = accent ? 1.4 : 1;
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      // Clamp the step so a background tab does not jump the flow when it returns.
      time += Math.min(now - last, 50) / 1000;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced || frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    draw();
    setReady(true);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(el);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(el);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (event: PointerEvent) => {
      pointer.tx = event.clientX / window.innerWidth - 0.5;
      pointer.ty = event.clientY / window.innerHeight - 0.5;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    start();
    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn("pointer-events-none size-full transition-opacity duration-[1.6s] ease-out", ready ? "opacity-100" : "opacity-0", className)}
    />
  );
}
