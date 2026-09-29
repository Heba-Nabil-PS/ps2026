"use client";

import { PillButton } from "@/components/studio/PillButton";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { serviceProofHref, type Service } from "@/data/services";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

const surfaces: Record<Service["tone"], string> = {
  paper: "bg-[#f7f7f9] text-[#0b0c0e]",
  ink: "bg-[#0b0c0e] text-[#f2f3f5]",
  blue: "bg-[#122443] text-[#f2f7fb]",
};

/**
 * The six disciplines as a deck of sticky cards: each one pins under the
 * header while the next slides over it, and the covered card settles back
 * (scales down, dims) so the stack reads with depth.
 */
export function ServiceStack() {
  const { services, servicesPage, t } = useContent();
  const { stack } = servicesPage;
  const section = useRef<HTMLElement>(null);
  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;
          gsap.fromTo(
            card.querySelector("[data-stack-surface]"),
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.94,
              filter: "brightness(0.7)",
              ease: "none",
              scrollTrigger: { trigger: next, start: "top bottom", end: "top top+=120", scrub: true },
            },
          );
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-stack-card]").forEach((card) => {
          gsap.fromTo(
            card.querySelector("[data-stack-media]"),
            { yPercent: -8, scale: 1.15 },
            { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } },
          );
          gsap.from(card.querySelectorAll("[data-stack-fade]"), {
            y: 30,
            opacity: 0,
            duration: 1.1,
            stagger: 0.06,
            scrollTrigger: { trigger: card, start: "top 70%", once: true },
          });
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} id="disciplines" aria-labelledby="stack-title" className="relative bg-[#eceef2] px-4 py-28 text-[#0b0c0e] md:px-8 md:py-40">
      <header className="mb-16 grid grid-cols-1 items-end gap-8 md:mb-24 md:grid-cols-12">
        <SplitReveal as="h2" id="stack-title" type="chars" className="font-medium tracking-[-0.055em] text-[clamp(3rem,10vw,11rem)] md:col-span-8 leading-[0.86]">
          <span className="block">{stack.title[0]}</span>
          <span className="block ps-[0.8em] font-serif font-light italic">{stack.title[1]}</span>
        </SplitReveal>
        <p className="text-label text-black/50 md:col-span-4 md:pb-4 md:text-end">
          ({String(services.length).padStart(2, "0")}) {stack.label}
        </p>
      </header>

      <div className="flex flex-col gap-6 md:gap-0">
        {services.map((service, index) => (
          <article
            key={service.slug}
            data-stack-card
            id={service.slug}
            className="md:sticky md:mb-8"
            style={{ top: `calc(5.5rem + ${index * 1.1}rem)` }}
          >
            <div
              data-stack-surface
              className={cn(
                "grid origin-top grid-cols-1 gap-10 overflow-hidden rounded-[2rem] p-6 will-change-transform md:min-h-[78svh] md:grid-cols-12 md:gap-8 md:rounded-[2.5rem] md:p-10 lg:p-14",
                surfaces[service.tone],
              )}
            >
              <div className="flex flex-col md:col-span-7">
                <div className="flex items-center justify-between">
                  <span data-stack-fade className="text-label tabular-nums opacity-50">
                    {service.index} / {String(services.length).padStart(2, "0")}
                  </span>
                  <span data-stack-fade className="text-label opacity-50">
                    {service.tagline}
                  </span>
                </div>

                <h3 data-stack-fade className="mt-10 max-w-[10ch] font-medium tracking-[-0.045em] text-[clamp(2.5rem,6vw,6.5rem)] leading-[0.92] md:mt-16">
                  {service.title}
                </h3>
                <p data-stack-fade className="mt-6 max-w-md text-base leading-relaxed opacity-70 md:text-lg">
                  {service.description}
                </p>

                <ul data-stack-fade className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-current/15 pt-6 text-sm sm:grid-cols-2 md:mt-auto md:text-base">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#88bbd8]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div data-stack-fade className="mt-10 flex flex-wrap items-center gap-4">
                  <PillButton href={serviceProofHref(service)} tone={service.tone === "paper" ? "ink" : "paper"}>
                    {t.studio.seeInCaseStudy}
                  </PillButton>
                  <span className="max-w-xs text-sm opacity-60">{service.proof.label}</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-black/10 md:col-span-5">
                <div className="relative aspect-[4/5] md:absolute md:inset-0 md:aspect-auto">
                  <div data-stack-media className="absolute inset-0 will-change-transform">
                    <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 768px) 40vw, 100vw" quality={85} className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
