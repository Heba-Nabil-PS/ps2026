"use client";

import { useLocale } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { cn, type TextComponent, type TextTag } from "@/lib/utils";
import { useRef, type HTMLAttributes, type ReactNode } from "react";

type SplitRevealProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  as?: TextTag;
  className?: string;
  /** Unit that animates. Lines and words rise out of masks; chars also rotate in. */
  type?: "lines" | "words" | "chars";
  /** "scroll" plays on viewport entry; "manual" plays when `play` turns true. */
  trigger?: "scroll" | "manual";
  play?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
};

/**
 * Masked text reveal built on GSAP SplitText. Splits after fonts load and
 * re-splits on resize (autoSplit), so line breaks always match the layout.
 * With reduced motion the text is simply shown.
 */
export function SplitReveal({
  children,
  as: tag = "div",
  className,
  type: requestedType = "lines",
  trigger = "scroll",
  play = true,
  delay = 0,
  stagger,
  duration = 1.2,
  ...rest
}: SplitRevealProps) {
  // Arabic letters join; splitting them into separate boxes breaks the script, so animate words instead.
  const type = useLocale() === "ar" && requestedType === "chars" ? "words" : requestedType;
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as unknown as TextComponent;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const shouldPlay = trigger === "scroll" || play;
      const split = SplitText.create(el, {
        type: type === "chars" ? "lines,words,chars" : type === "words" ? "lines,words" : "lines",
        mask: type === "chars" ? "words" : "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          const targets = type === "chars" ? self.chars : type === "words" ? self.words : self.lines;
          gsap.set(el, { autoAlpha: 1 });
          const from = {
            yPercent: type === "chars" ? 110 : 115,
            rotate: type === "chars" ? 8 : 0,
          };
          if (!shouldPlay) {
            gsap.set(targets, from);
            return;
          }
          const tween = gsap.from(targets, {
            ...from,
            duration,
            delay,
            ease: "expo.out",
            stagger: stagger ?? (type === "chars" ? 0.025 : type === "words" ? 0.04 : 0.09),
            paused: trigger === "scroll",
          });
          if (trigger === "scroll") {
            ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => tween.play() });
          }
          return tween;
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [play, trigger, type, delay], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={cn("split-reveal", className)} {...rest}>
      {children}
    </Tag>
  );
}
