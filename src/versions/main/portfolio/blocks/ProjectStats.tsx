"use client";

import { RevealText } from "@/versions/main/portfolio/ui/RevealText";
import type { ContentBlock } from "@/data/portfolio";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

type StatsBlock = Extract<ContentBlock, { type: "stats" }>;

const format = (value: number, decimals = 0) => value.toFixed(decimals);

/** Numbers count up when they enter. The server-rendered markup already holds the final values. */
export function ProjectStats({ title, items }: Omit<StatsBlock, "type">) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>("[data-count]", root.current).forEach((el, i) => {
        const item = items[i];
        const counter = { value: 0 };
        el.textContent = format(0, item.decimals);
        gsap.to(counter, {
          value: item.value,
          duration: 2,
          delay: i * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
          onUpdate: () => {
            el.textContent = format(counter.value, item.decimals);
          },
        });
      });
      gsap.from(gsap.utils.toArray("[data-stat]", root.current), {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="gutter py-24 md:py-28">
      {title ? (
        <RevealText as="h2" className="text-label mb-12 text-muted">
          {title}
        </RevealText>
      ) : null}
      <dl className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} data-stat className="flex flex-col border-t border-line pt-6">
            <dt className="text-label order-2 mt-4 text-muted">{item.label}</dt>
            <dd className="text-display order-1 font-medium tabular-nums leading-none">
              {item.prefix}
              <span data-count>{format(item.value, item.decimals)}</span>
              <span className="text-accent">{item.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
