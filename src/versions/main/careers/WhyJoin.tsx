"use client";

import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { AnimatePresence, motion } from "framer-motion";
import { ChartLine, Gem, Sprout, Users } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

const icons = [Gem, Users, ChartLine, Sprout];

/**
 * Why join: a blue-duotone image panel, as tall as the list, beside four reasons. Hovering, focusing or
 * tapping a reason opens it in place and cross-fades the panel to its photo.
 * One reason is always open.
 */
export function WhyJoin({
  label,
  title,
  intro,
  items,
}: {
  label: string;
  title: readonly string[];
  intro: string;
  items: readonly { title: string; body: string; image: string }[];
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const current = items[active];
  const CurrentIcon = icons[active % icons.length];

  return (
    <section className="gutter section-y">
      <SectionHead label={label} title={title} intro={intro} />

      <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:items-stretch lg:gap-16">
        <div className="theme-dark relative aspect-[4/5] overflow-hidden rounded-card bg-navy-800 sm:aspect-[16/11] lg:col-span-6 lg:aspect-auto lg:h-full lg:min-h-[28rem]">
          {items.map((item, index) => (
            <Image
              key={item.image}
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={75}
              className={cn(
                "object-cover grayscale contrast-[1.1] transition-[opacity,transform] duration-[1.2s] ease-expo",
                index === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0",
              )}
            />
          ))}
          {/* Blue duotone: the grey photo takes the brand blue, then the shadows sink to navy. */}
          <div aria-hidden className="absolute inset-0 bg-[#2f7fc1] mix-blend-color" />
          <div aria-hidden className="absolute inset-0 bg-[#0b2a4a] mix-blend-multiply opacity-60" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(3_7_13/0.8))]" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: ease.expo }}
              className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8"
            >
              <span className="mb-5 grid size-12 place-items-center rounded-full bg-sky text-ink-900">
                <CurrentIcon aria-hidden className="size-5" />
              </span>
              <p className="text-title font-medium text-paper">{current.title}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal as="ul" className="border-b border-line lg:col-span-6" stagger={0.08}>
          {items.map((item, index) => {
            const expanded = index === active;
            const Icon = icons[index % icons.length];
            const panelId = `${id}-${index}`;
            return (
              <li key={item.title} data-reveal-item className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="group flex w-full items-center gap-5 py-7 text-start"
                  >
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-500",
                        expanded ? "border-sky bg-sky text-ink-900" : "border-line-strong text-subtle group-hover:border-sky group-hover:text-sky",
                      )}
                    >
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <span className={cn("text-title flex-1 font-medium transition-colors duration-500", expanded ? "text-fg" : "text-muted group-hover:text-fg")}>
                      {item.title}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.7, ease: ease.expo }}
                      className="overflow-hidden"
                    >
                      <p className="text-lead max-w-xl ps-16 pb-8 text-muted">{item.body}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
