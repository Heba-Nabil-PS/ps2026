import type { PortfolioProject } from "@/data/portfolio";
import { workHref } from "@/versions/main/data/work";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Label } from "@/versions/main/ui/Label";
import Image from "next/image";

/** Keeps browsing going (objective 01): the next case as one large, lit-on-hover link. */
export function NextCase({ project, label, viewLabel }: { project: PortfolioProject; label: string; viewLabel: string }) {
  return (
    <section className="gutter pt-[clamp(5rem,11vw,10rem)]">
      <AppLink href={workHref(project.slug)} transitionLabel={project.title} data-cursor={viewLabel} className="theme-dark group relative block overflow-hidden rounded-frame border border-line">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image src={project.heroImage} alt="" fill sizes="100vw" quality={75} className="mono object-cover opacity-60 transition-[filter,opacity,transform] duration-[1.4s] ease-expo group-hover:scale-[1.03] group-hover:opacity-90 group-hover:[filter:none]" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_7_13/0.1),rgb(3_7_13/0.75))]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-[clamp(1.25rem,4vw,3.5rem)]">
          <Label className="mb-5 text-paper">{label}</Label>
          <StretchHeading as="p" lines={[project.title]} className="text-display" />
          <p className="mt-4 max-w-lg text-muted">{project.description}</p>
        </div>
      </AppLink>
    </section>
  );
}
