import { ScrollHighlightText } from "@/versions/main/portfolio/ui/ScrollHighlightText";
import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";

type ProjectQuoteProps = { quote: string; author: string; role: string };

export function ProjectQuote({ quote, author, role }: ProjectQuoteProps) {
  return (
    <figure className="gutter mx-auto max-w-6xl py-16 md:py-28">
      <span aria-hidden className="block font-serif text-[clamp(4rem,12vw,10rem)] leading-[0.5] text-accent">
        “
      </span>
      <blockquote>
        <ScrollHighlightText className="text-headline font-serif italic leading-[1.05]">{quote}</ScrollHighlightText>
      </blockquote>
      <ScrollReveal as="figcaption" variant="left" className="mt-8 flex items-center gap-4 md:mt-12">
        <span aria-hidden className="h-px w-12 bg-accent" />
        <span>
          <span className="block font-medium">{author}</span>
          <span className="text-label mt-1 block text-muted">{role}</span>
        </span>
      </ScrollReveal>
    </figure>
  );
}
