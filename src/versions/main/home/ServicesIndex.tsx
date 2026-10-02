"use client";

import { useCopy } from "@/versions/main/use-copy";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { serviceHref } from "@/versions/main/data/routes";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

/** Glass pill for a deliverable tag. */
const tag =
  "inline-flex items-center gap-2 rounded-full border border-line bg-fg/[0.04] px-3.5 py-1.5 text-xs text-fg/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] md:text-sm";

/** Seconds a row takes to open (and, reversed, to close). */
const MOVE = 0.9;
/** Closed frame height (3.25rem); the open one is at least clamp(9rem, 15vw, 14rem) and grows to fit its row (openHeight). */
const SLICE = 52;
const frameOpen = () => gsap.utils.clamp(144, 224, window.innerWidth * 0.15);
/** Gap between an open row's title and its description + tags. */
const GAP = 18;
/** An open frame runs the full height of its row: at least frameOpen, or as tall as the title, description and tags. */
const openHeight = (title: HTMLElement, tags: HTMLElement) => Math.max(frameOpen(), title.offsetHeight + GAP + tags.scrollHeight);
/** Closed state of a description or tag, written inline so the first paint matches the timeline's start. */
const hidden = { opacity: 0, visibility: "hidden", transform: "translateY(-10px)" } as const;
const MONO = "grayscale(1) contrast(1.06) brightness(0.86)";
const LIT = "grayscale(0) contrast(1) brightness(1)";

/**
 * Services index (Oddlymade reference, principle P8). Each row shows a thin slice of its
 * image; the open row slides the slice down into a full-height frame in colour and brings its
 * description and deliverables in. Each row opens its service page.
 *
 * On desktop only the first row opens from the scroll, as the list comes into view; the page
 * then scrolls on normally, and hovering (or focusing) another row moves the open state to it.
 *
 * Phones skip this: rows show their deliverables as plain tags.
 */
