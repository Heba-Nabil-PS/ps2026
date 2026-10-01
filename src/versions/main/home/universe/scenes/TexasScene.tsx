"use client";

import { assets } from "@/data/portfolio";
import { gsap } from "@/lib/gsap";
import { useCopy } from "@/versions/main/use-copy";
import Image from "next/image";
import { moment, type SceneBuild } from "./types";

const img = assets("texas-chicken").image;
const tiles = ["post-01", "post-02", "post-03", "post-04"];
/** The tile the visitor "orders". */
const PICK = 1;
const MARKETS = 16;

/** Order: the regional app — a featured banner, the menu, one pick, and what one app means for sixteen markets. */
export function TexasScene() {
  const t = useCopy().copy.home.work.universe.scenes.texas;

  return (
    <div className="absolute inset-0 flex flex-col gap-[2.6cqw] p-[4.6cqw]">
      <div data-s="banner" className="sc-glass relative h-[35cqw] shrink-0 overflow-hidden rounded-[3cqw]">
        <Image src={img("hero")} alt="" fill sizes="(min-width: 768px) 40vw, 80vw" quality={70} className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_7_13/0.88),rgb(3_7_13/0.35)_62%,transparent)] rtl:bg-[linear-gradient(270deg,rgb(3_7_13/0.88),rgb(3_7_13/0.35)_62%,transparent)]" />
        <div className="relative flex h-full flex-col items-start justify-end gap-[1.6cqw] p-[4cqw]">
          <span data-s="line" className="sc-label">{t.featured}</span>
          <span data-s="line" className="text-[5cqw] font-semibold leading-none tracking-[-0.03em]">{t.title}</span>
          <span data-s="line" className="sc-pill sc-pill-white">{t.action}</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-[2cqw]">
        {tiles.map((name, index) => (
          <div key={name} data-s="tile" data-pick={index === PICK || undefined} className="sc-glass relative aspect-square overflow-hidden rounded-[2.4cqw]">
            <Image src={img(name)} alt="" fill sizes="(min-width: 768px) 12vw, 22vw" quality={60} className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-950/85 to-transparent px-[1.4cqw] pb-[1cqw] pt-[3cqw] text-[1.8cqw] font-medium">
              {t.menu[index]}
            </span>
            {index === PICK && <span data-s="ring" className="sc-ring" />}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-[1.6cqw]">
        <span data-s="pill" className="sc-pill">
          <b data-s="markets" className="font-semibold tabular-nums">
            {MARKETS}
          </b>
          {t.markets}
        </span>
        <span data-s="pill" className="sc-pill sc-pill-hi">
          {t.coupon}
        </span>
        <span data-s="pill" className="sc-pill">
          {t.checkout}
        </span>
      </div>
    </div>
  );
}

export const buildTexas: SceneBuild = (tl, root, at, len) => {
  const q = gsap.utils.selector(root);
  const m = moment(at, len);
  const pick = q("[data-pick]");

  tl.fromTo(q("[data-s=banner]"), { yPercent: 12, scale: 0.94, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: len * 0.3, ease: "power3.out" }, m(0))
    .fromTo(q("[data-s=line]"), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.18, stagger: len * 0.05, ease: "power3.out" }, m(0.12))
    .fromTo(q("[data-s=tile]"), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.22, stagger: len * 0.05, ease: "power3.out" }, m(0.26))
    // The pick: the tile lifts and a white ring closes round it.
    .fromTo(pick, { yPercent: 0, scale: 1 }, { yPercent: -7, scale: 1.05, duration: len * 0.12, ease: "back.out(2)", immediateRender: false }, m(0.56))
    .fromTo(q("[data-s=ring]"), { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: len * 0.12, ease: "power2.out" }, m(0.56))
    .fromTo(q("[data-s=pill]"), { yPercent: 90, scale: 0.9, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: len * 0.16, stagger: len * 0.06, ease: "back.out(1.6)" }, m(0.66))
    .fromTo(q("[data-s=markets]"), { textContent: 1 }, { textContent: MARKETS, snap: { textContent: 1 }, duration: len * 0.26, ease: "power2.out" }, m(0.68));
};
