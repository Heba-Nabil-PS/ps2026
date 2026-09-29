"use client";

import { defaultLocale, localizeHref, type Locale } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { createContext, useCallback, useContext, type ReactNode } from "react";

const LocaleContext = createContext<Locale>(defaultLocale);

/** Shares the route's locale with client components (the root layout sets it from `[lang]`). */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Localized content and interface copy for the current locale. */
export function useContent() {
  return getContent(useLocale());
}

/** Prefixes internal paths with the current locale. */
export function useLocalizeHref() {
  const locale = useLocale();
  return useCallback((href: string) => localizeHref(href, locale), [locale]);
}

/** 1 in left-to-right layouts, -1 in right-to-left — for horizontal motion. */
export function useDirectionSign() {
  return useLocale() === "ar" ? -1 : 1;
}
