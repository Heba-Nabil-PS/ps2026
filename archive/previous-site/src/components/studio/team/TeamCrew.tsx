"use client";

import { Magnetic } from "@/components/animations/Magnetic";
import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent, useDirectionSign } from "@/i18n/LocaleProvider";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";

/* Where each column's cards come from: start, below (with depth), end. */
const entrances = [
  { xPercent: -30, yPercent: 20, rotate: -6, rotationX: 0 },
  { xPercent: 0, yPercent: 45, rotate: 0, rotationX: 35 },
  { xPercent: 30, yPercent: 20, rotate: 6, rotationX: 0 },
];

/**
 * Scene 4 — the people. Cards arrive with depth from three directions as
 * their row enters, the middle column drifts against the scroll, and on
 * hover each card tilts toward the cursor while its photo moves the other way.
 */
export function TeamCrew() {
  const { teamPage, site } = useContent();
  const { crew } = teamPage;
  const sign = useDirectionSign();
  const section = useRef<HTMLElement>(null);

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-crew-card]");
        const columns = window.matchMedia("(min-width: 768px)").matches ? 3 : 1;
        const fromFor = (el: HTMLElement) => {
          const e = entrances[columns === 3 ? Number(el.dataset.index) % 3 : 1];
          return { ...e, xPercent: e.xPercent * sign, rotate: e.rotate * sign, scale: 0.86, autoAlpha: 0 };
        };
        cards.forEach((card) => gsap.set(card, fromFor(card)));
        gsap.set("[data-crew-media]", { clipPath: "inset(100% 0% 0% 0%)" });

        // Trigger on the grid cells: the cards themselves start offset, which would skew their start points.
        ScrollTrigger.batch("[data-crew-cell]", {
          start: "top 88%",
          once: true,
          onEnter: (cells) => {
            const batch = cells.map((cell) => cell.querySelector<HTMLElement>("[data-crew-card]")!);
            gsap.to(batch, { xPercent: 0, yPercent: 0, rotate: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 1.6, ease: "expo.out", stagger: 0.12 });
            const media = batch.map((card) => card.querySelector("[data-crew-media]")).filter(Boolean);
            if (media.length) gsap.to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", stagger: 0.12, delay: 0.1 });
          },
        });

        // Staggered-grid feel: the middle column travels against the scroll on desktop.
        if (columns === 3) {
          gsap.fromTo(
            "[data-crew-drift]",
            { yPercent: 12 },
            { yPercent: -12, ease: "none", scrollTrigger: { trigger: "[data-crew-grid]", start: "top bottom", end: "bottom top", scrub: true } },
          );
        }

        gsap.from("[data-crew-fade]", {
          y: 30,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: section, dependencies: [sign], revertOnUpdate: true },
  );

  return (
    <section ref={section} id="crew" aria-labelledby="crew-title" className="relative bg-[#eceef2] px-4 pb-32 text-[#0b0c0e] md:px-8 md:pb-48">
      <div className="grid grid-cols-1 items-end gap-8 border-t border-black/10 pt-16 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-7">
          <p data-crew-fade className="text-label mb-8 flex items-center gap-2 text-black/50">
            <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
            {crew.label}
          </p>
          <SplitReveal as="h2" id="crew-title" type="lines" className="font-medium tracking-[-0.045em] text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95]">
            {crew.title.map((line, index) => (
              <span key={line} className={cn("block", index === 1 && "font-serif font-light italic text-[#122443]")}>
                {line}
              </span>
            ))}
          </SplitReveal>
        </div>
        <p data-crew-fade className="max-w-sm text-base leading-snug text-black/60 md:col-span-4 md:col-start-9 md:text-lg">
          {crew.intro}
        </p>
      </div>

      <ul data-crew-grid className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 [perspective:1400px] sm:grid-cols-2 md:mt-24 md:grid-cols-3 md:gap-y-20">
        {site.team.members.map((member, index) => (
          <li key={member.name} data-crew-cell data-crew-drift={index % 3 === 1 ? "" : undefined}>
            <div data-crew-card data-index={index} className="will-change-transform">
              <MemberCard
                index={index}
                name={member.name}
                role={member.role}
                image={crew.images[index % crew.images.length]}
                cursorLabel={crew.cursor}
              />
            </div>
          </li>
        ))}
        <li data-crew-cell data-crew-drift={site.team.members.length % 3 === 1 ? "" : undefined}>
          <div data-crew-card data-index={site.team.members.length} className="h-full will-change-transform">
            <MoreCard {...crew.more} />
          </div>
        </li>
      </ul>
    </section>
  );
}

