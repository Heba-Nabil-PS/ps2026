import { alternatesFor, getLocale } from "@/i18n/server";
import { CaseStudiesView } from "@/versions/option-2/components/studio/case-studies/CaseStudiesView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.caseStudies;
  const alternates = alternatesFor("/case-studies", locale, "option-2");
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default function CaseStudiesPage() {
  return <CaseStudiesView />;
}
