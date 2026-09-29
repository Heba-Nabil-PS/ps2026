"use client";

import { useLocale } from "@/i18n/locale-context";
import { getContent } from "./content";

/*
 * The option-2 design's locale hooks. Locale, direction and link building are
 * shared with every version; only the content accessor is specific to it.
 * Links built with useLocalizeHref stay inside /option-2 automatically.
 */
export { LocaleProvider, useDirectionSign, useLocale, useLocalizeHref } from "@/i18n/locale-context";

/** Localized content and interface copy for the current locale (option-2 design). */
export function useContent() {
  return getContent(useLocale());
}