type MemberCardProps = { index: number; name: string; role: string; image: string; cursorLabel: string };

/** Pointer-tilted card with inner-image parallax and a cursor-following glare. */
function MemberCard({ index, name, role, image, cursorLabel }: MemberCardProps) {
  const rich = useRichInteractions();
  const { play } = useSound();
  const bounds = useRef<DOMRect | null>(null);
  const rotateX = useSpring(0, springs.soft);
  const rotateY = useSpring(0, springs.soft);
  const imageX = useSpring(0, springs.soft);
  const imageY = useSpring(0, springs.soft);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 55%)`;

  const onMove = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = bounds.current;
    if (!rich || !rect || event.pointerType !== "mouse") return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 12);
    rotateX.set(py * -12);
    imageX.set(px * -28);
    imageY.set(py * -28);
    glareX.set((px + 0.5) * 100);
    glareY.set((py + 0.5) * 100);
  };

  const reset = () => {
    bounds.current = null;
    [rotateX, rotateY, imageX, imageY].forEach((value) => value.set(0));
  };

  return (
    <motion.article
      className="group relative"
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={rich ? { scale: 1.025, rotate: index % 2 ? 1 : -1 } : undefined}
      transition={{ type: "spring", ...springs.soft }}
      onPointerEnter={(event) => {
        if (!rich) return;
        bounds.current = event.currentTarget.getBoundingClientRect();
        play("hover");
      }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      data-cursor="view"
      data-cursor-label={cursorLabel}
    >
      <div
        data-crew-media
        className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#dfe2e8] shadow-[0_40px_80px_-40px_rgba(11,12,14,0.45)]"
      >
        <motion.div className="absolute -inset-[6%]" style={{ x: imageX, y: imageY }}>
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover grayscale-[35%] transition-[transform,filter] duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.08] group-hover:grayscale-0"
          />
        </motion.div>
        {rich ? (
          <motion.div aria-hidden className="absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100" style={{ background: glare }} />
        ) : null}
        <span className="text-label absolute start-5 top-5 rounded-full bg-white/80 px-3 py-2 tabular-nums text-black/70 backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">
          <span className="link-underline">{name}</span>
        </h3>
        <p className="text-end text-sm text-black/55">{role}</p>
      </div>
    </motion.article>
  );
}

/** Closing card: the rest of the studio, with a magnetic arrow into /careers. */
function MoreCard({ value, title, action }: { value: string; title: string; action: string }) {
  const { play } = useSound();
  return (
    <TransitionLink
      href="/careers"
      transitionLabel={action}
      onPointerEnter={() => play("hover")}
      className="group relative flex aspect-[4/5] h-auto flex-col justify-between overflow-hidden rounded-[1.5rem] bg-[#0b0c0e] p-6 text-[#f2f3f5] md:p-8"
    >
      <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-[#122443] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-y-100" />
      <span className="relative font-medium tracking-[-0.06em] text-[clamp(4rem,9vw,8rem)] leading-[0.85] text-[#88bbd8]">{value}</span>
      <span className="relative flex items-end justify-between gap-6">
        <span className="max-w-[12ch] text-2xl font-medium leading-tight tracking-[-0.03em] md:text-3xl">{title}</span>
        <Magnetic strength={0.4}>
          <span className="grid size-16 place-items-center rounded-full bg-[#f2f3f5] text-[#0b0c0e] transition-colors duration-500 group-hover:bg-[#88bbd8]">
            <ArrowUpRight aria-hidden className="size-5 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45" />
            <span className="sr-only">{action}</span>
          </span>
        </Magnetic>
      </span>
    </TransitionLink>
  );
}
