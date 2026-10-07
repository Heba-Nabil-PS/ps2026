"use client";

import type { Locale } from "@/i18n/config";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/*
 * Each locale's content is its own chunk, fetched only on that locale's pages. Imported
 * statically (even from a Server Component that renders only one of them) Turbopack ships
 * both languages to every page; a dynamic import gives each its own chunk group. The chunk
 * is preloaded with the page, so hydration waits on nothing extra.
 */
const EnglishCopy = dynamic(() => import("./copy-provider.en").then((m) => m.EnglishCopy));
const ArabicCopy = dynamic(() => import("./copy-provider.ar").then((m) => m.ArabicCopy));

export function LocaleCopy({ locale, children }: { locale: Locale; children: ReactNode }) {
  const Provider = locale === "ar" ? ArabicCopy : EnglishCopy;
  return <Provider>{children}</Provider>;
}
