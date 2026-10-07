/**
 * Shapes one locale's content (interface copy, company facts, case studies, roles,
 * industries, insights) into the `Copy` object every page reads. Pure, with no content of
 * its own: the server (copy.ts) and the per-locale client providers (copy-provider.*.tsx)
 * each hand it the one locale's modules, so a page only ever ships the language it shows.
 */

import type { Role } from "@/data/careers";
import type { Industry } from "@/data/industries";
import type { Insight } from "@/data/insights";
import type { PortfolioProject } from "@/data/portfolio";
import type { Locale, Localized } from "@/i18n/config";
import type { siteConfig } from "@/lib/site";
import type { siteConfigAr } from "@/lib/site.ar";
import type { en } from "@/versions/main/content/en";
import { buildCategories, categoriesOf, disciplineOf, featuredSlugs } from "@/versions/main/data/work";

export type SiteCopy = Localized<typeof en>;
export type SiteFacts = typeof siteConfig | typeof siteConfigAr;

/** One locale's content modules. */
export type CopySource = {
  copy: SiteCopy;
  site: SiteFacts;
  work: PortfolioProject[];
  roles: Role[];
  industries: Industry[];
  insights: Insight[];
};

export function buildCopy(locale: Locale, source: CopySource) {
  const { copy, site, work, roles, industries, insights } = source;
  const serviceTitles = site.services.map((service) => service.title);

  return {
    locale,
    copy,
    site,
    work,
    featured: featuredSlugs.map((slug) => work.find((project) => project.slug === slug)).filter((project): project is PortfolioProject => Boolean(project)),
    categories: buildCategories(copy.services.list, work, serviceTitles),
    categoriesOf: (project: PortfolioProject) => categoriesOf(project, serviceTitles),
    /** The discipline page a case study's service line (e.g. "Production") links to, if it has one. */
    disciplineOf: (serviceTitle: string) => disciplineOf(serviceTitle, serviceTitles),
    roles,
    departments: Array.from(new Set(roles.map((role) => role.department))),
    industries,
    /** The industry a case study belongs to (each case sits in exactly one). */
    industryOf: (project: PortfolioProject) => industries.find((industry) => industry.work.includes(project.slug)),
    insights,
    topics: Array.from(new Set(insights.map((article) => article.topic))),
  };
}

export type Copy = ReturnType<typeof buildCopy>;
