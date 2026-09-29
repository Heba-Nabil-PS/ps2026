"use client";

import { SplitReveal } from "@/versions/option-2/components/studio/SplitReveal";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRef } from "react";

/**
 * Studio photograph that clip-reveals into a full-bleed frame with inner
 * parallax, followed by the two offices as cards.
 */
export function OfficesStrip() {
  const section = useRef<HTMLElement>(null);
  const { contactPage, site: siteConfig, t } = useContent();
  const { offices } = contactPage;
  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-offices-frame]",
          { clipPath: "inset(12% 8% 12% 8% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            ease: "power2.out",
            scrollTrigger: { trigger: "[data-offices-frame]", start: "top 90%", end: "top 30%", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          "[data-offices-media]",
          { yPercent: -12, scale: 1.2 },
          { yPercent: 12, scale: 1.2, ease: "none", scrollTrigger: { trigger: "[data-offices-frame]", start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from("[data-office]", {
          y: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-offices]", start: "top 85%", once: true },
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="offices-title" className="relative bg-[#eceef2] px-4 py-28 text-[#07121f] md:px-8 md:py-28">
      <header className="mb-12 grid grid-cols-1 items-end gap-6 md:mb-16 md:grid-cols-12">
        <p className="text-label flex items-center gap-2 text-[#07121f]/50 md:col-span-3">
          <span aria-hidden className="size-1.5 rounded-full bg-[#07121f]" />
          {offices.label}
        </p>
        <SplitReveal as="h2" id="offices-title" type="lines" className="font-medium tracking-[-0.045em] text-[clamp(2.5rem,5.5vw,6rem)] md:col-span-9 leading-[0.95]">
          {offices.title.map((line, index) => (
            <span key={line} className={cn("block", index === 1 && "font-serif font-light italic")}>
              {line}
            </span>
          ))}
        </SplitReveal>
      </header>

      <div data-offices-frame className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#d6d9df] md:aspect-[21/9]">
        <div data-offices-media className="absolute inset-0 will-change-transform">
          <Image src={offices.image.src} alt={offices.image.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </div>
      </div>

      <ul data-offices className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {siteConfig.offices.map((office, index) => (
          <li key={office.city} data-office className="group relative overflow-hidden rounded-3xl bg-[#f7f7f9] p-8 transition-colors duration-700 md:p-10">
            <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-[#07121f] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-y-100" />
            <div className="relative transition-colors duration-500 group-hover:text-[#f2f3f5]">
              <p className="text-label tabular-nums opacity-50">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-8 text-3xl font-medium tracking-[-0.035em] md:text-5xl">{office.city}</h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-60 md:text-base">{office.address}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block text-sm underline decoration-current/30 underline-offset-8 transition-colors hover:decoration-[#88bbd8]"
              >
                {t.studio.openInMaps}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
