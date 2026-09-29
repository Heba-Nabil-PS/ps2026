"use client";

import { useLocale } from "@/i18n/locale-context";
import { getVersion, versionHref } from "@/versions/registry";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * Persistent way back to the main site, in this design's own style. It keeps
 * the visitor on the equivalent page (/option-2/about → /about). A plain link
 * on purpose: versions have separate root layouts, so this is a full load.
 */
export function VersionSwitch() {
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const main = getVersion("main");
  const current = getVersion("option-2");

  return (
    <a
      href={versionHref(pathname, "main", locale)}
      aria-label={`${current.label[locale]}: ${main.switchLabel[locale]}`}
      className="text-label group fixed bottom-4 start-4 z-40 flex items-center gap-2 rounded-full border border-line bg-bg/85 py-2 pe-2.5 ps-3 text-[0.625rem] text-fg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.5)] backdrop-blur-md transition-colors duration-500 hover:border-accent md:bottom-5 md:start-5"
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
      {/* Compact at rest so it never covers page content; the version name slides in on hover. */}
      <span aria-hidden className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-500 ease-[var(--ease-expo)] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
        <span className="overflow-hidden whitespace-nowrap text-muted">{current.label[locale]}&nbsp;·&nbsp;</span>
      </span>
      <span aria-hidden className="whitespace-nowrap">{main.switchLabel[locale]}</span>
      <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
    </a>
  );
}
