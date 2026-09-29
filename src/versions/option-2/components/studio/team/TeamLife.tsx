"use client";

import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { useContent, useDirectionSign } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

/* Varied frames keep the strip rhythmic: size and vertical offset per slot. */
const frames = [
  "md:h-[58vh] md:aspect-[4/3] md:self-start",
  "md:h-[70vh] md:aspect-[4/5] md:self-end",
  "md:h-[50vh] md:aspect-square md:self-center",
  "md:h-[64vh] md:aspect-[16/10] md:self-start",
  "md:h-[60vh] md:aspect-[3/4] md:self-end",
];

/**
 * Scene 6 — studio life. On desktop the section pins and vertical scroll
 * drives a horizontal track; each photo enters from alternating heights with
 * a tilt and settles, its image panning inside the frame, while the title
 * slides the opposite way. Phones get a native swipe strip.
 */
export function TeamLife() {
  const { life } = useContent().teamPage;
  const sign = useDirectionSign();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

        const scroll = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        scroll
          .to(el, { x: () => -distance() * sign }, 0)
          .to("[data-life-title]", { xPercent: 25 * sign }, 0)
          .fromTo("[data-life-progress]", { scaleX: 0 }, { scaleX: 1 }, 0);

        // Frames enter from the inline end: the left edge in LTR, the right edge in RTL.
        const enter = sign > 0 ? "left right" : "right left";
        const exit = sign > 0 ? "right left" : "left right";

        gsap.utils.toArray<HTMLElement>("[data-life-frame]").forEach((frame, index) => {
          gsap.from(frame, {
            yPercent: index % 2 ? -35 : 35,
            rotate: (index % 2 ? -7 : 7) * sign,
            scale: 0.8,
            ease: "none",
            scrollTrigger: { trigger: frame, containerAnimation: scroll, start: enter, end: "center 60%", scrub: true },
          });
          gsap.fromTo(
            frame.querySelector("[data-life-img]"),
            { xPercent: -10 * sign, scale: 1.2 },
            { xPercent: 10 * sign, scale: 1.2, ease: "none", scrollTrigger: { trigger: frame, containerAnimation: scroll, start: enter, end: exit, scrub: true } },
          );
        });
      });
    },
    { scope: section, dependencies: [sign], revertOnUpdate: true },
  );

  return (
    <section ref={section} aria-labelledby="life-title" className="relative overflow-hidden bg-[#eceef2] py-24 text-[#07121f] md:flex md:h-svh md:flex-col md:py-0">
      <div className="px-4 md:px-8 md:pt-28">
        <p className="text-label mb-6 flex items-center gap-2 text-[#07121f]/50">
          <span aria-hidden className="size-1.5 rounded-full bg-[#07121f]" />
          {life.label}
        </p>
        <h2
          id="life-title"
          data-life-title
          className="whitespace-nowrap font-medium tracking-[-0.05em] text-[clamp(2.25rem,5.5vw,6rem)] leading-[0.98]"
        >
          {life.title[0]} <span className="font-serif font-light italic text-[#122443]">{life.title[1]}</span>
        </h2>
      </div>

      <ul
        ref={track}
        data-lenis-prevent-horizontal
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:mt-0 md:w-max md:flex-1 md:snap-none md:items-center md:gap-10 md:overflow-visible md:px-8 md:py-10"
      >
        {life.images.map((image, index) => (
          <li
            key={image.src}
            data-life-frame
            className={cn(
              "relative aspect-[4/5] w-[78vw] shrink-0 snap-center overflow-hidden rounded-[1.25rem] bg-[#dfe2e8] md:w-auto md:will-change-transform",
              frames[index % frames.length],
            )}
          >
            <div data-life-img className="absolute inset-0">
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 45vw, 78vw" className="object-cover" />
            </div>
          </li>
        ))}
      </ul>

      <div aria-hidden className="mx-4 mt-6 h-px bg-[#07121f]/10 md:mx-8 md:mb-10 md:mt-0">
        <div data-life-progress className="h-px origin-[0%_50%] bg-[#07121f] rtl:origin-[100%_50%] max-md:hidden" />
      </div>
    </section>
  );
}
