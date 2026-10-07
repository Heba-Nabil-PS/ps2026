"use client";

import { roles } from "@/data/careers";
import { industries } from "@/data/industries";
import { insights } from "@/data/insights";
import { portfolio } from "@/data/portfolio";
import { siteConfig } from "@/lib/site";
import { en } from "@/versions/main/content/en";
import type { ReactNode } from "react";
import { buildCopy } from "./copy-build";
import { CopyProvider } from "./copy-context";

/** English content for Client Components. Only English pages render this, so only they download it (see copy-context). */
const copy = buildCopy("en", { copy: en, site: siteConfig, work: portfolio, roles, industries, insights });

export function EnglishCopy({ children }: { children: ReactNode }) {
  return <CopyProvider value={copy}>{children}</CopyProvider>;
}
