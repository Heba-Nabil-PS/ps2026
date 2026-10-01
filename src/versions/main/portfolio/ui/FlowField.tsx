"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { useEffect, useRef } from "react";

/**
 * The identity's visual element: continuous lines in layered, repeated
 * curves — "connected flow". Lines bundle and part around the cursor.
 *
 * Canvas 2D (no WebGL), DPR-capped, paused when off-screen or in a background
 * tab, and drawn as a single static frame for reduced-motion visitors.
 */
export function FlowField({
  className,
  lines = 26,
  center = 0.62,
  amplitude = 1,
}: {
  className?: string;
  lines?: number;
  /** Where the bundle runs, as a fraction of the canvas height. */
  center?: number;
  /** Scales the waves: below 1 keeps the bundle close to its centre line. */
  amplitude?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--color-accent").trim() || "#88bbd8";
    const soft = styles.getPropertyValue("--color-accent-soft").trim() || "#abcddd";

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      ctx.clearRect(0, 0, width, height);

      const t = time * 0.00012;
      const step = Math.max(10, width / 90);
      // By default the bundle sits low on the canvas, like the key visual's sweeping curve.
      const base = height * center;
      const spread = Math.min(height * 0.42, 340);

      for (let i = 0; i < lines; i++) {
        const n = i / (lines - 1 || 1);
        const offset = (n - 0.5) * spread;
        // Lines converge toward the middle of the bundle and fan out at the edges.
        const depth = 0.35 + Math.abs(n - 0.5) * 1.3;

        ctx.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const p = x / Math.max(width, 1);
          const wave =
            (Math.sin(p * 3.1 + t * 6 + n * 1.4) * 90 * depth +
              Math.sin(p * 6.4 - t * 4 + n * 2.6) * 34 * depth +
              Math.cos(p * 1.7 + t * 3) * 26) *
            amplitude;

          let y = base + offset * (0.55 + Math.sin(p * 2.2 + t * 5) * 0.5) + wave;

          // The cursor pushes the ribbon aside without breaking its continuity.
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            const force = (1 - dist / 260) ** 2;
            y += (dy / (dist || 1)) * force * 120;
          }

          if (x <= -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = i % 5 === 0 ? soft : accent;
        ctx.globalAlpha = 0.05 + (1 - Math.abs(n - 0.5) * 1.6) * 0.16;
        ctx.lineWidth = i % 5 === 0 ? 1.15 : 0.7;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      if (running) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) draw(0);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    intersection.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [lines, center, amplitude, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
