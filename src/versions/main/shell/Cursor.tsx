"use client";

import { useRichInteractions } from "@/lib/hooks";
import { ease, springs } from "@/lib/motion";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * A small light that follows the pointer. Over anything marked
 * `data-cursor="Label"` it opens into a frosted lens carrying the label
 * ("View" on work). Fine pointers only; the system cursor stays visible.
 */
export function Cursor() {
  const enabled = useRichInteractions();
  const x = useSpring(useMotionValue(-100), springs.cursor);
  const y = useSpring(useMotionValue(-100), springs.cursor);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-70" style={{ x, y }}>
      <motion.div
        className="glass -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ width: label ? 104 : 10, height: label ? 104 : 10, opacity: visible ? 1 : 0, backgroundColor: label ? "rgba(140,196,230,0.16)" : "rgba(140,196,230,0.9)" }}
        transition={{ duration: 0.5, ease: ease.expo }}
      >
        <AnimatePresence>
          {label ? (
            <motion.span
              key={label}
              className="text-label absolute inset-0 grid place-items-center whitespace-pre-line text-center text-[0.625rem] text-fg"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.4, ease: ease.expo }}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
