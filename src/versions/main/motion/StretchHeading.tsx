"use client";

import { useLocale } from "@/i18n/locale-context";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { createContext, useContext, useRef, type CSSProperties, type ReactNode } from "react";
import { PULL, stretchLetterOf, StretchText, stretchTo } from "./StretchLetter";
import { motionGate, showNow } from "./useMotionGate";

const SectionTitlesStretch = createContext(false);

/**
 * Section titles inside it stretch a letter the way banner titles do, tied to the
 * scroll: the letter pulls out as its title comes up the screen and goes back in
 * when the title is scrolled back down. The home page wraps its sections in it.
 */
export function StretchSectionTitles({ children }: { children: ReactNode }) {
  return <SectionTitlesStretch value>{children}</SectionTitlesStretch>;
}

/**
 * For a title that plays its entrance on its own (a banner or the home hero, not on scroll): once the title
 * has been scrolled away, most of it past the top of the screen or all of it below the bottom, `replay` runs
 * when it comes back, so each return plays the entrance as the first time did.
 */
export function replayOnReturn(trigger: Element, replay: () => void) {
  let away = false;
  const leave = () => {
    away = true;
  };
  const back = () => {
    if (!away) return;
    away = false;
    replay();
  };
  return ScrollTrigger.create({ trigger, start: "top bottom", end: "bottom 20%", onLeave: leave, onLeaveBack: leave, onEnter: back, onEnterBack: back });
}

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
 *
 * As an h1 it is the page's banner title: once the lines have landed one letter, an E where the title has one, pulls out long
 * (see StretchLetter). Section titles do the same inside StretchSectionTitles.
 */
export function StretchHeading({ as: Component = "h2", lines, className, lineClassNames, immediate = false, delay = 0, width = 125 }: StretchHeadingProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const isAr = useLocale() === "ar";
  const stretches = useContext(SectionTitlesStretch) || Component === "h1";
  const letter = stretches && !isAr ? stretchLetterOf(lines.join(" ")) : undefined;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const inner = el.querySelectorAll<HTMLElement>("[data-line]");
      const letters = el.querySelectorAll<HTMLElement>("[data-stretch-letter]");

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
          if (letters.length) {
            const pull = { "--x": stretchTo("[data-line]"), ...PULL };
            if (immediate) {
              tl.to(letters, pull, 0.7);
            } else {
              // On scroll the pull has its own line, higher up the screen than the one the title rises at: it plays
              // when the title climbs past it and plays backwards when the title is scrolled back below it. The
              // delay lets the lines land first when both lines are crossed at once (a jump, a fast scroll).
              // Once the title is scrolled off the top the letter closes, and it pulls out afresh when the title
              // comes back, so every pass looks like the first rather than showing a letter left stretched.
              const out = gsap.to(letters, { ...pull, delay: 0.4, paused: true });
              ScrollTrigger.create({
                trigger: el,
                start: "top 78%",
                end: "bottom top",
                onEnter: () => out.play(),
                onLeaveBack: () => out.reverse(),
                onLeave: () => out.pause(0),
                onEnterBack: () => out.restart(),
              });
            }
          }
          // A banner title plays its whole entrance again, the rise and the pull, each time it is scrolled back to.
          if (immediate) replayOnReturn(el, () => tl.restart());
        },
        () => {
          showNow(el);
          if (letters.length) gsap.set(letters, { "--x": stretchTo("[data-line]") });
        },
      );
    },
    { scope: root, dependencies: [isAr, immediate, delay, width] },
  );

  return (
    <Component ref={root} data-reveal className={cn("stretch", className)} style={{ "--wdth": width } as CSSProperties}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pb-[0.1em] -mb-[0.04em]">
          <span data-line className={cn("block origin-bottom-left will-change-transform rtl:origin-bottom-right", lineClassNames?.[index])}>
            <StretchText text={line} letter={letter} />
          </span>
        </span>
      ))}
    </Component>
  );
}
