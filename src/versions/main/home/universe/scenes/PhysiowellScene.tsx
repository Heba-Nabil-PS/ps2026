"use client";

import { assets } from "@/data/portfolio";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useCopy } from "@/versions/main/use-copy";
import { TrendingUp } from "lucide-react";
import Image from "next/image";
import { moment, type SceneBuild } from "./types";

const img = assets("physiowell").image;

/** Three hooks, each run as its own test; `result` is its share of the winner's leads. */
const hooks = [
  { image: "post-01", result: 0.46 },
  { image: "post-02", result: 1 },
  { image: "post-03", result: 0.62 },
];
const WINNER = 1;
const ROAS = 10;
/** How far the hooks that lose fade back. */
const RETIRED = 0.42;

/** Scale: every hook is a test — the winner is scaled, the rest retired, and the return climbs to 10×. */
export function PhysiowellScene() {
  const t = useCopy().copy.home.work.universe.scenes.physiowell;

  return (
    <div className="absolute inset-0 flex flex-col gap-[2.8cqw] p-[4.6cqw]">
      <div className="flex h-[12cqw] shrink-0 items-stretch gap-[2.4cqw]">
        <div data-s="roas" className="sc-glass flex w-[30cqw] flex-col justify-center rounded-[2.4cqw] px-[2.6cqw]">
          <span className="sc-label">{t.roas}</span>
          <span className="text-[5.4cqw] font-semibold leading-none tracking-[-0.03em] text-sky tabular-nums">
            <span data-s="count">{ROAS}</span>×
          </span>
        </div>
        <div className="flex flex-1 flex-wrap content-center items-center gap-[1.4cqw]">
          {t.channels.map((channel) => (
            <span key={channel} data-s="chip" className="sc-pill">
              {channel}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[3cqw]">
        {hooks.map((hook, index) => {
          const won = index === WINNER;
          return (
            <div key={hook.image} data-s="hook" data-won={won || undefined} className="flex flex-col gap-[1.8cqw]">
              <div data-s="dim" style={won ? undefined : { opacity: RETIRED }} className="flex flex-col gap-[1.8cqw]">
                <div className="sc-glass relative aspect-5/6 overflow-hidden rounded-[2.4cqw]">
                  <Image src={img(hook.image)} alt="" fill sizes="(min-width: 768px) 14vw, 26vw" quality={60} className="object-cover" />
                  <span className="sc-pill absolute start-[1.4cqw] top-[1.4cqw] py-[0.5cqw]! text-[1.6cqw]">{t.hooks[index]}</span>
                  {won && <span data-s="ring" className="sc-ring" />}
                </div>
                <div className="h-[1.2cqw] overflow-hidden rounded-full bg-white/10">
                  <div data-s="bar" data-to={hook.result} style={{ transform: `scaleX(${hook.result})` }} className={cn("h-full origin-left rounded-full rtl:origin-right", won ? "bg-sky" : "bg-steel/70")} />
                </div>
              </div>
              <span data-s="status" className={cn("sc-pill w-fit gap-[0.8cqw]", won && "sc-pill-hi")}>
                {won && <TrendingUp className="size-[2cqw]" />}
                {won ? t.scaled : t.retired}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const buildPhysiowell: SceneBuild = (tl, root, at, len) => {
  const q = gsap.utils.selector(root);
  const m = moment(at, len);
  const won = q("[data-won]");
  const lost = q<HTMLElement>("[data-s=hook]:not([data-won]) [data-s=dim]");

  tl.fromTo(q("[data-s=hook]"), { yPercent: 16, rotateX: 18, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: len * 0.26, stagger: len * 0.05, ease: "power3.out" }, m(0))
    .fromTo(q("[data-s=roas]"), { xPercent: -10, opacity: 0 }, { xPercent: 0, opacity: 1, duration: len * 0.2, ease: "power3.out" }, m(0.08))
    .fromTo(q("[data-s=chip]"), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: len * 0.12, stagger: len * 0.04, ease: "back.out(2)" }, m(0.14));

  // The test runs: every bar fills at once and the winner pulls ahead.
  q<HTMLElement>("[data-s=bar]").forEach((bar) => {
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: Number(bar.dataset.to), duration: len * 0.34, ease: "power2.inOut" }, m(0.26));
  });

  tl.fromTo(q("[data-s=status]"), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.12, stagger: len * 0.04, ease: "back.out(1.8)" }, m(0.58))
    .fromTo(lost, { opacity: 1 }, { opacity: RETIRED, duration: len * 0.16, ease: "power2.out" }, m(0.6))
    .fromTo(won, { yPercent: 0, scale: 1 }, { yPercent: -4, scale: 1.04, duration: len * 0.14, ease: "back.out(2)", immediateRender: false }, m(0.6))
    .fromTo(q("[data-s=ring]"), { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: len * 0.12, ease: "power2.out" }, m(0.6))
    .fromTo(q("[data-s=count]"), { textContent: 0 }, { textContent: ROAS, snap: { textContent: 1 }, duration: len * 0.34, ease: "power2.out" }, m(0.6));
};
