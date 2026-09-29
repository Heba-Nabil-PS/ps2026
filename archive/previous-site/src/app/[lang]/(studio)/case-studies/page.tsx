import { CaseStudyGrid } from "@/components/studio/case-studies/CaseStudyGrid";
import { ContactCTA } from "@/components/studio/ContactCTA";
import { PageHero } from "@/components/studio/PageHero";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.caseStudies;
  const alternates = alternatesFor("/case-studies", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function CaseStudiesPage() {
  const { caseStudiesPage, portfolio, t } = await getServerContent();
  const { hero, cta } = caseStudiesPage;

  return (
    <>
      <PageHero
        label={hero.label}
        title={hero.title}
        intro={hero.intro}
        meta={hero.meta}
        aside={
          <span className="text-label text-black/50">
            ({String(portfolio.length).padStart(2, "0")}) {t.common.projects}
          </span>
        }
      />
      <CaseStudyGrid />
      <ContactCTA label={cta.label} title={cta.title} button={cta.button} href="/contact" />
    </>
  );
}
