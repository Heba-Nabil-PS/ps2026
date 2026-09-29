"use client";

import { usePageReady } from "@/components/animations/PageTransition";
import { useLocale } from "@/i18n/LocaleProvider";
import { duration, ease } from "@/lib/motion";
import { cn, toLines, type TextComponent, type TextTag } from "@/lib/utils";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

type RevealMode = "lines" | "words" | "chars";

type RevealTextProps = {
  /** Use "\n" to break lines. */
  children: string;
  as?: TextTag;
  id?: string;
  mode?: RevealMode;
  delay?: number;
  stagger?: number;
  className?: string;
  lineClassName?: string;
  /** Reveal immediately once the page is ready instead of waiting for viewport entry. */
  immediate?: boolean;
};

const unit: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (delay: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      y: { duration: duration.slow, ease: ease.expo, delay },
      opacity: { duration: duration.base * 0.6, ease: "linear", delay },
    },
  }),
};

const defaultStagger: Record<RevealMode, number> = { lines: 0.09, words: 0.035, chars: 0.018 };

/**
 * Text that rises out of clipped masks. Screen readers get the plain text once;
 * the animated fragments are aria-hidden.
 */
export function RevealText({
  children,
  as: tag = "p",
  id,
  mode: requestedMode = "lines",
  delay = 0,
  stagger,
  className,
  lineClassName,
  immediate = false,
}: RevealTextProps) {
  // Arabic letters join; splitting them into separate boxes breaks the script, so animate words instead.
  const mode = useLocale() === "ar" && requestedMode === "chars" ? "words" : requestedMode;
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as unknown as TextComponent;
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const ready = usePageReady();
  const show = ready && (immediate || inView);
  const step = stagger ?? defaultStagger[mode];
  const lines = toLines(children);

  let index = 0;
  const animated = (content: string, key: string, inline: boolean) => (
    <span key={key} className={cn("overflow-hidden pb-[0.1em] -mb-[0.1em]", inline ? "inline-block align-top" : "block")}>
      <motion.span
        className={cn("will-change-transform", inline ? "inline-block" : "block")}
        variants={unit}
        initial="hidden"
        animate={show ? "visible" : "hidden"}
        custom={delay + index++ * step}
      >
        {content}
      </motion.span>
    </span>
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden className="block">
        {lines.map((line, li) => (
          <span key={li} className={cn("block", lineClassName)}>
            {mode === "lines"
              ? animated(line, `l${li}`, false)
              : line.split(" ").map((word, wi) => (
                  <span key={wi} className="inline-block whitespace-nowrap">
                    {mode === "words"
                      ? animated(word, `w${wi}`, true)
                      : Array.from(word).map((char, ci) => animated(char, `c${ci}`, true))}
                    {wi < line.split(" ").length - 1 ? " " : null}
                  </span>
                ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
