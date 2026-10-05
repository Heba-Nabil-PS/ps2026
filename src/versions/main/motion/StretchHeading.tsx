"use client";

import { useLocale } from "@/i18n/locale-context";
import { useRichInteractions } from "@/lib/hooks";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Fragment, useRef, type CSSProperties } from "react";
import { motionGate, showNow } from "./useMotionGate";

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

/** How far (px) the letter under the cursor lifts, and how far (px) to either side the lift reaches. Kept light. */
const LIFT = 7;
const REACH = 140;

/**
 * Lets a title's letters lift gently toward the cursor while it hovers the title (the Projects ripple, softer).
 * Each `[data-ripple]` piece rises by how close its centre is to the cursor along the line.
 */
function rippleOnHover(el: HTMLElement) {
  const pieces = Array.from(el.querySelectorAll<HTMLElement>("[data-ripple]"));
  if (!pieces.length) return;
  const lift = pieces.map((piece) => gsap.quickTo(piece, "y", { duration: 0.9, ease: "power3" }));
  let centres: { x: number; y: number }[] = [];

  // Measured on entry, so the layout (fonts, the entrance, the page scroll) is settled.
  const enter = () => {
    centres = pieces.map((piece) => {
      const box = piece.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    });
  };
  const move = (event: PointerEvent) => {
    if (!centres.length) enter();
    // Only the row under the cursor moves; a row is about one letter tall.
    const row = pieces[0].offsetHeight;
    pieces.forEach((_, i) => {
      const { x, y } = centres[i];
      const near = Math.abs(y - event.clientY) < row ? Math.max(0, 1 - Math.abs(x - event.clientX) / REACH) : 0;
      lift[i](-near * near * LIFT);
    });
  };
  const leave = () => {
    centres = [];
    lift.forEach((to) => to(0));
  };

  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointermove", move, { passive: true });
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}

/**
 * A line split into pieces that can ripple: letters in Latin, whole words in Arabic, where letters join.
 * Words stay on one row, so the line wraps as plain text would.
 */
function RippleLine({ text, words }: { text: string; words: boolean }) {
  return text.split(" ").map((word, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      {words ? (
        <span data-ripple className="inline-block">
          {word}
        </span>
      ) : (
        <span className="whitespace-nowrap">
          {Array.from(word, (char, at) => (
            <span key={at} data-ripple className="inline-block">
              {char}
            </span>
          ))}
        </span>
      )}
    </Fragment>
  ));
}

type Tag = "h1" | "h2" | "h3" | "p";

type StretchHeadingProps = {
  as?: Tag;
  /** One entry per line. */
  lines: readonly string[];
  className?: string;
  /** Per-line classes by index. Serializable, so Server Components can pass it. */
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
 * Arabic has no width axis: lines only rise. With a fine pointer, the letters
 * of a page's main title lift a little as the cursor passes over it.
 */
export function StretchHeading({ as: Component = "h2", lines, className, lineClassNames, immediate = false, delay = 0, width = 125 }: StretchHeadingProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const isAr = useLocale() === "ar";
  // Only a page's main title (its h1) ripples under the cursor; section titles stay still. The home hero has its own title.
  const rich = useRichInteractions() && Component === "h1";
  // Arabic titles read as one line; the copy's line breaks are tuned to the Latin face. A title still wraps where the screen is too narrow.
  const shown = isAr ? [lines.join(" ")] : lines;

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
          // A banner title plays its whole entrance again each time it is scrolled back to.
          if (immediate) replayOnReturn(el, () => tl.restart());
          if (rich) return rippleOnHover(el);
        },
        () => showNow(el),
      );
    },
    { scope: root, dependencies: [isAr, immediate, delay, width, rich] },
  );

  return (
    <Component ref={root} data-reveal className={cn("stretch", className)} style={{ "--wdth": width } as CSSProperties}>
      {shown.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pt-[0.12em] -mt-[0.12em] pb-[0.1em] -mb-[0.04em]">
          <span data-line className={cn("block origin-bottom-left will-change-transform rtl:origin-bottom-right", lineClassNames?.[index])}>
            {rich ? <RippleLine text={line} words={isAr} /> : line}
          </span>
        </span>
      ))}
    </Component>
  );
}
