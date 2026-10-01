"use client";

import { RevealText } from "@/versions/main/portfolio/ui/RevealText";
import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/main/portfolio/ui/SectionLabel";
import type { ContentBlock } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import Image from "next/image";

type PostsBlock = Omit<Extract<ContentBlock, { type: "posts" }>, "type">;

/**
 * Campaign work, shown whole.
 *
 * Social posts, screens and key visuals carry their own typography, so this
 * grid keeps each frame in its native shape and never crops into the artwork —
 * the way the work is presented in the company profile.
 */
const shapes = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  story: "aspect-[9/16]",
  phone: "aspect-[9/16]",
  /** Whole-page captures: shown complete, never cropped. */
  screen: "aspect-[3/4]",
  wide: "aspect-[16/9]",
};

export function ProjectPosts({ eyebrow, title, body, items, shape = "portrait", columns = 3, emerge }: PostsBlock) {
  const sizes = columns === 2 ? "(min-width: 768px) 46vw, 92vw" : "(min-width: 768px) 30vw, 45vw";

  return (
    <section className="gutter py-16 md:py-28">
      {eyebrow || title || body ? (
        <div className="mb-10 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            {eyebrow ? <SectionLabel className="mb-5">{eyebrow}</SectionLabel> : null}
            {title ? (
              <RevealText as="h2" mode="words" className="text-headline font-extrabold uppercase">
                {title}
              </RevealText>
            ) : null}
          </div>
          {body ? (
            <ScrollReveal variant="up" delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end">
              <p className="leading-relaxed text-muted">{body}</p>
            </ScrollReveal>
          ) : null}
        </div>
      ) : null}

      <ScrollReveal
        as="ul"
        targets="[data-post]"
        variant="up"
        stagger={0.08}
        className={cn("grid gap-4 md:gap-6", columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3")}
      >
        {items.map((item, i) => (
          <li key={item.src} data-post>
            <div
              data-companion-emerge={i === emerge || undefined}
              className={cn("relative overflow-hidden bg-surface", shapes[shape], shape === "screen" && "p-3 md:p-5")}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={sizes}
                className={cn(
                  "transition-transform duration-[1200ms] ease-[var(--ease-expo)] hover:scale-[1.04]",
                  // Whole-page captures fit inside their frame; long mobile captures are
                  // shown from the top; everything else fills its frame.
                  shape === "screen" ? "object-contain" : shape === "phone" ? "object-cover object-top" : "object-cover",
                )}
              />
              {i === emerge ? (
                // Washes the painted subject into the water once its 3D double has swum out (opacity set by CompanionScene).
                <div
                  data-companion-veil
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[#06111d]/70 opacity-0 backdrop-blur-md"
                  style={{
                    maskImage: "radial-gradient(ellipse 34% 30% at 50% 74%, #000 45%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 34% 30% at 50% 74%, #000 45%, transparent 100%)",
                  }}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
