"use client";

import { assets } from "@/data/portfolio";
import { gsap } from "@/lib/gsap";
import { useCopy } from "@/versions/main/use-copy";
import { Check, Heart } from "lucide-react";
import Image from "next/image";
import { moment, type SceneBuild } from "./types";

const img = assets("shark-tank-egypt").image;
const posts = ["post-01", "post-02", "post-03", "post-04"];
/** The post that takes off. */
const HIT = 2;

/** Pitch: the episode goes out on broadcast time, the feed fills, and the show's numbers climb. */
export function SharkScene() {
  const t = useCopy().copy.home.work.universe.scenes.shark;
  const stats = [
    { key: "views", label: t.views, value: 900, suffix: "M+" },
    { key: "pitches", label: t.pitches, value: 170, suffix: "+" },
    { key: "season", label: t.season, value: 4, suffix: "" },
  ];

  return (
    <div className="absolute inset-0 p-[4.6cqw]">
      <div className="flex h-[41cqw] gap-[2.6cqw]">
        <div data-s="player" className="sc-glass relative h-full flex-1 overflow-hidden rounded-[3cqw]">
          <Image src={img("hero")} alt="" fill sizes="(min-width: 768px) 36vw, 70vw" quality={70} className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/20 to-ink-950/30" />
          <span data-s="live" className="sc-pill absolute start-[2.6cqw] top-[2.6cqw] gap-[1cqw] py-[0.6cqw]! text-[1.6cqw] uppercase tracking-[0.12em]">
            <i className="block size-[1.2cqw] rounded-full bg-[#ff4d5e] shadow-[0_0_1.4cqw_#ff4d5e]" />
            {t.live}
          </span>
          <span data-s="drop" className="sc-pill sc-pill-hi absolute end-[2.6cqw] top-[2.6cqw] gap-[0.8cqw] py-[0.6cqw]! text-[1.6cqw]">
            <Check className="size-[1.9cqw]" strokeWidth={3} />
            {t.drop}
          </span>
          <div className="absolute inset-x-[2.6cqw] bottom-[2.6cqw]">
            <p className="text-[2.4cqw] font-medium">{t.episode}</p>
            <div className="mt-[1.4cqw] h-[0.6cqw] overflow-hidden rounded-full bg-white/15">
              <div data-s="progress" className="h-full origin-left rounded-full bg-sky rtl:origin-right" />
            </div>
          </div>
        </div>

        <div className="flex w-[27cqw] flex-col gap-[2cqw]">
          {stats.map((stat) => (
            <div key={stat.key} data-s="stat" className="sc-glass flex flex-1 flex-col justify-center rounded-[2.4cqw] px-[2.4cqw]">
              <span className="sc-label">{stat.label}</span>
              <span className="mt-[0.6cqw] text-[4.4cqw] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                <span data-s="count" data-to={stat.value}>
                  {stat.value}
                </span>
                {stat.suffix}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[2.6cqw] grid grid-cols-4 gap-[2cqw]">
        {posts.map((name, index) => (
          <div key={name} data-s="post" data-hit={index === HIT || undefined} className="sc-glass relative aspect-square overflow-hidden rounded-[2.4cqw]">
            <Image src={img(name)} alt="" fill sizes="(min-width: 768px) 12vw, 22vw" quality={60} className="object-cover" />
            {index === HIT && (
              <>
                <span data-s="ring" className="sc-ring" />
                <span data-s="heart" className="absolute bottom-[1.2cqw] end-[1.2cqw] grid size-[4.4cqw] place-items-center rounded-full bg-white text-[#ff4d5e] shadow-[0_0.8cqw_2cqw_rgb(0_0_0/0.4)]">
                  <Heart className="size-[2.4cqw] fill-current" />
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const buildShark: SceneBuild = (tl, root, at, len) => {
  const q = gsap.utils.selector(root);
  const m = moment(at, len);

  tl.fromTo(q("[data-s=player]"), { scale: 0.92, rotateX: 10, opacity: 0 }, { scale: 1, rotateX: 0, opacity: 1, duration: len * 0.3, ease: "power3.out" }, m(0))
    .fromTo(q("[data-s=live]"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: len * 0.1, ease: "back.out(2)" }, m(0.14))
    .fromTo(q("[data-s=progress]"), { scaleX: 0 }, { scaleX: 1, duration: len * 0.8, ease: "none" }, m(0.14))
    .fromTo(q("[data-s=stat]"), { xPercent: 18, opacity: 0 }, { xPercent: 0, opacity: 1, duration: len * 0.2, stagger: len * 0.06, ease: "power3.out" }, m(0.2))
    .fromTo(q("[data-s=post]"), { yPercent: 36, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.2, stagger: len * 0.05, ease: "power3.out" }, m(0.32));

  q<HTMLElement>("[data-s=count]").forEach((el, index) => {
    tl.fromTo(el, { textContent: 0 }, { textContent: Number(el.dataset.to), snap: { textContent: 1 }, duration: len * 0.4, ease: "power2.out" }, m(0.26 + index * 0.06));
  });

  tl.fromTo(q("[data-s=ring]"), { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: len * 0.12, ease: "power2.out" }, m(0.6))
    .fromTo(q("[data-s=heart]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: len * 0.12, ease: "back.out(3)" }, m(0.64))
    .fromTo(q("[data-s=drop]"), { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: len * 0.14, ease: "back.out(1.8)" }, m(0.8));
};
