"use client";

import { portfolio } from "@/data/portfolio";
import { portfolioAr } from "@/data/portfolio.ar";
import { useLocale } from "@/i18n/locale-context";
import { dictionaries } from "@/versions/option-2/i18n/dictionary";

/*
 * Locale hooks for the portfolio section, which came over from the option-2
 * design. Its interface copy still lives in that design's dictionary; the
 * projects themselves are shared data (src/data/portfolio).
 */
export { useDirectionSign, useLocale, useLocalizeHref } from "@/i18n/locale-context";

/** Portfolio projects and interface copy for the current locale. */
export function useContent() {
  const locale = useLocale();
  return { locale, portfolio: locale === "ar" ? portfolioAr : portfolio, t: dictionaries[locale] };
}
