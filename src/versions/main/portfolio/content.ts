"use client";

import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { dictionaries } from "@/versions/option-2/i18n/dictionary";

/*
 * Locale hooks for the portfolio section, which came over from the option-2
 * design. Its interface copy still lives in that design's dictionary; the
 * projects themselves are the current locale's work (src/data/portfolio, through
 * the copy provider, so the other language's cases are never downloaded).
 */
export { useDirectionSign, useLocale, useLocalizeHref } from "@/i18n/locale-context";

/** Portfolio projects and interface copy for the current locale. */
export function useContent() {
  const locale = useLocale();
  const { work } = useCopy();
  return { locale, portfolio: work, t: dictionaries[locale] };
}
