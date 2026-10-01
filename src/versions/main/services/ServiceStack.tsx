"use client";

import { useCopy } from "@/versions/main/use-copy";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { ButtonLink } from "@/versions/main/ui/Button";
import Image from "next/image";
import { useRef } from "react";

/**
 * Six disciplines as glass cards with bold imagery (Peachweb reference).
 * Cards stack as you scroll: the one underneath recedes and dims, the one
 * arriving lights its image from monochrome to colour. Each card is an
 * anchor (/services#branding) and links to the projects in that discipline
 * (/portfolio?service=branding).
 */
export function ServiceStack() {
  const { copy, categories } = useCopy();
  const { list, labels } = copy.services;
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-service]", root.current);
      return motionGate(
        () => {
          cards.forEach((card, index) => {
            ScrollTrigger.create({ trigger: card, start: "top 60%", end: "bottom top", toggleClass: "is-lit" });
            // Stacking is desktop-only: on phones a card is taller than the screen.
            const next = cards[index + 1];
            if (!next || !window.matchMedia("(min-width: 768px)").matches) return;
            gsap.to(card.querySelector("[data-card]"), {
              scale: 0.92,
              opacity: 0.35,
              ease: "none",
              scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: 0.6 },
            });
          });
        },
        () => cards.forEach((card) => card.classList.add("is-lit")),
      );
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="gutter flex flex-col gap-6 pb-10">
      {list.map((service, index) => {
        const hasProjects = categories.some((category) => category.slug === service.slug);
        return (
          <li key={service.slug} id={service.slug} data-service className="scroll-mt-28 md:sticky" style={{ top: `calc(1.5rem + ${index * 0.5}rem)` }}>
            {/* Opaque (not frosted): stacked cards must fully cover the one beneath. */}
            <article
              data-card
              className="theme-dark grid origin-top border border-line bg-[linear-gradient(160deg,#13304f_0%,#0c1d31_45%,#08131f_100%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_-30px_60px_-20px_rgb(0_0_0/0.55)] gap-8 overflow-hidden rounded-frame p-5 will-change-transform md:min-h-[72svh] md:grid-cols-12 md:gap-10 md:p-6 lg:p-8">
              <div className="flex flex-col md:col-span-6 md:p-3">
                <h2 className="text-title font-medium">{service.title}</h2>
                <StretchHeading as="p" lines={service.headline} className="mt-3 text-[clamp(2.2rem,min(4.6vw,9svh),4.8rem)] leading-[0.88] text-sky" />
                <p className="text-lead mt-5 max-w-md text-muted">{service.summary}</p>

                <div className="mt-auto pt-8">
                  <h3 className="text-label mb-4 text-subtle">{labels.deliverables}</h3>
                  <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 border-b border-line py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                  {hasProjects ? (
                    <div className="mt-6">
                      <ButtonLink href={`/portfolio?service=${service.slug}`} variant="glass" transitionLabel={service.title}>
                        {labels.projects}
                      </ButtonLink>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="relative min-h-72 overflow-hidden rounded-card md:col-span-6">
                <Image src={service.image} alt="" fill sizes="(min-width: 768px) 48vw, 100vw" quality={75} className="mono object-cover" />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgb(3_7_13/0.5))]" />
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
