import { defaultLocale, hasLocale, localeTags, localizeHref, locales, type Locale } from "@/i18n/config";
import { getVersion, type VersionId } from "@/versions/registry";
import { lang } from "next/root-params";

/** The locale of the current route, readable from any Server Component. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return hasLocale(value) ? value : defaultLocale;
}

/**
 * Canonical + hreflang alternates for an in-version path such as "/services".
 * Pass the version for pages outside the main site ("/services" in option-2 → "/option-2/services").
 */
export function alternatesFor(path: string, locale: Locale, version: VersionId = "main") {
  const { base } = getVersion(version);
  const full = base ? (path === "/" ? base : `${base}${path}`) : path;
  return {
    canonical: localizeHref(full, locale),
    languages: {
      ...Object.fromEntries(locales.map((code) => [localeTags[code], localizeHref(full, code)])),
      "x-default": localizeHref(full, defaultLocale),
    },
  };
}
