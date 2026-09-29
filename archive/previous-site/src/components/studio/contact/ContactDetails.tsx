"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { LocalTime } from "@/components/ui/LocalTime";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

/** Direct email, studio time and the three steps after an enquiry lands. Sticky beside the form on desktop. */
export function ContactDetails() {
  const root = useRef<HTMLDivElement>(null);
  const { play } = useSound();
  const { contactPage, site: siteConfig, t } = useContent();
  const { details } = contactPage;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-detail]", {
          y: 30,
          opacity: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-12 md:sticky md:top-32">
      <div data-detail>
        <p className="text-label mb-4 flex items-center gap-2 text-black/50">
          <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
          {details.label}
        </p>
        <a
          href={`mailto:${siteConfig.email}`}
          onPointerEnter={() => play("hover")}
          className="group inline-flex items-center gap-2 text-2xl font-medium tracking-[-0.03em] md:text-3xl"
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom transition-[background-size] duration-700 ease-[var(--ease-expo)] group-hover:bg-[length:100%_1px]">
            {siteConfig.email}
          </span>
          <ArrowUpRight aria-hidden className="size-5 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45" />
        </a>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/55">
          <span>{siteConfig.location}</span>
          <span aria-hidden className="size-1 rounded-full bg-black/25" />
          <span>
            {t.studio.studioTime} <LocalTime className="tabular-nums text-[#0b0c0e]" />
          </span>
        </p>
      </div>

      <div data-detail className="border-t border-black/10 pt-8">
        <p className="text-label mb-6 text-black/50">{details.nextSteps.title}</p>
        <ol className="flex flex-col gap-6">
          {details.nextSteps.steps.map((step, index) => (
            <li key={step.title} data-detail className="grid grid-cols-[2.5rem_1fr] gap-3">
              <span className="text-label pt-1 tabular-nums text-[#88bbd8]">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-lg font-medium tracking-[-0.02em]">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-black/55">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <ul data-detail className="flex flex-col gap-4 border-t border-black/10 pt-8 text-sm">
        {siteConfig.offices.map((office) => (
          <li key={office.city}>
            <p className="font-medium">{office.city}</p>
            <p className="mt-1 leading-relaxed text-black/55">{office.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
