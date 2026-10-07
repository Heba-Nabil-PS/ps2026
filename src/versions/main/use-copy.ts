"use client";

import { useCopyContext } from "./copy-context";

/** Copy, company facts, work and roles for the current locale (main design, Client Components). */
export function useCopy() {
  return useCopyContext();
}
