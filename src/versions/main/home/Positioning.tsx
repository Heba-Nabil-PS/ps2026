import { getServerCopy } from "@/versions/main/server";
import { MotionBlurReveal } from "@/versions/main/motion/MotionBlurReveal";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Label } from "@/versions/main/ui/Label";
import Image from "next/image";

/**
 * Who we are: the positioning line from the deck, read word by word, beside
 * a black-and-white figure in motion. Three pillars close the thought.
 */
export async function Positioning() {
  const { copy } = await getServerCopy();
  const section = copy.home.positioning;

  return (
    <section className="gutter section-y">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <MotionBlurReveal className="aspect-[4/5] rounded-card md:col-span-5">
          <Image data-media src="/images/site/sky.webp" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" quality={75} className="mono object-cover" />
        </MotionBlurReveal>
        <div className="flex flex-col md:col-span-6 md:col-start-7">
          <Label className="mb-10">{section.label}</Label>
          <ScrollHighlight
            text={section.statement}
            highlight={section.pillars.map((pillar) => pillar.title)}
            className="text-[clamp(1.4rem,2.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]"
          />
          <Reveal as="dl" className="mt-auto grid gap-8 pt-12 sm:grid-cols-3" stagger={0.1}>
            {section.pillars.map((pillar, index) => (
              <div key={pillar.title} data-reveal-item className="border-t border-line-strong pt-5">
                <dt className="flex items-baseline gap-3 font-medium">
                  <span className="text-label tabular-nums text-sky">{String(index + 1).padStart(2, "0")}</span>
                  {pillar.title}
                </dt>
                <dd className="mt-2 text-sm text-muted">{pillar.body}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
