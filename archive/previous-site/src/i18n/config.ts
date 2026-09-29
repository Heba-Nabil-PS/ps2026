/**
 * Locales and URL helpers.
 *
 * English is served without a prefix ("/services"); every other locale lives
 * under its own prefix ("/ar/services"). `src/proxy.ts` rewrites unprefixed
 * requests to "/en/…" so the app can read the locale from the `[lang]` segment.
 */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string | undefined): value is Locale => (locales as readonly string[]).includes(value ?? "");

export const localeDirection = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** Native name shown in the language switcher. */
export const localeNames: Record<Locale, string> = { en: "English", ar: "العربية" };

/** Language tags for hreflang / Open Graph. */
export const localeTags: Record<Locale, string> = { en: "en", ar: "ar" };

const prefixPattern = new RegExp(`^/(${locales.join("|")})(?=/|$|\\?|#)`);

/** Splits "/ar/services" into { locale: "ar", pathname: "/services" }. Unprefixed paths are English. */
export function stripLocale(pathname: string): { locale: Locale; pathname: string } {
  const match = pathname.match(prefixPattern);
  if (!match) return { locale: defaultLocale, pathname: pathname || "/" };
  const rest = pathname.slice(match[0].length);
  return { locale: match[1] as Locale, pathname: rest === "" || rest.startsWith("?") || rest.startsWith("#") ? `/${rest}` : rest };
}

/** Prefixes an internal path with the locale. External links, anchors and mailto: pass through untouched. */
export function localizeHref(href: string, locale: Locale) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { pathname } = stripLocale(href);
  if (locale === defaultLocale) return pathname;
  return pathname === "/" ? `/${locale}` : pathname.startsWith("/?") || pathname.startsWith("/#") ? `/${locale}${pathname.slice(1)}` : `/${locale}${pathname}`;
}

/** Deeply widens string literals so a translation can satisfy the shape of an `as const` English object. */
export type Localized<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Localized<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Localized<T[K]> }
      : T;
