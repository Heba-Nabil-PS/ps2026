"use client";

import { useLocale } from "@/i18n/locale-context";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef, type CSSProperties } from "react";
import { motionGate, showNow } from "./useMotionGate";

type Tag = "h1" | "h2" | "h3" | "p";

type StretchHeadingProps = {
  as?: Tag;
  /** One entry per line. */
  lines: readonly string[];
  className?: string;
  /** Per-line classes by index, e.g. to indent the second line. Serializable, so Server Components can pass it. */
  lineClassNames?: readonly (string | undefined)[];
  /** Play on mount (after `delay`) instead of when scrolled into view. */
  immediate?: boolean;
  delay?: number;
  /** Final width-axis value (50 condensed → 150 extended). */
  width?: number;
};

/**
 * The stretched voice (principle P4). Each line rises out of a mask while the
 * face widens from condensed to extended, so headlines "stretch into place".
 * Arabic has no width axis: lines only rise.
 */
export function StretchHeading({ as: Component = "h2", lines, className, lineClassNames, immediate = false, delay = 0, width = 125 }: StretchHeadingProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const isAr = useLocale() === "ar";

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const inner = el.querySelectorAll<HTMLElement>("[data-line]");

      return motionGate(
        () => {
          gsap.set(el, { autoAlpha: 1 });
          const tl = gsap.timeline({
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          });
          tl.fromTo(inner, { yPercent: 115, rotate: isAr ? 0 : 2.5 }, { yPercent: 0, rotate: 0, duration: 1.5, ease: "expo.out", stagger: 0.09 }, 0);
          if (!isAr) {
            tl.fromTo(inner, { "--wdth": 58 }, { "--wdth": width, duration: 1.9, ease: "expo.out", stagger: 0.09 }, 0.05);
          }
        },
        () => showNow(el),
      );
    },
    { scope: root, dependencies: [isAr, immediate, delay, width] },
  );

  return (
    <Component ref={root} data-reveal className={cn("stretch", className)} style={{ "--wdth": width } as CSSProperties}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pb-[0.1em] -mb-[0.04em]">
          <span data-line className={cn("block origin-bottom-left will-change-transform rtl:origin-bottom-right", lineClassNames?.[index])}>
            {line}
          </span>
        </span>
      ))}
    </Component>
  );
}
