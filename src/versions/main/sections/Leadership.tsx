import { getServerCopy } from "@/versions/main/server";
import { MotionBlurReveal } from "@/versions/main/motion/MotionBlurReveal";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { Label } from "@/versions/main/ui/Label";
import Image from "next/image";

/** Leadership: the founder's portrait in black and white beside their quote. Shared by About and Team. */
export async function Leadership() {
  const { copy, site } = await getServerCopy();
  const section = copy.team.leadership;
  const lead = site.team.lead;

  return (
    <section className="gutter section-y grid items-center gap-12 md:grid-cols-12">
      <div className="relative md:col-span-5">
        <MotionBlurReveal className="aspect-[4/5] rounded-frame">
          <Image data-media src={lead.image} alt={section.portraitAlt} fill sizes="(min-width: 768px) 40vw, 100vw" quality={80} className="mono object-cover object-top" />
        </MotionBlurReveal>
        <FlutedGlass className="absolute inset-y-0 end-0 w-1/4 rounded-e-frame" flute={16} />
      </div>
      <Reveal className="md:col-span-6 md:col-start-7">
        <div data-reveal-item>
          <Label className="mb-10">{section.label}</Label>
        </div>
        <blockquote data-reveal-item>
          <ScrollHighlight text={`“${section.quote}”`} className="text-[clamp(1.25rem,2.8vw,2.7rem)] font-medium leading-[1.18] tracking-[-0.02em]" />
        </blockquote>
        <p data-reveal-item className="mt-10 flex items-center gap-4">
          <span className="h-px w-10 bg-sky" aria-hidden />
          <span>
            <span className="block text-fg">{lead.name}</span>
            <span className="text-sm text-muted">{lead.role}</span>
          </span>
        </p>
      </Reveal>
    </section>
  );
}
