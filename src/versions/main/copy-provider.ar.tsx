"use client";

import { rolesAr } from "@/data/careers.ar";
import { industriesAr } from "@/data/industries.ar";
import { insightsAr } from "@/data/insights.ar";
import { portfolioAr } from "@/data/portfolio.ar";
import { siteConfigAr } from "@/lib/site.ar";
import { ar } from "@/versions/main/content/ar";
import type { ReactNode } from "react";
import { buildCopy } from "./copy-build";
import { CopyProvider } from "./copy-context";

/** Arabic content for Client Components. Only Arabic pages render this, so only they download it (see copy-context). */
const copy = buildCopy("ar", { copy: ar, site: siteConfigAr, work: portfolioAr, roles: rolesAr, industries: industriesAr, insights: insightsAr });

export function ArabicCopy({ children }: { children: ReactNode }) {
  return <CopyProvider value={copy}>{children}</CopyProvider>;
}
