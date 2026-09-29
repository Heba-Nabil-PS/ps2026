"use client";

import { TeamBackdrop } from "@/versions/option-2/components/studio/team/TeamBackdrop";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { useContent, useDirectionSign } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import Image from "next/image";
import { useRef } from "react";

/**
 * Scene 2 — typography in motion. The section pins while three oversized
 * lines assemble themselves on different paths: the first slides in and
 * un-tilts, the second collapses from wide letter-spacing into place, the
 * third arrives from the other side. Two image "pills" open inside the text.
 * Phones get the same choreography scrubbed through the section without a pin.
 */
export function TeamManifesto() {
  const { manifesto } = useContent().teamPage;
  const sign = useDirectionSign();
  const section = useRef<HTMLElement>(null);

  useSectionTheme(section, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: desktop
              ? { trigger: section.current, start: "top top", end: "+=180%", pin: true, scrub: 1, anticipatePin: 1 }
              : { trigger: section.current, start: "top 85%", end: "bottom 60%", scrub: 1 },
          });

          tl.fromTo("[data-line='0']", { xPercent: -45 * sign, rotate: -7 * sign, scale: 1.15 }, { xPercent: 0, rotate: 0, scale: 1 }, 0)
            .fromTo("[data-line='1']", { letterSpacing: "0.32em", autoAlpha: 0.12 }, { letterSpacing: "-0.03em", autoAlpha: 1 }, 0.1)
            .fromTo("[data-line='2']", { xPercent: 45 * sign, rotate: 6 * sign }, { xPercent: 0, rotate: 0 }, 0.2)
            .fromTo(
              "[data-pill]",
              { clipPath: "inset(0% 50% 0% 50% round 999px)" },
              { clipPath: "inset(0% 0% 0% 0% round 999px)", stagger: 0.25 },
              0.35,
            )
            .fromTo("[data-pill] img", { scale: 1.7 }, { scale: 1, stagger: 0.25 }, 0.35)
            .fromTo("[data-manifesto-label]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.1);

          // A short hold before the pin releases, so the finished statement can be read.
          if (desktop) tl.to({}, { duration: 0.35 });
        },
      );
    },
    { scope: section, dependencies: [sign], revertOnUpdate: true },
  );

  const [first, second, third] = manifesto.lines;
  const pill = "relative inline-block h-[0.7em] w-[1.5em] shrink-0 overflow-hidden rounded-full align-middle bg-white/10";

  return (
    <section ref={section} aria-labelledby="manifesto-title" className="relative overflow-hidden bg-[#07121f] text-[#f2f3f5]">
      <TeamBackdrop tone="dark" shapes={false} />

      <div className="relative flex min-h-svh flex-col justify-center gap-12 px-4 py-24 md:px-8">
        <p data-manifesto-label className="text-label flex items-center gap-2 text-white/50">
          <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
          {manifesto.label}
        </p>

        <h2
          id="manifesto-title"
          className="flex flex-col gap-[0.08em] font-medium tracking-[-0.05em] text-[clamp(2.5rem,7vw,7.5rem)] leading-[0.98]"
        >
          <span data-line="0" className="flex items-center gap-[0.22em] whitespace-nowrap will-change-transform" style={{ transformOrigin: sign > 0 ? "0% 50%" : "100% 50%" }}>
            {first}
            <span data-pill aria-hidden className={pill}>
              <Image src={manifesto.images[0]} alt="" fill sizes="20vw" className="object-cover" />
            </span>
          </span>
          <span data-line="1" className="block whitespace-nowrap text-center font-serif font-light italic text-[#88bbd8]">
            {second}
          </span>
          <span data-line="2" className="flex items-center justify-end gap-[0.22em] whitespace-nowrap will-change-transform">
            <span data-pill aria-hidden className={pill}>
              <Image src={manifesto.images[1]} alt="" fill sizes="20vw" className="object-cover" />
            </span>
            {third}
          </span>
        </h2>
      </div>
    </section>
  );
}
