import { defaultLocale, hasLocale, localeTags, localizeHref, locales, type Locale } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { lang } from "next/root-params";

/** The locale of the current route, readable from any Server Component. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return hasLocale(value) ? value : defaultLocale;
}

/** Localized content for the current route. */
export async function getServerContent() {
  return getContent(await getLocale());
}

/** Canonical + hreflang alternates for an unprefixed path such as "/services". */
export function alternatesFor(path: string, locale: Locale) {
  return {
    canonical: localizeHref(path, locale),
    languages: {
      ...Object.fromEntries(locales.map((code) => [localeTags[code], localizeHref(path, code)])),
      "x-default": localizeHref(path, defaultLocale),
    },
  };
}
