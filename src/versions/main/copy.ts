/**
 * Maps a locale to everything a page needs: interface copy, company facts,
 * case studies and roles. Server Components call `getCopy(locale)` (or
 * `getServerCopy()`); Client Components call `useCopy()`, which reads the
 * locale's own provider (copy-provider.en / copy-provider.ar) instead of this
 * module, so no page downloads the other language's content. The shaping
 * itself is in copy-build.ts; `fill`, `formatDate` and `findCase` live in
 * copy-helpers.ts, which is safe to import anywhere.
 */

import { ar } from "@/versions/main/content/ar";
import { en } from "@/versions/main/content/en";
import { roles } from "@/data/careers";
import { rolesAr } from "@/data/careers.ar";
import { portfolio } from "@/data/portfolio";
import { portfolioAr } from "@/data/portfolio.ar";
import { industries } from "@/data/industries";
import { industriesAr } from "@/data/industries.ar";
import { insights } from "@/data/insights";
import { insightsAr } from "@/data/insights.ar";
import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import { siteConfigAr } from "@/lib/site.ar";
import { buildCopy, type Copy, type CopySource, type SiteCopy } from "./copy-build";

export type { Copy, SiteCopy };
export { fill, findCase, formatDate } from "./copy-helpers";

function sourceFor(locale: Locale): CopySource {
  return locale === "ar"
    ? { copy: ar, site: siteConfigAr, work: portfolioAr, roles: rolesAr, industries: industriesAr, insights: insightsAr }
    : { copy: en, site: siteConfig, work: portfolio, roles, industries, insights };
}

const cache = new Map<Locale, Copy>();

export function getCopy(locale: Locale): Copy {
  let value = cache.get(locale);
  if (!value) {
    value = buildCopy(locale, sourceFor(locale));
    cache.set(locale, value);
  }
  return value;
}
