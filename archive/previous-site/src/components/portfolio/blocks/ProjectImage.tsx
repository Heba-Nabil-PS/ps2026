import { ParallaxMedia } from "@/components/portfolio/blocks/ParallaxMedia";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import type { MediaRef } from "@/data/portfolio";
import { cn } from "@/lib/utils";

type ProjectImageProps = {
  image: MediaRef;
  caption?: string;
  aspect?: "landscape" | "portrait" | "square";
  align?: "left" | "center" | "right";
};

const aspects = { landscape: "aspect-[16/10]", portrait: "aspect-[4/5]", square: "aspect-square" };
const widths = {
  left: "md:w-7/12",
  center: "md:mx-auto md:w-8/12",
  right: "md:ms-auto md:w-7/12",
};

export function ProjectImage({ image, caption, aspect = "landscape", align = "center" }: ProjectImageProps) {
  const narrow = aspect !== "landscape";
  return (
    <section className="gutter py-16 md:py-28">
      <figure className={cn(widths[align], narrow && align !== "center" && "md:w-5/12", narrow && align === "center" && "md:w-6/12")}>
        <ScrollReveal variant="clip">
          <ParallaxMedia image={image} sizes="(min-width: 768px) 60vw, 100vw" className={aspects[aspect]} />
        </ScrollReveal>
        {caption ? (
          <figcaption className="text-label mt-4 flex items-center gap-3 text-muted">
            <span aria-hidden className="h-px w-8 bg-line" />
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}
