"use client";

import { useLocale } from "@/i18n/locale-context";
import { getCopy } from "./copy";

/** Copy, company facts, work and roles for the current locale (main design). */
export function useCopy() {
  return getCopy(useLocale());
}
