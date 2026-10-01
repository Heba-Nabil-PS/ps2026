"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { motionGate, showNow } from "@/versions/main/motion/useMotionGate";
import { Compass, PenTool, Rocket, Search, type LucideIcon } from "lucide-react";
import { useRef } from "react";

/** One line-drawn icon per step, in process order (Discover, Strategize, Create & build, Launch & optimize). */
const ICONS: readonly LucideIcon[] = [Search, Compass, PenTool, Rocket];

/**
 * The process as a vertical line drawing: each step's ring and icon trace themselves in,
 * its text rises, then the connector draws down to the next step, one step at a time.
 */
export function ProcessSteps({ steps }: { steps: readonly { title: string; body: string }[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const strokes = (scope: Element) => Array.from(scope.querySelectorAll<SVGGeometryElement>("[data-draw], [data-icon] svg *"));

      return motionGate(
        () => {
          const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
          gsap.set(el, { autoAlpha: 1 });

          items.forEach((item, index) => {
            const paths = strokes(item);
            paths.forEach((path) => {
              const length = path.getTotalLength?.() || 1;
              gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            });
            const text = item.querySelectorAll("[data-step-text]");
            const line = item.querySelector("[data-line]");
            gsap.set(text, { autoAlpha: 0, y: 16 });
            if (line) gsap.set(line, { scaleY: 0 });

            const at = index === 0 ? 0 : ">-0.1";
            tl.to(paths, { strokeDashoffset: 0, duration: 0.7, stagger: 0.05 }, at)
              .to(text, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, "<0.25");
            if (line) tl.to(line, { scaleY: 1, duration: 0.6, ease: "power1.inOut" }, "<0.2");
          });

          ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => tl.play() });
        },
        () => showNow(el),
      );
    },
    { scope: root, dependencies: [steps.length] },
  );

  return (
    <div ref={root} data-reveal className="mt-2">
      <ol>
        {steps.map((step, index) => {
          const Icon = ICONS[index % ICONS.length];
          const last = index === steps.length - 1;
          return (
            <li key={step.title} data-step className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 pb-10 last:pb-0">
              {!last && (
                <span
                  aria-hidden
                  data-line
                  className="absolute bottom-0 start-7 top-14 w-px origin-top bg-gradient-to-b from-sky via-sky/60 to-line-strong"
                />
              )}
              <span aria-hidden className="relative grid size-14 place-items-center text-sky">
                <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" fill="none">
                  <circle data-draw cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                </svg>
                <span data-icon className="contents">
                  <Icon className="size-5" strokeWidth={1.25} />
                </span>
              </span>
              <div className="pt-2">
                <p data-step-text className="text-label tabular-nums text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 data-step-text className="mt-2 text-xl font-medium">
                  {step.title}
                </h3>
                <p data-step-text className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
