"use client";

import { localeDirection } from "@/i18n/config";
import { workHref } from "@/versions/main/data/work";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ButtonLink } from "@/versions/main/ui/Button";
import { AppLink } from "@/versions/main/ui/AppLink";
import { useCopy } from "@/versions/main/use-copy";
import { useRef, type CSSProperties } from "react";
import { arc, ENTER_FROM, pose, SCREENS_PER_UNIT, SPREAD, timelineLength, UNITS, zIndexAt } from "./orbit";
import { scenes } from "./scenes";
import { Stars } from "./Stars";

const pad = (value: number) => String(value).padStart(2, "0");

/** A pose as an inline transform, so the server paints the cards where the timeline starts them. */
const transformOf = ({ xPercent, yPercent, rotateY, scale }: ReturnType<typeof pose>) =>
  `translate(${xPercent}%, ${yPercent}%) rotateY(${rotateY}deg) scale(${scale})`;

/**
 * Selected work as a universe you travel through: the flagship cases sit on a
 * 3D orbit that turns with the scroll, one case in focus at a time, each with
 * a mini scene that plays its own short story before the orbit turns again.
 * The stage is pinned for `timelineLength × SCREENS_PER_UNIT` screens.
 *
 * With reduced motion (or before scripts run) the orbit is not rendered at all:
 * every case is a plain row with its scene in its finished state.
 */
