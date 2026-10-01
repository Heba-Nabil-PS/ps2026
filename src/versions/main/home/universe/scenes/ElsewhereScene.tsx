"use client";

import { assets } from "@/data/portfolio";
import { gsap } from "@/lib/gsap";
import { useCopy } from "@/versions/main/use-copy";
import Image from "next/image";
import { moment, type SceneBuild } from "./types";

const img = assets("elsewhere-developments").image;

/** One destination per place: its pin on the map (viewBox units, 100 × 80) and its card in the fan (offset from centre, cqw). */
const places = [
  { image: "post-01", pin: { x: 20, y: 30 }, offset: -24, tilt: -7 },
  { image: "post-02", pin: { x: 52, y: 17 }, offset: 0, tilt: 0 },
  { image: "post-03", pin: { x: 81, y: 33 }, offset: 24, tilt: 7 },
];
/** The destination in focus at the end. */
const FOCUS = 1;
const CARD = 22;

/** Arrive: three destinations land on one map and fan out as one family. */
export function ElsewhereScene() {
  const t = useCopy().copy.home.work.universe.scenes.elsewhere;

  return (
    <div className="absolute inset-[4.6cqw]">
      <div data-s="map" className="sc-glass absolute inset-0 overflow-hidden rounded-[3cqw]">
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id="elsewhere-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.28" fill="rgb(169 186 203 / 0.28)" />
            </pattern>
          </defs>
          <rect width="100" height="80" fill="url(#elsewhere-dots)" />
          {/* The coast: sea below the line. */}
          <path d="M0 50 C 18 44, 30 56, 48 49 S 78 40, 100 47 L100 80 L0 80 Z" fill="rgb(140 196 230 / 0.07)" />
          <path d="M0 50 C 18 44, 30 56, 48 49 S 78 40, 100 47" fill="none" stroke="rgb(140 196 230 / 0.35)" strokeWidth="0.3" />
          <path
            data-s="route"
            d="M20 30 C 30 14, 42 14, 52 17 S 72 36, 81 33"
            pathLength={1}
            strokeDasharray="1"
            fill="none"
            stroke="var(--color-sky)"
            strokeWidth="0.45"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {places.map((place, index) => (
          <span
            key={place.image}
            data-s="pin"
            className="absolute grid size-[3.6cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sky text-[1.7cqw] font-semibold text-ink-900 shadow-[0_0_0_1cqw_rgb(140_196_230/0.18),0_0_3cqw_rgb(140_196_230/0.6)]"
            style={{ left: `${place.pin.x}%`, top: `${(place.pin.y / 80) * 100}%` }}
          >
            {index + 1}
          </span>
        ))}

        <div className="absolute inset-x-[2.6cqw] top-[2.6cqw] flex items-center justify-between gap-[1.6cqw]">
          <span data-s="pill" className="sc-pill">
            <b data-s="count" className="font-semibold tabular-nums">
              {places.length}
            </b>
            {t.count}
          </span>
          <span data-s="launch" className="sc-pill sc-pill-hi gap-[1cqw]">
            <i className="block size-[1.2cqw] rounded-full bg-sky shadow-[0_0_1.2cqw_var(--color-sky)]" />
            {t.launch}
          </span>
          <span data-s="pill" className="sc-pill">
            {t.system}
          </span>
        </div>
      </div>

      {places.map((place, index) => (
        <div
          key={place.image}
          data-s="card"
          data-offset={(-place.offset / CARD) * 100}
          data-tilt={place.tilt}
          className="sc-glass absolute bottom-[3cqw] aspect-4/5 overflow-hidden rounded-[2.4cqw] shadow-[0_2cqw_4cqw_-1cqw_rgb(0_0_0/0.55)]"
          style={{
            width: `${CARD}cqw`,
            insetInlineStart: `calc(50% - ${CARD / 2}cqw + ${place.offset}cqw)`,
            transform: `rotate(${place.tilt}deg)${index === FOCUS ? " translateY(-14%)" : ""}`,
            zIndex: index === FOCUS ? 2 : 1,
          }}
        >
          <Image src={img(place.image)} alt="" fill sizes="(min-width: 768px) 12vw, 22vw" quality={60} className="object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/90 to-transparent px-[1.4cqw] pb-[1.2cqw] pt-[5cqw] text-[1.8cqw] font-medium leading-tight">
            {t.places[index]}
          </span>
          {index === FOCUS && <span data-s="ring" className="sc-ring" />}
        </div>
      ))}
    </div>
  );
}

export const buildElsewhere: SceneBuild = (tl, root, at, len) => {
  const q = gsap.utils.selector(root);
  const m = moment(at, len);
  const dir = getComputedStyle(root).direction === "rtl" ? -1 : 1;
  const cards = q<HTMLElement>("[data-s=card]");

  tl.fromTo(q("[data-s=map]"), { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: len * 0.26, ease: "power3.out" }, m(0))
    .fromTo(q("[data-s=pill]"), { yPercent: -70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.14, stagger: len * 0.05, ease: "back.out(1.6)" }, m(0.1))
    .fromTo(q("[data-s=route]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: len * 0.4, ease: "power1.inOut" }, m(0.18))
    .fromTo(q("[data-s=pin]"), { yPercent: -110, scale: 0.4, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: len * 0.14, stagger: len * 0.13, ease: "back.out(2.2)" }, m(0.18))
    .fromTo(q("[data-s=count]"), { textContent: 1 }, { textContent: cards.length, snap: { textContent: 1 }, duration: len * 0.3, ease: "none" }, m(0.2));

  // The cards leave one stack in the middle and fan out; the one in focus rises.
  cards.forEach((card, index) => {
    const focus = index === FOCUS;
    tl.fromTo(
      card,
      { xPercent: Number(card.dataset.offset) * dir, yPercent: 30, rotation: 0, opacity: 0 },
      { xPercent: 0, yPercent: focus ? -14 : 0, rotation: Number(card.dataset.tilt), opacity: 1, duration: len * 0.3, ease: "power3.inOut" },
      m(0.36 + (focus ? 0 : 0.04)),
    );
  });

  tl.fromTo(q("[data-s=ring]"), { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: len * 0.12, ease: "power2.out" }, m(0.68))
    .fromTo(q("[data-s=launch]"), { yPercent: 60, scale: 0.8, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: len * 0.14, ease: "back.out(1.8)" }, m(0.78));
};
