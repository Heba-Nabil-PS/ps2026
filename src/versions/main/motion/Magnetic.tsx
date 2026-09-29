"use client";

import { useRichInteractions } from "@/lib/hooks";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

/** Pulls its child gently toward the pointer. Fine pointers only, never with reduced motion. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRichInteractions();
  const x = useSpring(useMotionValue(0), springs.magnetic);
  const y = useSpring(useMotionValue(0), springs.magnetic);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={enabled ? { x, y } : undefined} className={cn("inline-flex", className)}>
      {children}
    </motion.div>
  );
}