export function ProductUniverse() {
  const { copy, featured, locale } = useCopy();
  const universe = copy.home.work.universe;
  const dir = localeDirection(locale) === "rtl" ? -1 : 1;
  const track = useRef<HTMLDivElement>(null);

  const items = universe.items.flatMap((item) => {
    const project = featured.find((candidate) => candidate.slug === item.slug);
    const scene = scenes[item.slug];
    return project && scene ? [{ ...item, project, scene }] : [];
  });
  const count = items.length;
  const units = timelineLength(count);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || !count) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (context) => {
        const { motion, mobile } = context.conditions ?? {};
        if (motion) return buildUniverse(el, mobile ? SPREAD.mobile : SPREAD.desktop, dir);
      });
      return () => mm.revert();
    },
    { scope: track, dependencies: [dir, count] },
  );

  if (!count) return null;

  return (
    <>
      {/* The orbit. Its height is 100vh plus the pinned scroll; the script re-measures it in pixels on every refresh. */}
      <div ref={track} className="universe-track relative" style={{ height: `calc(100vh + ${units * SCREENS_PER_UNIT * 100}vh)` }}>
        <div data-stage className="universe-stage theme-dark relative flex h-svh flex-col overflow-hidden">
          <div aria-hidden className="universe-bg pointer-events-none absolute inset-0 -z-10">
            <div data-sky className="universe-sky">
              <Stars />
            </div>
          </div>

          <div aria-hidden className="gutter flex items-center justify-between gap-6 pt-[clamp(4.5rem,10vh,6rem)]">
            <p className="text-label text-sky">
              {universe.eyebrow[0]} <span className="text-sky/50">·</span> {universe.eyebrow[1]}
            </p>
            <p className="text-label flex items-center gap-2 tabular-nums text-muted">
              <span className="block h-[1.2em] overflow-hidden text-fg">
                <span data-counter className="flex flex-col">
                  {items.map((item, index) => (
                    <span key={item.slug} className="block h-[1.2em] leading-[1.2em]">
                      {pad(index + 1)}
                    </span>
                  ))}
                </span>
              </span>
              <span>/ {pad(count)}</span>
            </p>
          </div>

          <div aria-hidden className="gutter mt-[clamp(0.5rem,2.2vh,1.75rem)] text-center">
            <div className="universe-prefix-mask relative overflow-hidden">
              {items.map((item) => (
                <span key={item.slug} data-prefix className="universe-prefix absolute inset-x-0 top-0" style={{ transform: "translateY(105%)" }}>
                  {item.prefix}
                </span>
              ))}
            </div>
            <div className="universe-name-mask relative overflow-hidden">
              {items.map((item) => (
                <span
                  key={item.slug}
                  data-name
                  className="universe-name absolute inset-x-0 bottom-0"
                  style={{ "--chars": item.name.length, transform: "translateY(105%)" } as CSSProperties}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="universe-orbit relative min-h-0 flex-1">
            {items.map((item) => (
              <span key={item.slug} data-glow aria-hidden className="universe-glow" style={{ "--glow": item.scene.glow, opacity: 0 } as CSSProperties} />
            ))}
            {items.map((item, index) => {
              const start = pose(index + ENTER_FROM, SPREAD.desktop, dir);
              return (
                <AppLink
                  key={item.slug}
                  href={workHref(item.slug)}
                  transitionLabel={item.project.title}
                  data-card={item.slug}
                  data-cursor={copy.ui.view}
                  aria-hidden
                  tabIndex={-1}
                  className="universe-card"
                  style={{ transform: transformOf(start), opacity: start.opacity, zIndex: zIndexAt(index + ENTER_FROM) }}
                >
                  <item.scene.Scene />
                </AppLink>
              );
            })}
          </div>

          <div className="universe-copy relative">
            {items.map((item, index) => (
              <div key={item.slug} data-copy className="absolute inset-x-0 top-0 flex flex-col items-center px-4 text-center" style={{ visibility: "hidden" }}>
                <h3 className="sr-only">{item.project.title}</h3>
                <div className="overflow-hidden">
                  <p data-line className="text-label text-sky" style={{ transform: "translateY(110%)" }}>
                    {pad(index + 1)} · {item.kicker}
                  </p>
                </div>
                <div className="mt-3 overflow-hidden">
                  <p data-line className="max-w-[40rem] text-[0.95rem] leading-snug text-muted md:text-base" style={{ transform: "translateY(110%)" }}>
                    {item.line}
                  </p>
                </div>
                <div className="-mx-4 mt-2 overflow-hidden px-4 pb-4 pt-2 max-sm:hidden">
                  <div data-line style={{ transform: "translateY(110%)" }}>
                    <ButtonLink href={workHref(item.slug)} variant="glass" transitionLabel={item.project.title} className="universe-cta">
                      {item.cta}
                    </ButtonLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reduced motion, or no script: each case as a row, its scene finished. */}
      <ol className="universe-list gutter flex flex-col gap-16 md:gap-24">
        {items.map((item, index) => (
          <li key={item.slug} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5">
              <p className="text-label text-sky">
                {pad(index + 1)} · {item.kicker}
              </p>
              <p aria-hidden className="universe-prefix mt-5">
                {item.prefix}
              </p>
              <h3 className="universe-name universe-name-static mt-2">{item.name}</h3>
              <p className="mt-4 max-w-md text-muted">{item.line}</p>
              <div className="mt-6">
                <ButtonLink href={workHref(item.slug)} variant="glass" transitionLabel={item.project.title}>
                  {item.cta}
                </ButtonLink>
              </div>
            </div>
            <div aria-hidden className="md:col-span-7">
              <div className="universe-card universe-card-static theme-dark">
                <item.scene.Scene />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/**
 * The master timeline, scrubbed by a pinned ScrollTrigger. Starting states are
 * set first; every tween that must reset on the way back up is a fromTo with
 * `immediateRender: false`, so building the timeline never disturbs them.
 * Scenes set their own starting states (their fromTo tweens render at once).
 */
function buildUniverse(track: HTMLElement, spread: number, dir: 1 | -1) {
  const q = gsap.utils.selector(track);
  const stage = q<HTMLElement>("[data-stage]")[0];
  const cards = q<HTMLElement>("[data-card]");
  const names = q<HTMLElement>("[data-name]");
  const prefixes = q<HTMLElement>("[data-prefix]");
  const copies = q<HTMLElement>("[data-copy]");
  const glows = q<HTMLElement>("[data-glow]");
  const counter = q<HTMLElement>("[data-counter]");
  const sky = q<HTMLElement>("[data-sky]");
  const lines = (index: number) => copies[index].querySelectorAll("[data-line]");
  const count = cards.length;
  const later = { immediateRender: false } as const;
  const height = track.style.height;

  // Where everything waits before the section: the orbit turned, every name and line below its mask.
  cards.forEach((card, index) => {
    const p = index + ENTER_FROM;
    gsap.set(card, { x: 0, y: 0, ...pose(p, spread, dir), zIndex: zIndexAt(p), pointerEvents: Math.abs(p) < 0.5 ? "auto" : "none" });
  });
  gsap.set([...names, ...prefixes], { yPercent: 105 });
  gsap.set(q("[data-line]"), { yPercent: 110 });
  gsap.set(copies, { autoAlpha: 0 });
  gsap.set(glows, { opacity: 0 });
  gsap.set(counter, { yPercent: 0 });

  const total = timelineLength(count);
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  /** The orbit turns from `from` to `to` (the index of the case in front), swinging every card along the arc. */
  const turn = (from: number, to: number, at: number, len: number) => {
    cards.forEach((card, index) => {
      const p0 = index - from;
      const p1 = index - to;
      if (Math.min(Math.abs(p0), Math.abs(p1)) > 2.5) return;
      tl.to(card, { keyframes: { ...arc(p0, p1, spread, dir), easeEach: "none" }, duration: len, ease: "power2.inOut" }, at);
      tl.set(card, { zIndex: zIndexAt(p1), pointerEvents: Math.abs(p1) < 0.5 ? "auto" : "none" }, at + len / 2);
    });
  };

  const textIn = (index: number, at: number) => {
    tl.set(copies[index], { autoAlpha: 1 }, at)
      .fromTo(glows[index], { opacity: 0 }, { opacity: 1, duration: 0.36, ease: "power1.inOut", ...later }, at - 0.08)
      .fromTo(prefixes[index], { yPercent: 105 }, { yPercent: 0, duration: 0.26, ease: "power3.out", ...later }, at)
      .fromTo(names[index], { yPercent: 105 }, { yPercent: 0, duration: 0.3, ease: "power3.out", ...later }, at + 0.02)
      .fromTo(lines(index), { yPercent: 110 }, { yPercent: 0, duration: 0.24, stagger: 0.045, ease: "power3.out", ...later }, at + 0.06);
  };

  const textOut = (index: number, at: number) => {
    tl.fromTo(glows[index], { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "power1.inOut", ...later }, at)
      .fromTo(prefixes[index], { yPercent: 0 }, { yPercent: -105, duration: 0.2, ease: "power3.in", ...later }, at)
      .fromTo(names[index], { yPercent: 0 }, { yPercent: -105, duration: 0.24, ease: "power3.in", ...later }, at)
      .fromTo(lines(index), { yPercent: 0 }, { yPercent: -110, duration: 0.18, stagger: 0.03, ease: "power3.in", ...later }, at)
      .set(copies[index], { autoAlpha: 0 }, at + 0.26);
  };

  // The sky turns with the orbit, the whole way through.
  tl.fromTo(sky, { rotation: 6 }, { rotation: -18, duration: total, ease: "none", ...later }, 0);

  // ENTER: the first case swings round to the front and its name rolls up.
  turn(-ENTER_FROM, 0, 0, UNITS.enter);
  textIn(0, UNITS.enter * 0.4);

  let time = UNITS.enter;
  cards.forEach((card, index) => {
    scenes[card.dataset.card ?? ""]?.build(tl, card, time, UNITS.story);

    const last = index === count - 1;
    time += UNITS.story + (last ? UNITS.lastHold : UNITS.hold);
    if (last) return;

    // MOVE: the orbit turns one step; names, lines and the counter roll to the next case.
    turn(index, index + 1, time, UNITS.move);
    textOut(index, time + 0.02);
    textIn(index + 1, time + UNITS.move * 0.45);
    tl.fromTo(
      counter,
      { yPercent: (-100 * index) / count },
      { yPercent: (-100 * (index + 1)) / count, duration: UNITS.move * 0.6, ease: "power3.inOut", ...later },
      time + UNITS.move * 0.25,
    );
    time += UNITS.move;
  });
  // The last hold is part of the timeline, not dead scroll after it.
  tl.set({}, {}, total);

  const distance = () => tl.duration() * SCREENS_PER_UNIT * window.innerHeight;
  const size = () => {
    track.style.height = `${window.innerHeight + distance()}px`;
  };
  size();
  ScrollTrigger.addEventListener("refreshInit", size);

  ScrollTrigger.create({
    animation: tl,
    trigger: track,
    start: "top top",
    end: () => `+=${distance()}`,
    pin: stage,
    // The track already has the height the pin needs; explicit is steadier than a pin-spacer.
    pinSpacing: false,
    scrub: 0.9,
  });

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", size);
    track.style.height = height;
  };
}
