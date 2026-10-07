/**
 * Small copy utilities with no content of their own, safe to import from Client Components
 * (copy.ts carries every locale's content and is for the server; see copy-build.ts).
 */

import type { PortfolioProject } from "@/data/portfolio";
import type { Locale } from "@/i18n/config";

/** A case study and its wrap-around neighbours. */
export function findCase(list: PortfolioProject[], slug: string) {
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  const total = list.length;
  return { project: list[index], next: list[(index + 1) % total], index, total };
}

/** An ISO date as "24 Sep 2026" (or its Arabic form). UTC so server and client agree. */
export const formatDate = (locale: Locale, iso: string) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

/** Fills "{name}" placeholders in a copy string. */
export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
