/**
 * One place that maps a locale to its content. Components ask for
 * `getContent(locale)` (or `useContent()` on the client) instead of importing
 * the English data files directly.
 */

import { applyHref, careersPage, roles, type Role } from "@/data/careers";
import { careersPageAr, rolesAr } from "@/data/careers.ar";
import { buildCaseStudyFilters, caseStudiesPage } from "@/versions/option-2/data/caseStudies";
import { caseStudiesPageAr } from "@/versions/option-2/data/caseStudies.ar";
import { buildEnquiryHref, contactPage, type Enquiry } from "@/versions/option-2/data/contact";
import { contactPageAr } from "@/versions/option-2/data/contact.ar";
import { portfolio, type PortfolioProject } from "@/data/portfolio";
import { portfolioAr } from "@/data/portfolio.ar";
import { projects, type Project } from "@/versions/option-2/data/projects";
import { projectsAr } from "@/versions/option-2/data/projects.ar";
import { services, servicesPage } from "@/versions/option-2/data/services";
import { servicesAr, servicesPageAr } from "@/versions/option-2/data/services.ar";
import { buildFeaturedProjects, studioHome } from "@/versions/option-2/data/studioHome";
import { studioHomeAr } from "@/versions/option-2/data/studioHome.ar";
import { teamPage } from "@/versions/option-2/data/team";
import { teamPageAr } from "@/versions/option-2/data/team.ar";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/versions/option-2/i18n/dictionary";
import { siteConfig } from "@/lib/site";
import { siteConfigAr } from "@/lib/site.ar";

function build(locale: Locale) {
  const ar = locale === "ar";
  const site = ar ? siteConfigAr : siteConfig;
  const portfolioList = ar ? portfolioAr : portfolio;
  const careers = ar ? careersPageAr : careersPage;
  const contact = ar ? contactPageAr : contactPage;

  return {
    locale,
    t: dictionaries[locale],
    site,
    studioHome: ar ? studioHomeAr : studioHome,
    featuredProjects: buildFeaturedProjects(portfolioList),
    portfolio: portfolioList,
    projects: ar ? projectsAr : projects,
    services: ar ? servicesAr : services,
    servicesPage: ar ? servicesPageAr : servicesPage,
    caseStudiesPage: ar ? caseStudiesPageAr : caseStudiesPage,
    caseStudyFilters: buildCaseStudyFilters(site.services, portfolioList),
    contactPage: contact,
    careersPage: careers,
    teamPage: ar ? teamPageAr : teamPage,
    roles: ar ? rolesAr : roles,
    applyHref: (role: Role) => applyHref(role, careers.application),
    enquiryHref: (enquiry: Enquiry) => buildEnquiryHref(enquiry, contact.email),
  };
}

export type Content = ReturnType<typeof build>;

const cache = new Map<Locale, Content>();

export function getContent(locale: Locale): Content {
  let content = cache.get(locale);
  if (!content) {
    content = build(locale);
    cache.set(locale, content);
  }
  return content;
}

/** Finds a project by slug and its wrap-around neighbours. */
export function findWithNeighbours<T extends PortfolioProject | Project>(list: T[], slug: string) {
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const total = list.length;
  return { item: list[index], previous: list[(index - 1 + total) % total], next: list[(index + 1) % total] };
}
