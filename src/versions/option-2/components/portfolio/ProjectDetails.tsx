import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { ScrollReveal } from "@/versions/option-2/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import type { PortfolioProject } from "@/data/portfolio";
import { getServerContent } from "@/versions/option-2/i18n/server";

/** Client / services / market / deliverables, followed by the editorial introduction. */
export async function ProjectDetails({ project }: { project: PortfolioProject }) {
  const { t } = await getServerContent();
  const facts = [
    { label: t.common.client, value: [project.client] },
    { label: t.common.services, value: project.services },
    { label: t.common.market, value: project.market ? [project.market] : [t.common.defaultMarket] },
    { label: t.common.delivered, value: project.deliverables },
  ];

  return (
    <section aria-labelledby="introduction" className="gutter py-24 md:py-28">
      <ScrollReveal as="dl" targets="[data-fact]" variant="up" stagger={0.07} className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-8 md:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} data-fact className="flex flex-col">
            <dt className="text-label mb-3 text-muted">{fact.label}</dt>
            <dd>
              <ul className="flex flex-col gap-1">
                {fact.value.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </ScrollReveal>

      <div className="mt-24 grid grid-cols-1 gap-8 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel>{t.common.introduction}</SectionLabel>
        </div>
        <div className="md:col-span-9">
          <h2 id="introduction" className="sr-only">
            {t.common.introduction}
          </h2>
          <RevealText as="p" mode="words" stagger={0.012} className="text-headline font-medium">
            {project.intro}
          </RevealText>
        </div>
      </div>
    </section>
  );
}
