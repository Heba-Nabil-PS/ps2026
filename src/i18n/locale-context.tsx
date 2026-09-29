"use client";

import { defaultLocale, type Locale } from "@/i18n/config";
import { versionHref } from "@/versions/registry";
import { useVersion } from "@/versions/VersionProvider";
import { createContext, useCallback, useContext, type ReactNode } from "react";

/*
 * Shared by every design version: the route's locale, direction and link
 * building. Version-specific copy hooks live with each version
 * (useCopy in versions/main, useContent in versions/option-2).
 */

const LocaleContext = createContext<Locale>(defaultLocale);

/** Shares the route's locale with Client Components (set by each root layout from `[lang]`). */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Internal paths get the locale prefix and stay inside the current design version. */
export function useLocalizeHref() {
  const locale = useLocale();
  const version = useVersion();
  return useCallback((href: string) => versionHref(href, version, locale), [locale, version]);
}

/** 1 in left-to-right layouts, −1 in right-to-left — multiply horizontal motion by it. */
export function useDirectionSign() {
  return useLocale() === "ar" ? -1 : 1;
}
