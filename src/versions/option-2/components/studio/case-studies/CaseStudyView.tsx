import type { PortfolioProject } from "@/data/portfolio";
import { ProjectContent } from "@/versions/option-2/components/portfolio/ProjectContent";
import { CaseStudyFacts } from "@/versions/option-2/components/studio/case-studies/CaseStudyFacts";
import { CaseStudyHero } from "@/versions/option-2/components/studio/case-studies/CaseStudyHero";
import { CaseStudyNext } from "@/versions/option-2/components/studio/case-studies/CaseStudyNext";
import { InkStatement } from "@/versions/option-2/components/studio/InkStatement";
import { getServerContent } from "@/versions/option-2/i18n/server";

type CaseStudyViewProps = { project: PortfolioProject; next: PortfolioProject; previous: PortfolioProject };

export async function CaseStudyView({ project, next, previous }: CaseStudyViewProps) {
  const { t } = await getServerContent();

  return (
    <article>
      <CaseStudyHero project={project} />
      <CaseStudyFacts project={project} />
      <InkStatement label={t.common.introduction} id="case-intro">
        {project.intro}
      </InkStatement>
      {/* Portfolio content blocks are token-driven; remap them to ink on paper. */}
      <div className="studio-tokens">
        <ProjectContent project={project} />
      </div>
      <CaseStudyNext next={next} previous={previous} />
    </article>
  );
}
