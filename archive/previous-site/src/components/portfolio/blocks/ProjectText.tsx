import { RevealText } from "@/components/animations/RevealText";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

type ProjectTextProps = { eyebrow?: string; title: string; body: string };

export function ProjectText({ eyebrow, title, body }: ProjectTextProps) {
  return (
    <section className="gutter grid grid-cols-1 gap-8 py-24 md:grid-cols-12 md:py-40">
      <div className="md:col-span-3">{eyebrow ? <SectionLabel>{eyebrow}</SectionLabel> : null}</div>
      <div className="md:col-span-8">
        <RevealText as="h2" mode="words" className="text-headline font-medium">
          {title}
        </RevealText>
        <ScrollReveal variant="up" delay={0.2} className="mt-10 max-w-2xl">
          <p className="text-lead text-muted">{body}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
