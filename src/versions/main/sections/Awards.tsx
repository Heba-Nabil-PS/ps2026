"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { Label } from "@/versions/main/ui/Label";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";
import { useRef, useState } from "react";

type Award = { file: string; surface: string; kind: string; title: string; issuer: string; body: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Awards and partnerships as a stage and a ledger. From lg up the badge plate holds still on a
 * sticky stage while the numbered rows scroll past it: whichever row crosses the middle of the
 * screen (or is hovered) takes the stage, its plate wiping in with one pass of light, and the
 * rail beside the rows fills with the scroll. Below lg every row carries its own plate.
 * Badges keep their own colours (third-party marks), each on a plate of its own background.
 */
export function Awards({ label, title, intro, awards }: { label: string; title: readonly string[]; intro?: string; awards: readonly Award[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      // The row crossing the middle of the screen takes the stage (a state change, so it runs under reduced motion too).
      mm.add("(min-width: 64rem)", () => {
        el.querySelectorAll<HTMLElement>("[data-award-row]").forEach((row, i) => {
          ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setActive(i) });
        });
      });

      mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-award-rail]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-award-list]", start: "top 55%", end: "bottom 55%", scrub: 0.6 } },
        );
      });

      // The plate leans toward the pointer, a few degrees at most.
      mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const stage = el.querySelector<HTMLElement>("[data-award-stage]");
        const tilt = el.querySelector<HTMLElement>("[data-award-tilt]");
        if (!stage || !tilt) return;
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx(((e.clientY - r.top) / r.height - 0.5) * -10);
        };
        const leave = () => (rx(0), ry(0));
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="awards" className="gutter scroll-mt-24 pb-[clamp(5.5rem,12vw,11rem)]">
      <SectionHead label={label} title={title} intro={intro} />

      <div className="mt-14 md:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        {/* The stage: decorative on lg, the rows below carry the text. */}
        <div aria-hidden className="hidden lg:col-span-5 lg:block">
          <div data-award-stage className="sticky top-[20vh] [perspective:1200px]">
            <div data-award-tilt className="relative aspect-[3/2] w-full overflow-hidden rounded-frame border border-line [transform-style:preserve-3d]">
              {awards.map((award, i) => (
                <div
                  key={award.file}
                  className={cn(
                    "absolute inset-0 grid place-items-center transition-[clip-path] duration-[1.1s] ease-quart motion-reduce:transition-none",
                    i === active ? "z-10 [clip-path:inset(0_0_0_0)]" : i < active ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(100%_0_0_0)]",
                  )}
                  style={{ backgroundColor: award.surface }}
                >
                  <Image
                    src={`/images/awards/${award.file}.svg`}
                    alt=""
                    fill
                    unoptimized
                    className={cn(
                      "object-contain p-[8%] transition-[transform,filter,opacity] duration-[1.4s] ease-expo motion-reduce:transition-none",
                      i === active ? "scale-100 opacity-100 blur-0" : "scale-[1.18] opacity-0 blur-sm",
                    )}
                  />
                  {/* One pass of light, replayed each time this plate takes the stage. */}
                  {i === active && (
                    <span
                      key={`shine-${active}`}
                      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-overlay motion-reduce:hidden"
                      style={{ animation: "award-shine 1.6s 0.25s var(--ease-out-strong) both" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The ledger. */}
        <div data-award-list className="relative lg:col-span-7">
          <span aria-hidden className="absolute inset-y-0 start-0 hidden w-px bg-line lg:block" />
          <span aria-hidden data-award-rail className="absolute inset-y-0 start-0 hidden w-px origin-top bg-sky lg:block" />

          <Reveal as="ol" className="grid gap-4 lg:gap-0" stagger={0.1}>
            {awards.map((award, i) => {
              const on = i === active;
              return (
                <li
                  key={award.file}
                  data-reveal-item
                  data-award-row
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  className="group rounded-card border border-line bg-ink-850/50 p-3 lg:flex lg:min-h-[22vh] lg:py-10 lg:flex-col lg:justify-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:ps-10"
                >
                  {/* Below lg each row brings its own plate. The badge fills it inside a margin: a percentage height
                      in an auto grid row overflowed the plate on iOS and clipped the mark. */}
                  <div
                    className="relative aspect-2/1 overflow-hidden rounded-[calc(var(--radius-card)-0.75rem)] lg:hidden"
                    style={{ backgroundColor: award.surface }}
                  >
                    <Image
                      src={`/images/awards/${award.file}.svg`}
                      alt={`${award.title}, ${award.issuer}`}
                      fill
                      unoptimized
                      className="object-contain p-[6%]"
                    />
                  </div>

                  <div className={cn("px-4 pt-7 pb-4 transition-opacity duration-700 ease-expo lg:p-0", !on && "lg:opacity-35")}>
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden
                        className={cn(
                          "stretch hidden text-[clamp(1.25rem,2vw,2rem)] leading-none transition-colors duration-700 ease-expo lg:block",
                          on ? "text-sky" : "text-outline",
                        )}
                      >
                        {pad(i + 1)}
                      </span>
                      <Label>{award.kind}</Label>
                    </div>
                    <h3 className="mt-3 text-title font-medium lg:mt-4">{award.title}</h3>
                    {/* Skip the issuer when the title already names it ("Meta Business Partner" / "Meta"). */}
                    {!award.title.includes(award.issuer) && <p className="mt-3 text-sm text-subtle">{award.issuer}</p>}
                    <p
                      className={cn(
                        "mt-4 max-w-[34rem] border-t border-line pt-4 text-muted transition-[transform,opacity] duration-700 ease-expo motion-reduce:transition-none",
                        !on && "lg:translate-y-2",
                      )}
                    >
                      {award.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
