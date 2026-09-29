"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { localeTags, localizeHref, stripLocale, type Locale } from "@/i18n/config";
import { useContent, useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

/**
 * Links the current page to its translation. A full page load (plain <a>)
 * because the document language and direction change with it.
 */
export function LanguageSwitch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const locale = useLocale();
  const { t } = useContent();
  const { play } = useSound();
  // Server and client may disagree on the "/en" prefix (proxy rewrite); stripping it keeps both in sync.
  const { pathname } = stripLocale(usePathname() ?? "/");
  const other: Locale = locale === "ar" ? "en" : "ar";

  return (
    <a
      href={localizeHref(pathname, other)}
      hrefLang={localeTags[other]}
      lang={localeTags[other]}
      aria-label={t.common.switchToLabel}
      onPointerEnter={() => play("hover")}
      onClick={() => {
        play("click");
        onNavigate?.();
      }}
      className={cn("text-label py-2 transition-opacity hover:opacity-70", other === "ar" ? "font-[family-name:var(--font-arabic)] normal-case tracking-normal" : "", className)}
    >
      {t.common.switchTo}
    </a>
  );
}