export function ServicesIndex() {
  const { copy } = useCopy();
  const section = copy.home.services;
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const stageEl = stage.current;
        if (!stageEl) return;
        const glide = "power2.inOut";
        const items = gsap.utils.toArray<HTMLElement>("[data-row]", stageEl);
        const rows = items.map((row) => {
          const frame = row.querySelector<HTMLElement>("[data-frame]")!;
          const image = row.querySelector<HTMLElement>("[data-frame] img")!;
          const title = row.querySelector<HTMLElement>("h3")!;
          const tags = row.querySelector<HTMLElement>("[data-tags]")!;
          const pills = gsap.utils.toArray<HTMLElement>("[data-tag]", row);
          return gsap
            .timeline({ paused: true, defaults: { ease: "none" } })
            .to(frame, { height: () => openHeight(title, tags), duration: MOVE, ease: glide }, 0)
            .to(image, { filter: LIT, scale: 1, duration: MOVE, ease: glide }, 0)
            .to(title, { "--lit": 1, duration: MOVE * 0.6 }, 0)
            .to(tags, { height: () => tags.scrollHeight, marginTop: GAP, duration: MOVE, ease: glide }, 0)
            .to(pills, { autoAlpha: 1, y: 0, duration: MOVE * 0.6, stagger: 0.05, ease: "power2.out" }, MOVE * 0.3);
        });

        // One row open at a time: the new one plays in while the old one plays back out.
        let active = -1;
        const activate = (index: number) => {
          if (index === active) return;
          if (active >= 0) rows[active].reverse();
          if (index >= 0) rows[index].play();
          active = index;
        };

        // Only the first row opens from the scroll; scrolling back above the list closes it again.
        ScrollTrigger.create({
          trigger: stageEl,
          start: "top 70%",
          onEnter: () => active < 0 && activate(0),
          onLeaveBack: () => activate(-1),
        });

        const listeners = items.map((item, index) => {
          const on = () => activate(index);
          item.addEventListener("mouseenter", on);
          item.addEventListener("focusin", on);
          return () => {
            item.removeEventListener("mouseenter", on);
            item.removeEventListener("focusin", on);
          };
        });

        // Open heights depend on the width: re-measure them from the closed state on resize.
        const remeasure = () =>
          rows.forEach((tl) => {
            const progress = tl.progress();
            tl.progress(0).invalidate().progress(progress);
          });
        ScrollTrigger.addEventListener("refreshInit", remeasure);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", remeasure);
          listeners.forEach((off) => off());
        };
      });

      // Reduced motion on desktop: every row simply shown open.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        const stageEl = stage.current;
        if (!stageEl) return;
        gsap.set(stageEl.querySelectorAll("[data-frame] img"), { filter: LIT, scale: 1 });
        gsap.set(stageEl.querySelectorAll("[data-tags]"), { height: "auto", marginTop: GAP });
        gsap.set(stageEl.querySelectorAll("[data-tag]"), { autoAlpha: 1, y: 0 });
        stageEl.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
          gsap.set(row.querySelector("[data-frame]"), { height: openHeight(row.querySelector("h3")!, row.querySelector<HTMLElement>("[data-tags]")!) });
        });
      });

      return () => mm.revert();
    },
    { dependencies: [copy.services.list.length] },
  );

  return (
    <section data-thread-hidden className="band gutter section-y relative isolate">
      {/* `isolate` lifts the band (ground and content) above the home page's thread (LogoThread), so the line doesn't show here.
          `data-thread-hidden` joins it to the clear Numbers section above, so the line doesn't come out in the gap between them. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-800" />
      <SectionHead
        label={section.label}
        title={section.title}
        intro={section.intro}
        action={
          <ButtonLink href="/services" variant="glass" transitionLabel={copy.meta.pages.services.title}>
            {section.cta}
          </ButtonLink>
        }
      />

      <div ref={stage} className="mt-10 md:mt-14">
          <Reveal as="ol" className="border-b border-line" stagger={0.07}>
            {copy.services.list.map((service) => (
              <li key={service.slug} data-reveal-item data-row className="border-t border-line">
                <AppLink
                  href={serviceHref(service.slug)}
                  transitionLabel={service.title}
                  className="group grid grid-cols-[1fr_auto] items-start gap-x-5 gap-y-4 py-6 md:grid-cols-12 md:gap-x-8"
                >
                  {/* Closed state is written inline so the first paint matches the timeline's start. */}
                  <div data-frame className="relative col-span-3 hidden overflow-hidden rounded-xl bg-navy-800 md:col-span-4 md:block" style={{ height: SLICE }}>
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 32vw, 1px"
                      quality={70}
                      className="object-cover"
                      style={{ filter: MONO, transform: "scale(1.1)" }}
                    />
                  </div>

                  <div className="md:col-span-7">
                    <h3 className="services-title text-[clamp(1.35rem,2.2vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">{service.title}</h3>
                    <div data-tags className="hidden max-w-xl overflow-hidden md:block" style={{ height: 0 }}>
                      <p data-tag className="text-base leading-relaxed text-fg/65" style={hidden}>
                        {service.summary}
                      </p>
                      <ul aria-label={copy.services.labels.deliverables} className="mt-4 flex flex-wrap gap-2">
                        {service.deliverables.map((item) => (
                          <li key={item} data-tag className={tag} style={hidden}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-fg/65 md:hidden">{service.summary}</p>
                    <ul aria-label={copy.services.labels.deliverables} className="mt-3 flex flex-wrap gap-1.5 md:hidden">
                      {service.deliverables.map((item) => (
                        <li key={item} className={tag}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span
                    aria-hidden
                    className="grid size-10 place-items-center self-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 md:col-span-1 md:justify-self-end rtl:-scale-x-100"
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </AppLink>
              </li>
            ))}
          </Reveal>
      </div>
    </section>
  );
}
