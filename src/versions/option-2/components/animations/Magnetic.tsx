"use client";

import { useRichInteractions } from "@/lib/hooks";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  /** 0–1: how far the element travels toward the pointer. */
  strength?: number;
  className?: string;
};

/** Pulls its child subtly toward the cursor. Inert on touch devices and with reduced motion. */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const enabled = useRichInteractions();
  const rect = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springs.magnetic);
  const springY = useSpring(y, springs.magnetic);

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x: springX, y: springY }}
      onPointerEnter={(event) => {
        if (enabled) rect.current = event.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(event) => {
        const bounds = rect.current;
        if (!enabled || !bounds || event.pointerType !== "mouse") return;
        x.set((event.clientX - (bounds.left + bounds.width / 2)) * strength);
        y.set((event.clientY - (bounds.top + bounds.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        rect.current = null;
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
