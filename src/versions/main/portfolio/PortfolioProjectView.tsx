import type { PortfolioProject } from "@/data/portfolio";
import { getCopy } from "@/versions/main/copy";
import { CaseCompanion } from "@/versions/main/portfolio/companion/CaseCompanion";
import { NextProject } from "@/versions/main/portfolio/NextProject";
import { ProjectContent } from "@/versions/main/portfolio/ProjectContent";
import { ProjectDetails } from "@/versions/main/portfolio/ProjectDetails";
import { ProjectHero } from "@/versions/main/portfolio/ProjectHero";
import { getServerContent } from "@/versions/main/portfolio/server";
import { CaseApproach, CaseChallenge, CaseLinks, CaseResults, CaseReview, socialLinksOf } from "@/versions/main/work/CaseStory";
import { ViewTransition } from "react";

type PortfolioProjectViewProps = { project: PortfolioProject; next: PortfolioProject; previous: PortfolioProject };

/** The full case study: visual and title, facts, the story (challenge → approach → work → results), then the next project. */
export async function PortfolioProjectView({ project, next, previous }: PortfolioProjectViewProps) {
  const { locale } = await getServerContent();
  const { copy, categoriesOf } = getCopy(locale);
  const labels = copy.work.case;
  const matched = copy.services.list.filter((service) => categoriesOf(project).includes(service.slug));
  const disciplines = matched.length ? matched.map(({ slug, title }) => ({ slug, title })) : project.services.map((title) => ({ title }));

  return (
    <ViewTransition
      default="none"
      enter={{ "pf-open": "pf-page-enter", default: "none" }}
      exit={{ "pf-open": "pf-list-exit", "pf-back": "pf-list-exit", default: "none" }}
    >
      <article>
        <ProjectHero project={project} />
        <ProjectDetails project={project} />
        {project.challenge ? <CaseChallenge label={labels.challenge} text={project.challenge} /> : null}
        {project.approach?.length ? (
          <CaseApproach label={labels.approach} steps={project.approach} disciplines={disciplines} disciplinesLabel={labels.services} />
        ) : null}
        <ProjectContent project={project} />
        {project.results ? <CaseResults label={labels.results} results={project.results} /> : null}
        {project.review ? <CaseReview label={labels.review} review={project.review} /> : null}
        {/* The site and app stores sit in the facts row; only social accounts close the case. */}
        {socialLinksOf(project.links).length ? <CaseLinks label={labels.links} links={socialLinksOf(project.links)} names={labels.linkNames} /> : null}
        <NextProject next={next} previous={previous} />
        {/* The project's 3D object, travelling with the scroll (see companion/registry). */}
        <CaseCompanion key={project.slug} slug={project.slug} />
      </article>
    </ViewTransition>
  );
}
