"use client";

import { useLocale } from "@/i18n/locale-context";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { animate, useInView, useMotionValue } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

/**
 * Counts up to `value` the first time it scrolls into view. Years (≥ 1900)
 * count only across the last stretch, so "2023" never reads as a quantity.
 * The server renders the final number, so there is no layout shift and it
 * is correct without JavaScript.
 */
export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = usePrefersReducedMotion();
  const locale = useLocale();
  const isYear = value >= 1900 && value <= 2100;
  const count = useMotionValue(value);

  const format = useMemo(() => {
    const numbers = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US");
    return (n: number) => (isYear ? String(Math.round(n)) : numbers.format(Math.round(n)));
  }, [locale, isYear]);

  useEffect(() => count.on("change", (latest) => text.current && (text.current.textContent = format(latest))), [count, format]);

  useEffect(() => {
    if (!inView || reduced) return;
    count.jump(isYear ? value - 23 : 0);
    const controls = animate(count, value, { duration: 2.2, ease: [0.19, 1, 0.22, 1] });
    return () => controls.stop();
  }, [inView, reduced, isYear, value, count]);

  return (
    <span ref={root} className={className}>
      <span aria-hidden>
        <span ref={text}>{format(value)}</span>
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
