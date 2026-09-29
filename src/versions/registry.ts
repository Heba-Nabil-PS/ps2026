/**
 * Design versions of the site.
 *
 * Every version shares content, data, locales and assets, and owns its own
 * root layout, stylesheet, fonts, components and motion system:
 *
 *   src/versions/<id>/            components, copy, styles.css for that design
 *   src/app/[lang]/(<id>)/        its routes, under its own root layout
 *
 * Moving between versions is a full page load (Next.js does this across root
 * layouts), so one design's CSS and providers never leak into another.
 *
 * To add a design: add an entry here, create src/versions/<id>/ and
 * src/app/[lang]/(<id>)/<base>/ with a root layout (see (option-2) for the pattern).
 */

import { localizeHref, stripLocale, type Locale } from "@/i18n/config";

export type VersionId = "main" | "option-2";

export type Version = {
  id: VersionId;
  /** URL prefix below the locale: "" for the main site, "/option-2" for the alternative. */
  base: string;
  /** Name shown in version switchers. */
  label: Record<Locale, string>;
  /** Short line under the name in switchers. */
  description: Record<Locale, string>;
  /** Call to action in switchers that lead to this version. */
  switchLabel: Record<Locale, string>;
  /** Alternative designs are for review and stay out of search results. */
  indexed: boolean;
};

export const versions: readonly Version[] = [
  {
    id: "main",
    base: "",
    label: { en: "Home", ar: "الرئيسية" },
    description: { en: "Current design", ar: "التصميم الحالي" },
    switchLabel: { en: "View the current design", ar: "عرض التصميم الحالي" },
    indexed: true,
  },
  {
    id: "option-2",
    base: "/option-2",
    label: { en: "Home Option 2", ar: "الرئيسية — الخيار الثاني" },
    description: { en: "Previous design", ar: "التصميم السابق" },
    switchLabel: { en: "View Home Option 2", ar: "عرض الخيار الثاني" },
    indexed: false,
  },
];

export const defaultVersion: VersionId = "main";

export const getVersion = (id: VersionId): Version => versions.find((version) => version.id === id) ?? versions[0];

/** Splits a locale-free path ("/option-2/about") into its version and the path inside it ("/about"). */
export function splitVersion(pathname: string): { version: VersionId; pathname: string } {
  for (const version of versions) {
    if (!version.base) continue;
    if (pathname === version.base || pathname.startsWith(`${version.base}/`) || pathname.startsWith(`${version.base}?`) || pathname.startsWith(`${version.base}#`)) {
      const rest = pathname.slice(version.base.length);
      return { version: version.id, pathname: rest === "" || rest.startsWith("?") || rest.startsWith("#") ? `/${rest}` : rest };
    }
  }
  return { version: defaultVersion, pathname };
}

/** A full URL path ("/ar/option-2/about") to its locale, version and in-version path. */
export function parseRoute(path: string) {
  const { locale, pathname: withVersion } = stripLocale(path);
  const { version, pathname } = splitVersion(withVersion);
  return { locale, version, pathname };
}

/**
 * Builds an internal link: "/about" in option-2 for Arabic → "/ar/option-2/about".
 * Accepts paths that already carry a locale or version prefix; external links,
 * mailto: and bare anchors pass through untouched.
 */
export function versionHref(href: string, version: VersionId, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { pathname } = parseRoute(href);
  const { base } = getVersion(version);
  let path = pathname;
  if (base) path = pathname === "/" ? base : pathname.startsWith("/?") || pathname.startsWith("/#") ? `${base}${pathname.slice(1)}` : `${base}${pathname}`;
  return localizeHref(path, locale);
}
