import { ScrollHighlightText } from "@/versions/option-2/components/animations/ScrollHighlightText";
import { ParallaxMedia } from "@/versions/option-2/components/portfolio/blocks/ParallaxMedia";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import type { MediaRef } from "@/data/portfolio";
import { cn } from "@/lib/utils";

type ProjectStatementProps = { eyebrow?: string; title: string; image?: MediaRef };

/** "hero" block — an oversized typographic beat, optionally over a dimmed image. */
export function ProjectStatement({ eyebrow, title, image }: ProjectStatementProps) {
  return (
    <section className={cn("relative overflow-hidden", image ? "flex min-h-[100svh] items-center py-24" : "py-28 md:py-28")}>
      {image ? (
        <>
          <ParallaxMedia image={image} sizes="100vw" speed={12} zoom className="absolute inset-0" />
          <div aria-hidden className="absolute inset-0 bg-bg/65" />
        </>
      ) : null}
      <div className="gutter relative">
        {eyebrow ? <SectionLabel className="mb-8">{eyebrow}</SectionLabel> : null}
        <ScrollHighlightText as="h2" className="text-display max-w-[14ch] font-extrabold uppercase">
          {title}
        </ScrollHighlightText>
      </div>
    </section>
  );
}
