import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/main/portfolio/ui/SectionLabel";
import type { PortfolioProject } from "@/data/portfolio";
import { getServerContent } from "@/versions/main/portfolio/server";
import { getCopy } from "@/versions/main/copy";
import { LiveLinks, liveLinksOf } from "@/versions/main/work/CaseStory";

/** Client / services / market / deliverables (and the live site or app, when there is one), followed by the editorial introduction. */
export async function ProjectDetails({ project }: { project: PortfolioProject }) {
  const { t, locale } = await getServerContent();
  const labels = getCopy(locale).copy.work.case;
  const live = liveLinksOf(project.links);
  const facts = [
    { label: t.common.client, value: [project.client] },
    { label: t.common.services, value: project.services },
    { label: t.common.market, value: project.market ? [project.market] : [t.common.defaultMarket] },
    { label: t.common.delivered, value: project.deliverables },
  ];

  return (
    <section aria-labelledby="introduction" className="gutter py-24 md:py-28">
      <ScrollReveal
        as="dl"
        targets="[data-fact]"
        variant="up"
        stagger={0.07}
        className={`grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-8 ${live.length ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4"}`}
      >
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
        {live.length ? (
          <div data-fact className="flex flex-col">
            <dt className="text-label mb-3 text-muted">{labels.links}</dt>
            <dd>
              <LiveLinks links={live} names={labels.linkNames} />
            </dd>
          </div>
        ) : null}
      </ScrollReveal>

      <div className="mt-24 grid grid-cols-1 gap-8 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel>{t.common.introduction}</SectionLabel>
        </div>
        <div className="md:col-span-9">
          <h2 id="introduction" className="sr-only">
            {t.common.introduction}
          </h2>
          {/* Read word by word as it scrolls, like the home page's positioning statement. */}
          <ScrollHighlight
            text={project.intro}
            className="max-w-4xl text-[clamp(1.25rem,2.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]"
          />
        </div>
      </div>
    </section>
  );
}
