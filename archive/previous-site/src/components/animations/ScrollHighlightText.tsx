"use client";

import type { TextComponent, TextTag } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

type ScrollHighlightTextProps = {
  children: string;
  as?: TextTag;
  className?: string;
};

/** Words brighten one after another as the paragraph travels through the viewport. */
export function ScrollHighlightText({ children, as: tag = "p", className }: ScrollHighlightTextProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as unknown as TextComponent;
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = children.split(" ");

  if (reduced) {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </Tag>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
