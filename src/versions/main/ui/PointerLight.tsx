"use client";

import { useRichInteractions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

/**
 * A soft sky light that sits behind reeded glass and follows the pointer
 * (the moodboard's hand-behind-glass tile, made interactive). Drop it into
 * the background layer of any section: it tracks the pointer across its
 * nearest <section>, so server components can use it too. Rests at `rest`
 * on touch devices and with reduced motion.
 */
export function PointerLight({ className, rest = { x: 72, y: 30 } }: { className?: string; rest?: { x: number; y: number } }) {
  const light = useRef<HTMLDivElement>(null);
  const rich = useRichInteractions();

  useEffect(() => {
    const el = light.current;
    const area = el?.closest("section");
    if (!el || !area || !rich) return;
    const onMove = (event: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      el.style.setProperty("--lx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--ly", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    };
    area.addEventListener("pointermove", onMove, { passive: true });
    return () => area.removeEventListener("pointermove", onMove);
  }, [rich]);

  return (
    <div
      ref={light}
      aria-hidden
      className={cn("absolute inset-0 bg-[radial-gradient(38%_55%_at_var(--lx)_var(--ly),rgb(140_196_230/0.55),transparent_70%)] transition-[background] duration-300", className)}
      style={{ ["--lx" as string]: `${rest.x}%`, ["--ly" as string]: `${rest.y}%` }}
    />
  );
}
