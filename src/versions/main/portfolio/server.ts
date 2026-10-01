import { portfolio } from "@/data/portfolio";
import { portfolioAr } from "@/data/portfolio.ar";
import { getLocale } from "@/i18n/server";
import { dictionaries } from "@/versions/option-2/i18n/dictionary";

/** Portfolio projects and interface copy for the current route (Server Components). */
export async function getServerContent() {
  const locale = await getLocale();
  return { locale, portfolio: locale === "ar" ? portfolioAr : portfolio, t: dictionaries[locale] };
}
