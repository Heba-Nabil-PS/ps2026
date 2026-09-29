import { caseStudyHref } from "@/data/caseStudies";
import { portfolio, portfolioHref } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { localeTags, localizeHref, locales } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

type Entry = { path: string; changeFrequency: "monthly" | "yearly"; priority: number };

/** One entry per page and locale, each listing its translations for hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    ...["/", "/services", "/case-studies", "/team", "/careers", "/contact", "/projects", "/about"].map((path) => ({
      path,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...projects.map((project) => ({ path: `/projects/${project.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    { path: "/portfolio", changeFrequency: "monthly", priority: 0.9 },
    ...portfolio.map((project) => ({ path: portfolioHref(project.slug), changeFrequency: "yearly" as const, priority: 0.7 })),
    ...portfolio.map((project) => ({ path: caseStudyHref(project.slug), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];

  const url = (path: string, locale: (typeof locales)[number]) => {
    const localized = localizeHref(path, locale);
    return `${siteConfig.url}${localized === "/" ? "" : localized}`;
  };

  return entries.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: url(path, locale),
      changeFrequency,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((code) => [localeTags[code], url(path, code)])) },
    })),
  );
}
