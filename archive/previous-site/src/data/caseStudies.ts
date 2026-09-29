/**
 * The /case-studies experience: the studio-styled index and inner pages.
 *
 * Content is the same fourteen projects as /portfolio (`src/data/portfolio.ts`),
 * presented on the light studio canvas. Filters are derived from the services
 * each project lists, so adding a project updates the index automatically.
 */

import { portfolio, type PortfolioProject } from "@/data/portfolio";
import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export const caseStudyHref = (slug: string) => `/case-studies/${slug}`;

export const caseStudies = portfolio;

export function getCaseStudy(slug: string) {
  return portfolio.find((project) => project.slug === slug);
}

/** Wraps around so the last case study links back to the first. */
export function getAdjacentCaseStudies(slug: string) {
  const index = portfolio.findIndex((project) => project.slug === slug);
  const total = portfolio.length;
  return {
    previous: portfolio[(index - 1 + total) % total],
    next: portfolio[(index + 1) % total],
  };
}

/** Disciplines that appear on at least one project, in the order services are listed. */
export function buildCaseStudyFilters(serviceList: readonly { title: string }[], projects: PortfolioProject[]): string[] {
  return serviceList.map((service) => service.title).filter((title) => projects.some((project) => project.services.includes(title)));
}

export const caseStudyFilters = buildCaseStudyFilters(siteConfig.services, portfolio);

export const matchesFilter = (project: PortfolioProject, filter: string | null) =>
  filter === null || project.services.includes(filter);

/** Card proportion in the staggered index grid. */
export const caseStudyShape = (index: number): "landscape" | "portrait" => (index % 3 === 0 ? "landscape" : "portrait");

export const caseStudiesPage = {
  hero: {
    label: "Case studies",
    title: ["Work that", "moves", "markets"],
    intro:
      "Fourteen partnerships across QSR, healthcare, real estate, media and retail — each one strategy, craft and performance shipped by one team.",
    meta: `${portfolio.length} case studies · MENA & beyond`,
  },
  index: {
    all: "All work",
  },
  cta: {
    label: "Want to be the next one?",
    title: ["Let's write", "your", "case study"],
    button: "Start a project",
  },
} as const;

export type CaseStudiesPage = Localized<typeof caseStudiesPage>;
