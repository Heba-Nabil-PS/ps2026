"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef, useState } from "react";

/** Parses "80+" → { value: 80, suffix: "+" } for the count-up. */
function parseStat(value: string) {
  const match = value.match(/^(\d+)(.*)$/);
  return match ? { value: Number(match[1]), suffix: match[2] } : { value: 0, suffix: value };
}

/**
 * Dark studio section: sticky headline, service index with a cursor-following
 * preview, and counters. Its rounded top edge slides over the light page.
 */
export function Capabilities() {
  const { capabilities } = useContent().studioHome;
  const section = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rich = useRichInteractions();
  const { play } = useSound();

  useSectionTheme(section, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The dark sheet rises over the previous section.
        gsap.fromTo(
          section.current,
          { borderTopLeftRadius: "4rem", borderTopRightRadius: "4rem", y: 0 },
          {
            borderTopLeftRadius: "0rem",
            borderTopRightRadius: "0rem",
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true },
          },
        );

        gsap.from("[data-service-row]", {
          yPercent: 60,
          opacity: 0,
          duration: 1.1,
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-service-list]", start: "top 80%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const counter = { value: target > 1000 ? target - 30 : 0 };
        gsap.to(counter, {
          value: target,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          },
        });
      });

      if (preview.current) gsap.set(preview.current, { xPercent: -50, yPercent: -50, scale: 0 });
    },
    { scope: section },
  );

  function movePreview(event: React.PointerEvent) {
    if (!rich || !preview.current || !section.current) return;
    const bounds = section.current.getBoundingClientRect();
    gsap.to(preview.current, {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
    });
  }

  function togglePreview(index: number | null) {
    setActiveIndex(index);
    if (!preview.current) return;
    gsap.to(preview.current, { scale: index === null ? 0 : 1, duration: 0.6, ease: "expo.out" });
  }

  return (
    <section
      ref={section}
      aria-labelledby="capabilities-title"
      className="relative overflow-hidden rounded-t-[4rem] bg-[#0b0c0e] px-4 pb-28 pt-28 text-[#f2f3f5] md:px-8 md:pb-40 md:pt-40"
      onPointerMove={movePreview}
    >
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <p className="text-label mb-8 flex items-center gap-2 text-white/50">
              <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
              {capabilities.label}
            </p>
            <SplitReveal
              as="h2"
              id="capabilities-title"
              type="lines"
              className="font-medium tracking-[-0.045em] text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95]"
            >
              {capabilities.title.map((line, index) => (
                <span key={line} className={cn("block", index === 1 && "font-serif font-light italic text-[#88bbd8]")}>
                  {line}
                </span>
              ))}
            </SplitReveal>
          </div>
        </div>

        <ul data-service-list className="md:col-span-7" onPointerLeave={() => togglePreview(null)}>
          {capabilities.services.map((service, index) => (
            <li
              key={service.title}
              data-service-row
              onPointerEnter={() => {
                play("hover");
                togglePreview(index);
              }}
              className="group relative border-t border-white/15 last:border-b"
            >
              <div className="relative z-10 grid grid-cols-[3rem_1fr] items-baseline gap-4 py-7 md:grid-cols-[4rem_1fr_auto] md:py-9">
                <span className="text-label tabular-nums text-white/40">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="text-3xl font-medium tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 md:text-5xl">
                  {service.title}
                </h3>
                <p className="col-start-2 max-w-sm text-sm leading-relaxed text-white/55 md:col-start-3 md:max-w-[16rem] md:text-end">
                  {service.description}
                </p>
              </div>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-full origin-bottom scale-y-0 bg-white/[0.04] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-y-100"
              />
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-28 grid grid-cols-1 gap-12 border-t border-white/15 pt-12 md:mt-40 md:grid-cols-3">
        {capabilities.stats.map((stat) => {
          const { value, suffix } = parseStat(stat.value);
          return (
            <div key={stat.value}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-medium tabular-nums leading-none tracking-[-0.05em] text-[clamp(4rem,9vw,9rem)]">
                  <span data-count={value}>{value}</span>
                  <span className="text-[#88bbd8]">{suffix}</span>
                </span>
                <span aria-hidden className="mt-5 block max-w-xs text-sm leading-relaxed text-white/55">
                  {stat.label}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Cursor-following preview (desktop) */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden aspect-[4/5] w-[18vw] min-w-56 overflow-hidden rounded-2xl md:block"
      >
        {capabilities.services.map((service, index) => (
          <Image
            key={service.title}
            src={service.image}
            alt=""
            fill
            sizes="20vw"
            className={cn(
              "object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-expo)]",
              activeIndex === index ? "scale-100 opacity-100" : "scale-110 opacity-0",
            )}
          />
        ))}
      </div>
    </section>
  );
}
