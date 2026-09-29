"use client";

import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

/** Client, services, market and deliverables in a four-column ledger that rises in. */
export function CaseStudyFacts({ project }: { project: PortfolioProject }) {
  const section = useRef<HTMLElement>(null);
  const { t } = useContent();
  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-fact]", {
          y: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: section.current, start: "top 80%", once: true },
        });
      });
    },
    { scope: section },
  );

  const facts = [
    { label: t.common.client, value: [project.client] },
    { label: t.common.services, value: project.services },
    { label: t.common.market, value: [project.market ?? t.common.defaultMarket] },
    { label: t.common.delivered, value: project.deliverables },
  ];

  return (
    <section ref={section} aria-label={t.common.projectFacts} className="bg-[#eceef2] px-4 pt-24 text-[#07121f] md:px-8 md:pt-36">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-[#07121f]/10 pt-8 md:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} data-fact>
            <dt className="text-label mb-3 text-[#07121f]/45">{fact.label}</dt>
            <dd>
              <ul className="flex flex-col gap-1 text-sm md:text-base">
                {fact.value.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      {project.tags.length ? (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label={t.common.tags}>
          {project.tags.map((tag) => (
            <li key={tag} data-fact className="rounded-full border border-[#07121f]/10 px-3 py-1.5 text-xs font-medium text-[#07121f]/60">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
