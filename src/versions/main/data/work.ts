/**
 * Work = the portfolio case studies (src/data/portfolio.ts), organised by the
 * six disciplines in the website direction deck.
 *
 * Case studies tag their services with the studio's operational discipline
 * names (siteConfig.services, translated per locale). `legacyServices` maps
 * each deck discipline to those names by position, so the mapping works in
 * every language without string matching.
 */

import type { PortfolioProject } from "@/data/portfolio";

export const workHref = (slug: string) => `/portfolio/${slug}`;

/** Deck discipline slug → indexes into siteConfig.services. */
const legacyServices: Record<string, number[]> = {
  "social-media": [4],
  branding: [0],
  "website-app-design": [1],
  "creative-production": [2],
  "digital-consultation": [],
  "performance-marketing": [3, 5],
};

/** Flagship cases shown on the home page, in order. Each needs a 16:10 `card-v2.webp` in its image folder. */
export const featuredSlugs = ["texas-chicken", "shark-tank-egypt", "elsewhere-developments", "physiowell"] as const;

export type WorkCategory = { slug: string; title: string; count: number };

/** Discipline slugs a project belongs to. */
export function categoriesOf(project: PortfolioProject, serviceTitles: readonly string[]) {
  return Object.entries(legacyServices)
    .filter(([, indexes]) => indexes.some((index) => project.services.includes(serviceTitles[index])))
    .map(([slug]) => slug);
}

/** The deck discipline an operational service name (siteConfig.services title) belongs to, if any. */
export function disciplineOf(serviceTitle: string, serviceTitles: readonly string[]) {
  const index = serviceTitles.indexOf(serviceTitle);
  if (index === -1) return undefined;
  return Object.entries(legacyServices).find(([, indexes]) => indexes.includes(index))?.[0];
}

/** Filter options: only disciplines that have at least one case, in deck order. */
export function buildCategories(
  disciplines: readonly { slug: string; title: string }[],
  projects: readonly PortfolioProject[],
  serviceTitles: readonly string[],
): WorkCategory[] {
  return disciplines
    .map(({ slug, title }) => ({ slug, title, count: projects.filter((project) => categoriesOf(project, serviceTitles).includes(slug)).length }))
    .filter((category) => category.count > 0);
}
