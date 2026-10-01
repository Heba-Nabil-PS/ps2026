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
  "inline-flex items-center gap-2 rounded-full border border-line bg-fg/[0.04] px-3.5 py-1.5 text-xs text-fg/85 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-sm md:text-sm";

/** Scroll (in viewport heights) each row gets while the list is held. */
const STEP = 0.5;
/** Timeline units: a row opening or closing, and the pause it stays open for. */
const MOVE = 1;
const HOLD = 0.8;
/** Closed frame height (3.25rem); the open one is at least clamp(9rem, 15vw, 14rem) and grows to fit its row (openHeight). */
const SLICE = 52;
const frameOpen = () => gsap.utils.clamp(144, 224, window.innerWidth * 0.15);
/** Gap between an open row's title and its description + tags. */
const GAP = 18;
/** An open frame runs the full height of its row: at least frameOpen, or as tall as the title, description and tags. */
const openHeight = (title: HTMLElement, tags: HTMLElement) => Math.max(frameOpen(), title.offsetHeight + GAP + tags.scrollHeight);
/** Closed state of a description or tag, written inline so the first paint matches the timeline's start. */
const hidden = { opacity: 0, visibility: "hidden", transform: "translateY(-10px)", filter: "blur(6px)" } as const;
const MONO = "grayscale(1) contrast(1.06) brightness(0.86)";
const LIT = "grayscale(0) contrast(1) brightness(1)";

/**
 * Services index (Oddlymade reference, principle P8). Each row shows a thin slice of its
 * image; the open row slides the slice down into a full-height frame in colour and brings its
 * description and deliverables in. Each row opens its service page.
 *
 * On desktop the list is held on screen (sticky inside a taller track) and the rows are
 * scrubbed by the scroll: a row opens exactly as far as the page has scrolled, so slow
 * scrolling opens it slowly, reversing closes it, and Lenis plus `scrub` ease every stop.
 * Holding the list keeps the page still while rows resize: the track is as tall as the
 * list can get, so nothing above or below moves.
 *
 * Phones skip this: rows show their deliverables as plain tags.
 */
export function ServicesIndex() {
  const { copy } = useCopy();
  const section = copy.home.services;
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const trackEl = track.current;
        const stageEl = stage.current;
        if (!trackEl || !stageEl) return;
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]", stageEl).map((row) => ({
          frame: row.querySelector<HTMLElement>("[data-frame]")!,
          image: row.querySelector<HTMLElement>("[data-frame] img")!,
          title: row.querySelector<HTMLElement>("h3")!,
          tags: row.querySelector<HTMLElement>("[data-tags]")!,
          pills: gsap.utils.toArray<HTMLElement>("[data-tag]", row),
        }));
        type Row = (typeof rows)[number];
        const glide = "power2.inOut";

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        const open = (row: Row, at: number) =>
          tl
            .to(row.frame, { height: () => openHeight(row.title, row.tags), duration: MOVE, ease: glide }, at)
            .to(row.image, { filter: LIT, scale: 1, duration: MOVE, ease: glide }, at)
            .to(row.title, { "--lit": 1, duration: MOVE * 0.6 }, at)
            .to(row.tags, { height: () => row.tags.scrollHeight, marginTop: GAP, duration: MOVE, ease: glide }, at)
            .to(row.pills, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: MOVE * 0.6, stagger: 0.05, ease: "power2.out" }, at + MOVE * 0.3);
        const close = (row: Row, at: number) =>
          tl
            .to(row.pills, { autoAlpha: 0, y: -10, filter: "blur(6px)", duration: MOVE * 0.4, stagger: { each: 0.03, from: "end" }, ease: "power2.in" }, at)
            .to(row.tags, { height: 0, marginTop: 0, duration: MOVE, ease: glide }, at + MOVE * 0.15)
            .to(row.frame, { height: SLICE, duration: MOVE, ease: glide }, at + MOVE * 0.15)
            .to(row.image, { filter: MONO, scale: 1.1, duration: MOVE, ease: glide }, at + MOVE * 0.15)
            .to(row.title, { "--lit": 0, duration: MOVE * 0.6 }, at + MOVE * 0.15);

        // The next row starts sliding down while the previous one is still sliding up.
        let time = 0;
        rows.forEach((row, index) => {
          if (index > 0) close(rows[index - 1], time);
          open(row, index > 0 ? time + MOVE * 0.25 : time);
          time += MOVE * 1.25 + HOLD;
        });
        tl.set({}, {}, time);

        // Track = the list at its tallest + the scroll the rows play over; the list sits centred while held.
        let tallest = 0;
        let top = 0;
        const size = () => {
          const progress = tl.progress();
          tl.progress(0);
          const closed = stageEl.offsetHeight;
          const grows = rows.map(({ title, tags }) => openHeight(title, tags) - Math.max(SLICE, title.offsetHeight));
          tl.progress(progress);
          tallest = closed + Math.max(...grows);
          top = Math.max(24, (window.innerHeight - tallest) / 2);
          stageEl.style.top = `${top}px`;
          trackEl.style.height = `${tallest + rows.length * STEP * window.innerHeight}px`;
        };
        size();
        ScrollTrigger.addEventListener("refreshInit", size);

        ScrollTrigger.create({
          animation: tl,
          trigger: trackEl,
          // The first row starts opening a little before the list settles, so it's open as it lands.
          start: () => `top ${top + window.innerHeight * 0.3}px`,
          end: () => `bottom ${top + tallest}px`,
          scrub: 1,
          invalidateOnRefresh: true,
        });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", size);
          trackEl.style.height = "";
          stageEl.style.top = "";
        };
      });

      // Reduced motion on desktop: every row simply shown open.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        const stageEl = stage.current;
        if (!stageEl) return;
        gsap.set(stageEl.querySelectorAll("[data-frame] img"), { filter: LIT, scale: 1 });
        gsap.set(stageEl.querySelectorAll("[data-tags]"), { height: "auto", marginTop: GAP });
        gsap.set(stageEl.querySelectorAll("[data-tag]"), { autoAlpha: 1, y: 0, filter: "none" });
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

      <div ref={track} className="mt-10 md:mt-14">
        <div ref={stage} className="md:sticky">
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
                            <span aria-hidden className="size-1.5 rounded-full bg-sky shadow-[0_0_8px_rgb(125_211_252/0.8)]" />
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
      </div>
    </section>
  );
}
