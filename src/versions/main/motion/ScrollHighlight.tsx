"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Fragment, useRef } from "react";
import { motionGate } from "./useMotionGate";

/**
 * A statement that lights up word by word as it is read. Scrubbed to scroll,
 * so scrolling back dims it again. Words, never characters — safe for Arabic.
 */
export function ScrollHighlight({ text, className, highlight = [] }: { text: string; className?: string; highlight?: readonly string[] }) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const isKey = (word: string) => highlight.some((key) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") === key.toLowerCase());

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return motionGate(() => {
        gsap.fromTo(
          el.querySelectorAll("[data-word]"),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.8 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <p ref={root} className={cn(className)}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span data-word className={cn(isKey(word) && "text-sky")}>
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
