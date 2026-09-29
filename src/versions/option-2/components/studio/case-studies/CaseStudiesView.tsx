import { CaseStudyGrid } from "@/versions/option-2/components/studio/case-studies/CaseStudyGrid";
import { ContactCTA } from "@/versions/option-2/components/studio/ContactCTA";
import { PageHero } from "@/versions/option-2/components/studio/PageHero";
import { getServerContent } from "@/versions/option-2/i18n/server";

export async function CaseStudiesView() {
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
          <span className="text-label text-[#07121f]/50">
            ({String(portfolio.length).padStart(2, "0")}) {t.common.projects}
          </span>
        }
      />
      <CaseStudyGrid />
      <ContactCTA label={cta.label} title={cta.title} button={cta.button} href="/contact" />
    </>
  );
}
