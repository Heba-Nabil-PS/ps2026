import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { ScrollReveal } from "@/versions/main/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/main/portfolio/ui/SectionLabel";
import type { PortfolioProject } from "@/data/portfolio";
import { getServerContent } from "@/versions/main/portfolio/server";
import { getCopy } from "@/versions/main/copy";
import { industryHref, serviceHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { LiveLinks, liveLinksOf } from "@/versions/main/work/CaseStory";

/** Phones: one ruled row per fact, its label in a narrow column beside the values. From md up: columns. */
const row = "grid grid-cols-[6.5rem_1fr] gap-x-5 border-b border-line py-5 md:flex md:flex-col md:border-0 md:py-0";
const term = "text-label pt-1 text-muted md:mb-3 md:pt-0";

/** Column counts the facts row can take: four facts, five, or six with the live links. */
const grids: Record<number, string> = { 4: "md:grid-cols-4", 5: "md:grid-cols-3 xl:grid-cols-5", 6: "md:grid-cols-3 xl:grid-cols-6" };

/**
 * Client / services / industry / market / deliverables (and the live site or app, when there is one), followed by the editorial introduction.
 * Each service line opens its discipline page where it has one, and the industry opens its sector page.
 */
export async function ProjectDetails({ project }: { project: PortfolioProject }) {
  const { t, locale } = await getServerContent();
  const { copy, industryOf, disciplineOf } = getCopy(locale);
  const labels = copy.work.case;
  const live = liveLinksOf(project.links);
  const industry = industryOf(project);
  const facts: { label: string; value: { text: string; href?: string }[] }[] = [
    { label: t.common.client, value: [{ text: project.client }] },
    {
      label: t.common.services,
      value: project.services.map((title) => {
        const slug = disciplineOf(title);
        return { text: title, href: slug ? serviceHref(slug) : undefined };
      }),
    },
    ...(industry ? [{ label: labels.industry, value: [{ text: industry.title, href: industryHref(industry.slug) }] }] : []),
    { label: t.common.market, value: [{ text: project.market ?? t.common.defaultMarket }] },
    { label: t.common.delivered, value: project.deliverables.map((text) => ({ text })) },
  ];
  const columns = Math.min(facts.length + (live.length ? 1 : 0), 6);

  return (
    <section aria-labelledby="introduction" className="gutter py-14 md:py-28">
      <ScrollReveal as="dl" targets="[data-fact]" variant="up" stagger={0.07} className={`grid border-t border-line md:gap-x-6 md:gap-y-10 md:pt-8 ${grids[columns] ?? grids[4]}`}>
        {facts.map((fact) => (
          <div key={fact.label} data-fact className={row}>
            <dt className={term}>{fact.label}</dt>
            <dd>
              <ul className="flex flex-col gap-1.5 md:gap-1">
                {fact.value.map((item) => (
                  <li key={item.text}>
                    {item.href ? (
                      <AppLink href={item.href} transitionLabel={item.text} className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-sky">
                        {item.text}
                      </AppLink>
                    ) : (
                      item.text
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
        {live.length ? (
          <div data-fact className={row}>
            <dt className={term}>{labels.links}</dt>
            <dd>
              <LiveLinks links={live} names={labels.linkNames} />
            </dd>
          </div>
        ) : null}
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:mt-24 md:gap-8 md:grid-cols-12">
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
