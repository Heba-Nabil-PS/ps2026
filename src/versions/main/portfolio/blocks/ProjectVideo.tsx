import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";
import { LazyVideo } from "@/versions/main/portfolio/ui/LazyVideo";
import { getServerContent } from "@/versions/main/portfolio/server";
import Image from "next/image";

type ProjectVideoProps = { src: string; poster: string; label: string; caption?: string };

/** Full-width muted film: downloads and plays only while on screen; an optimised image is the poster. */
export async function ProjectVideo({ src, poster, label, caption }: ProjectVideoProps) {
  const { t } = await getServerContent();
  return (
    <figure className="py-10 md:py-16">
      <ScrollReveal variant="clip" duration={1.6} className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-video">
        <Image src={poster} alt="" fill sizes="100vw" className="object-cover" />
        <LazyVideo src={src} label={label} />
        <span className="text-label absolute start-5 top-5 flex items-center gap-2 bg-bg/60 px-3 py-2 backdrop-blur-md md:start-8 md:top-8">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
          {t.blocks.film}
        </span>
      </ScrollReveal>
      {caption ? <figcaption className="gutter text-label mt-5 text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
