import { roles } from "@/data/careers";
import { industries } from "@/data/industries";
import { insights } from "@/data/insights";
import { portfolio, portfolioHref } from "@/data/portfolio";
import { en } from "@/versions/main/content/en";
import { industryHref, insightHref, roleHref, serviceHref } from "@/versions/main/data/routes";
import { workHref } from "@/versions/main/data/work";
import { localeTags, localizeHref, locales } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

type Entry = { path: string; changeFrequency: "monthly" | "yearly"; priority: number };

/** Every page of the sitemap in docs/website-direction.md §3, in both languages, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const monthly = (path: string, priority: number): Entry => ({ path, changeFrequency: "monthly", priority });
  const yearly = (path: string, priority: number): Entry => ({ path, changeFrequency: "yearly", priority });

  const entries: Entry[] = [
    monthly("/", 1),
    monthly("/work", 0.9),
    monthly("/portfolio", 0.8),
    monthly("/services", 0.9),
    monthly("/industries", 0.8),
    monthly("/start", 0.8),
    ...["/about", "/insights", "/careers", "/contact", "/team"].map((path) => monthly(path, 0.7)),
    ...en.services.list.map((service) => monthly(serviceHref(service.slug), 0.8)),
    ...industries.map((industry) => monthly(industryHref(industry.slug), 0.7)),
    ...portfolio.map((project) => yearly(workHref(project.slug), 0.7)),
    ...portfolio.map((project) => yearly(portfolioHref(project.slug), 0.6)),
    ...insights.map((insight) => yearly(insightHref(insight.slug), 0.6)),
    ...[...roles.map((role) => role.id), en.careers.role.open.id].map((id) => monthly(roleHref(id), 0.5)),
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
