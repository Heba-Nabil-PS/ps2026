import type { PortfolioProject } from "@/data/portfolio";
import { NextProject } from "@/versions/option-2/components/portfolio/NextProject";
import { ProjectContent } from "@/versions/option-2/components/portfolio/ProjectContent";
import { ProjectDetails } from "@/versions/option-2/components/portfolio/ProjectDetails";
import { ProjectHero } from "@/versions/option-2/components/portfolio/ProjectHero";
import { ViewTransition } from "react";

type PortfolioProjectViewProps = { project: PortfolioProject; next: PortfolioProject; previous: PortfolioProject };

export function PortfolioProjectView({ project, next, previous }: PortfolioProjectViewProps) {
  return (
    <ViewTransition
      default="none"
      enter={{ "pf-open": "pf-page-enter", default: "none" }}
      exit={{ "pf-open": "pf-list-exit", "pf-back": "pf-list-exit", default: "none" }}
    >
      <article>
        <ProjectHero project={project} />
        <ProjectDetails project={project} />
        <ProjectContent project={project} />
        <NextProject next={next} previous={previous} />
      </article>
    </ViewTransition>
  );
}
