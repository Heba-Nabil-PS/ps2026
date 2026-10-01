import { RevealText } from "@/versions/main/portfolio/ui/RevealText";
import { ParallaxMedia } from "@/versions/main/portfolio/blocks/ParallaxMedia";
import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/main/portfolio/ui/SectionLabel";
import type { MediaRef } from "@/data/portfolio";
import { cn } from "@/lib/utils";

type ProjectTwoColumnProps = { eyebrow?: string; title: string; body: string; image: MediaRef; reverse?: boolean };

export function ProjectTwoColumn({ eyebrow, title, body, image, reverse }: ProjectTwoColumnProps) {
  return (
    <section className="gutter grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-12 md:py-36">
      <ScrollReveal variant="clip" className={cn("md:col-span-6", reverse ? "md:order-2 md:col-start-7" : "md:order-1")}>
        <ParallaxMedia image={image} sizes="(min-width: 768px) 50vw, 100vw" speed={10} className="aspect-[4/5]" />
      </ScrollReveal>
      <div className={cn("md:col-span-5", reverse ? "md:order-1 md:col-start-1" : "md:order-2 md:col-start-8")}>
        {eyebrow ? <SectionLabel className="mb-6">{eyebrow}</SectionLabel> : null}
        <RevealText as="h2" mode="words" className="text-headline font-medium">
          {title}
        </RevealText>
        <ScrollReveal variant="up" delay={0.15} className="mt-8">
          <p className="leading-relaxed text-muted md:text-lg">{body}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
