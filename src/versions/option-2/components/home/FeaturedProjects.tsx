import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { ProjectGrid } from "@/versions/option-2/components/projects/ProjectGrid";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import { getServerContent } from "@/versions/option-2/i18n/server";
import { ArrowUpRight } from "lucide-react";

export async function FeaturedProjects() {
  const { projects, site, t } = await getServerContent();
  return (
    <section aria-labelledby="featured-title" className="gutter py-28 md:py-28">
      <div className="mb-16 flex flex-col gap-10 md:mb-24 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel className="mb-6">
            {t.site.flagshipLabel}
          </SectionLabel>
          <RevealText id="featured-title" as="h2" className="text-display font-extrabold uppercase" lineClassName="md:nth-2:ps-[8vw]">
            {t.site.flagshipTitle}
          </RevealText>
        </div>
        <Magnetic className="self-start md:self-end">
          <TransitionLink
            href="/projects"
            transitionLabel={site.moreNav[0].label}
            className="text-label group flex items-center gap-3 border-b border-line pb-2 transition-colors hover:border-fg"
          >
            {t.common.allCaseStudies} ({String(projects.length).padStart(2, "0")})
            <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </TransitionLink>
        </Magnetic>
      </div>

      <ProjectGrid projects={projects.slice(0, 3)} layout="featured" />
    </section>
  );
}
