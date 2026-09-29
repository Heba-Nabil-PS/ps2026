"use client";

import { localizeHref, stripLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/**
 * Same page, other language. A full navigation on purpose: the two locales
 * have different root layouts (lang, dir and fonts).
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const { copy } = useCopy();
  const { pathname } = stripLocale(usePathname() ?? "/");
  const other = locale === "ar" ? "en" : "ar";

  return (
    <a
      href={localizeHref(pathname, other)}
      hrefLang={other}
      lang={other}
      className={cn("text-sm text-muted transition-colors duration-500 hover:text-fg", className)}
      aria-label={`${copy.ui.language}: ${copy.ui.switchTo}`}
    >
      {copy.ui.switchTo}
    </a>
  );
}
