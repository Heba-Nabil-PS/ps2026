"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Header clearance at the top of the viewport, and breathing room at the bottom. */
const TOP = 112;
const BOTTOM = 24;

/**
 * Keeps its content in view beside a long column on large screens. When the
 * content is taller than the viewport it pins by its bottom edge instead, so
 * every part of it, the submit button included, can still be scrolled to.
 */
export function StickyAside({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = () => {
      el.style.setProperty("--sticky-top", `${Math.min(TOP, window.innerHeight - el.offsetHeight - BOTTOM)}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, []);

  return (
    <aside ref={ref} className={`lg:sticky lg:top-(--sticky-top,7rem) lg:self-start ${className}`}>
      {children}
    </aside>
  );
}
