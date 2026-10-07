import { formatDate } from "@/versions/main/copy-helpers";
import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { InsightCard } from "@/versions/main/sections/InsightCard";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/** Home — the three latest insights, then the way into all of them. */
export async function InsightsPreview() {
  const { copy, insights, locale } = await getServerCopy();
  const section = copy.home.insights;

  return (
    <section className="gutter section-y">
      <SectionHead
        label={section.label}
        title={section.title}
        intro={section.intro}
        action={
          <ButtonLink href="/insights" variant="glass" transitionLabel={copy.meta.pages.insights.title}>
            {section.cta}
          </ButtonLink>
        }
      />
      <Reveal as="ul" className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
        {insights.slice(0, 3).map((insight) => (
          <li key={insight.slug} data-reveal-item>
            <InsightCard insight={insight} date={formatDate(locale, insight.date)} viewLabel={copy.ui.readMore} />
          </li>
        ))}
      </Reveal>
    </section>
  );
}
