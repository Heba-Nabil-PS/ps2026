/**
 * Maps a locale to everything a page needs: interface copy, company facts,
 * case studies and roles. Server Components call `getCopy(locale)` (or
 * `getServerCopy()`); Client Components call `useCopy()`.
 */

import { ar } from "@/versions/main/content/ar";
import { en } from "@/versions/main/content/en";
import { roles, type Role } from "@/data/careers";
import { rolesAr } from "@/data/careers.ar";
import { portfolio, type PortfolioProject } from "@/data/portfolio";
import { portfolioAr } from "@/data/portfolio.ar";
import { industries as industriesEn, type Industry } from "@/data/industries";
import { industriesAr } from "@/data/industries.ar";
import { insights as insightsEn, type Insight } from "@/data/insights";
import { insightsAr } from "@/data/insights.ar";
import { buildCategories, categoriesOf, featuredSlugs } from "@/versions/main/data/work";
import type { Locale, Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import { siteConfigAr } from "@/lib/site.ar";

export type SiteCopy = Localized<typeof en>;

function build(locale: Locale) {
  const isAr = locale === "ar";
  const copy: SiteCopy = isAr ? ar : en;
  const site = isAr ? siteConfigAr : siteConfig;
  const work: PortfolioProject[] = isAr ? portfolioAr : portfolio;
  const openRoles: Role[] = isAr ? rolesAr : roles;
  const sectors: Industry[] = isAr ? industriesAr : industriesEn;
  const articles: Insight[] = isAr ? insightsAr : insightsEn;
  const serviceTitles = site.services.map((service) => service.title);

  return {
    locale,
    copy,
    site,
    work,
    featured: featuredSlugs.map((slug) => work.find((project) => project.slug === slug)).filter((project): project is PortfolioProject => Boolean(project)),
    categories: buildCategories(copy.services.list, work, serviceTitles),
    categoriesOf: (project: PortfolioProject) => categoriesOf(project, serviceTitles),
    roles: openRoles,
    departments: Array.from(new Set(openRoles.map((role) => role.department))),
    industries: sectors,
    /** The industry a case study belongs to (each case sits in exactly one). */
    industryOf: (project: PortfolioProject) => sectors.find((industry) => industry.work.includes(project.slug)),
    insights: articles,
    topics: Array.from(new Set(articles.map((article) => article.topic))),
  };
}

export type Copy = ReturnType<typeof build>;

const cache = new Map<Locale, Copy>();

export function getCopy(locale: Locale): Copy {
  let value = cache.get(locale);
  if (!value) {
    value = build(locale);
    cache.set(locale, value);
  }
  return value;
}

/** A case study and its wrap-around neighbours. */
export function findCase(list: PortfolioProject[], slug: string) {
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const total = list.length;
  return { project: list[index], next: list[(index + 1) % total], index, total };
}

/** Fills "{name}" placeholders in a copy string. */
export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
