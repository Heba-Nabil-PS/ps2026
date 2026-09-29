"use client";

import { useContent } from "@/i18n/LocaleProvider";
import { useRichInteractions } from "@/lib/hooks";
import { ease, springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

type CursorVariant = "default" | "link" | "view" | "text";
type CursorState = { variant: CursorVariant; label: string };

const INTERACTIVE = "a, button, [role='button'], summary, label, select";
const TEXT_INPUT = "input, textarea, [contenteditable='true']";

const scaleFor: Record<CursorVariant, number> = {
  default: 0.14,
  link: 0.42,
  view: 1,
  text: 0,
};

/** Desktop-only cursor. Unmounted entirely on touch devices and with reduced motion. */
export function CustomCursor() {
  const enabled = useRichInteractions();
  return enabled ? <Cursor /> : null;
}

function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, springs.cursor);
  const springY = useSpring(y, springs.cursor);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CursorState>({ variant: "default", label: "" });
  const viewLabel = useContent().t.common.view;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      let next: CursorState = { variant: "default", label: "" };
      const custom = target?.closest<HTMLElement>("[data-cursor]");
      if (target?.closest(TEXT_INPUT)) next = { variant: "text", label: "" };
      else if (custom?.dataset.cursor === "view") next = { variant: "view", label: custom.dataset.cursorLabel ?? viewLabel };
      else if (target?.closest(INTERACTIVE)) next = { variant: "link", label: "" };
      setState((prev) => (prev.variant === next.variant && prev.label === next.label ? prev : next));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, viewLabel]);

  const isView = state.variant === "view";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        className={cn(
          "absolute -left-11 -top-11 h-22 w-22 rounded-full",
          isView ? "bg-accent shadow-[0_0_60px_10px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]" : "bg-fg mix-blend-difference",
        )}
        initial={false}
        animate={{ scale: visible ? scaleFor[state.variant] : 0 }}
        transition={{ duration: 0.5, ease: ease.expo }}
      />
      <AnimatePresence>
        {isView && visible ? (
          <motion.span
            key={state.label}
            className="text-label absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center font-medium leading-[1.3] text-bg"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: ease.expo }}
          >
            {state.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
