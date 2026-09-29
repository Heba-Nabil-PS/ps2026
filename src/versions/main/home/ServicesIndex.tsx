"use client";

import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { serviceHref } from "@/versions/main/data/routes";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/**
 * Numbered services index (Oddlymade reference, principle P8). Each row shows
 * a thin slice of its image; hovering or focusing a row opens the slice into
 * a full frame in colour and brings the one-line summary in. Each row opens
 * its service page.
 */
export function ServicesIndex() {
  const { copy } = useCopy();
  const section = copy.home.services;
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="gutter section-y">
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

      <Reveal as="ol" className="mt-10 border-b border-line md:mt-14" stagger={0.07}>
        {copy.services.list.map((service, index) => {
          const open = active === service.slug;
          return (
            <li key={service.slug} data-reveal-item className="border-t border-line">
              <AppLink
                href={serviceHref(service.slug)}
                transitionLabel={service.title}
                onPointerEnter={() => setActive(service.slug)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(service.slug)}
                onBlur={() => setActive(null)}
                className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-4 py-6 md:grid-cols-12 md:gap-x-8 md:py-7"
              >
                <motion.div
                  className="relative col-span-3 hidden overflow-hidden rounded-xl bg-navy-800 md:col-span-4 md:block"
                  initial={false}
                  animate={{ height: open ? "clamp(10rem, 18vw, 17rem)" : "3.25rem" }}
                  transition={{ duration: 0.9, ease: ease.expo }}
                >
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 32vw, 1px"
                    quality={70}
                    className={cn("object-cover transition-[filter,transform] duration-1000 ease-expo", open ? "scale-100" : "mono scale-110")}
                  />
                </motion.div>

                <span className="text-label pt-2 tabular-nums text-subtle md:col-span-1 md:pt-3">{String(index + 1).padStart(2, "0")}</span>

                <div className="md:col-span-6">
                  <h3
                    className={cn(
                      "stretch text-[clamp(1.25rem,2.4vw,2.4rem)] leading-[0.95] transition-colors duration-500",
                      open ? "text-sky" : "text-fg",
                    )}
                    style={{ ["--wdth" as string]: 112 }}
                  >
                    <span data-line className="block">
                      {service.title}
                    </span>
                  </h3>
                  <motion.p
                    className="hidden max-w-md overflow-hidden text-sm text-muted md:block md:text-base"
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0, marginTop: open ? 14 : 0 }}
                    transition={{ duration: 0.7, ease: ease.expo }}
                  >
                    {service.summary}
                  </motion.p>
                  <p className="mt-3 text-sm text-muted md:hidden">{service.summary}</p>
                </div>

                <span
                  aria-hidden
                  className="grid size-10 place-items-center self-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 md:col-span-1 md:justify-self-end rtl:-scale-x-100"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </AppLink>
            </li>
          );
        })}
      </Reveal>
    </section>
  );
}
