"use client";

import { useContent, useDirectionSign } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Fragment, useRef } from "react";

/**
 * Oversized service names that slide in opposite directions with the scroll
 * and lean into the scroll velocity — the page's editorial "breath".
 */
export function EditorialMarquee() {
  const { studioHome, t } = useContent();
  const { marquee } = studioHome;
  // Rows overflow toward the inline end, so right-to-left pages slide the other way.
  const sign = useDirectionSign();
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-marquee-row]");
        rows.forEach((row, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          gsap.fromTo(
            row,
            { xPercent: direction < 0 ? 0 : -30 * sign },
            {
              xPercent: direction < 0 ? -30 * sign : 0,
              ease: "none",
              scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: 0.4 },
            },
          );
        });

        const skew = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3.out" });
        ScrollTrigger.create({
          trigger: section.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)),
          onLeave: () => skew(0),
          onLeaveBack: () => skew(0),
        });
      });
    },
    { scope: section, dependencies: [sign], revertOnUpdate: true },
  );

  return (
    <section ref={section} aria-label={t.studio.disciplines} className="overflow-hidden bg-[#eceef2] py-12 text-[#07121f] md:py-20">
      {marquee.rows.map((items, index) => (
        <div
          key={index}
          data-marquee-row
          className={cn(
            "flex w-max items-center gap-[0.35em] whitespace-nowrap font-medium tracking-[-0.05em] will-change-transform text-[clamp(2.75rem,7.5vw,8rem)] leading-[1.1]",
            index % 2 === 1 && "font-serif font-light italic text-transparent [-webkit-text-stroke:1.5px_#07121f]",
          )}
        >
          {/* Repeated so the row always overflows the viewport */}
          {[0, 1, 2].map((copy) => (
            <Fragment key={copy}>
              {items.map((item) => (
                <Fragment key={`${copy}-${item}`}>
                  <span aria-hidden={copy > 0}>{item}</span>
                  <span aria-hidden className="inline-block size-[0.28em] rounded-full bg-[#88bbd8]" />
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      ))}
    </section>
  );
}
