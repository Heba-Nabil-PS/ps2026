"use client";

import { useSound } from "@/versions/option-2/components/sound/SoundProvider";
import { SplitReveal } from "@/versions/option-2/components/studio/SplitReveal";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, type MotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type Discipline = { title: string; body: string; image: string };

/**
 * Scene 5 — the crafts. A dark sheet rises over the page (its corners
 * flatten as it docks), rows draw their rules and titles slide up from masks.
 * On desktop, hovering a row summons a floating preview that follows the
 * cursor, leans into its velocity and wipes between images.
 */
export function TeamDisciplines() {
  const { disciplines } = useContent().teamPage;
  const rich = useRichInteractions();
  const { play } = useSound();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useSectionTheme(section, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          section.current,
          { borderTopLeftRadius: "4rem", borderTopRightRadius: "4rem" },
          {
            borderTopLeftRadius: "0rem",
            borderTopRightRadius: "0rem",
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } });
          tl.from(row.querySelector("[data-row-rule]"), { scaleX: 0, duration: 1.4, ease: "expo.inOut" })
            .from(row.querySelector("[data-row-title]"), { yPercent: 110, duration: 1.3, ease: "expo.out" }, 0.25)
            .from(row.querySelectorAll("[data-row-fade]"), { y: 20, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.4);
        });
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-labelledby="disciplines-title"
      className="relative overflow-hidden rounded-t-[4rem] bg-[#07121f] px-4 pb-28 pt-28 text-[#f2f3f5] md:px-8 md:pb-28 md:pt-32"
    >
      <div className="mb-16 grid grid-cols-1 gap-8 md:mb-24 md:grid-cols-12">
        <p className="text-label flex items-center gap-2 text-white/50 md:col-span-4">
          <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
          {disciplines.label}
        </p>
        <SplitReveal as="h2" id="disciplines-title" type="lines" className="font-medium tracking-[-0.045em] text-[clamp(2.25rem,4.2vw,4.5rem)] leading-[1.02] md:col-span-8">
          {disciplines.title.map((line, index) => (
            <span key={line} className={cn("block", index === 1 && "font-serif font-light italic text-[#88bbd8]")}>
              {line}
            </span>
          ))}
        </SplitReveal>
      </div>

      <ul
        onPointerMove={(event) => {
          x.set(event.clientX);
          y.set(event.clientY);
        }}
        onPointerLeave={() => setActive(null)}
      >
        {disciplines.items.map((item, index) => (
          <li
            key={item.title}
            data-row
            className="group relative"
            onPointerEnter={() => {
              if (!rich) return;
              setActive(index);
              play("hover");
            }}
          >
            <span data-row-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-[0%_50%] bg-white/15 rtl:origin-[100%_50%]" />
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-[0%_50%] scale-x-0 bg-[#88bbd8] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100 rtl:origin-[100%_50%]"
            />
            <div className="grid grid-cols-12 items-baseline gap-x-4 gap-y-3 py-7 md:py-10">
              <span data-row-fade className="text-label col-span-2 tabular-nums text-white/40 md:col-span-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="col-span-10 overflow-hidden md:col-span-6">
                <span data-row-title className="block">
                  <span className="block font-medium tracking-[-0.045em] text-[clamp(2rem,3.8vw,3.75rem)] leading-[1] transition-[transform,color] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-6 group-hover:text-[#88bbd8] rtl:group-hover:-translate-x-6">
                    {item.title}
                  </span>
                </span>
              </h3>
              <p data-row-fade className="col-span-10 col-start-3 max-w-sm text-sm leading-relaxed text-white/55 md:col-span-4 md:col-start-9 md:text-base">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {rich ? <Preview items={disciplines.items} active={active} x={x} y={y} /> : null}
    </section>
  );
}

type PreviewProps = {
  items: readonly Discipline[];
  active: number | null;
  x: MotionValue<number>;
  y: MotionValue<number>;
};

/** Cursor-following preview, portalled to <body> so no transformed ancestor can offset `position: fixed`. */
function Preview({ items, active, x, y }: PreviewProps) {
  const springX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.5 });
  const rotate = useTransform(useVelocity(springX), [-2500, 2500], [-14, 14], { clamp: true });

  return createPortal(
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[80]" style={{ x: springX, y: springY, rotate }}>
      <motion.div
        className="relative -ml-[8.5rem] -mt-[10.5rem] h-[21rem] w-[17rem] overflow-hidden rounded-[1.25rem] bg-[#16304f] shadow-[0_40px_80px_-30px_rgba(3,7,13,0.6)]"
        initial={false}
        animate={{ scale: active === null ? 0 : 1, opacity: active === null ? 0 : 1 }}
        transition={{ duration: 0.6, ease: ease.expo }}
      >
        <AnimatePresence initial={false}>
          {active !== null ? (
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.3, zIndex: 2 }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, zIndex: 2 }}
              exit={{ zIndex: 1, transition: { duration: 0.7 } }}
              transition={{ duration: 0.7, ease: ease.expo }}
            >
              <Image src={items[active].image} alt="" fill sizes="272px" className="object-cover" />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {/* Warm the cache so the first hover of each row never shows an empty frame. */}
        <div className="invisible absolute inset-0">
          {items.map((item) => (
            <Image key={item.image} src={item.image} alt="" fill sizes="272px" className="object-cover" />
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
