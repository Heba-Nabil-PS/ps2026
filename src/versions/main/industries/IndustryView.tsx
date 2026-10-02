import type { Industry } from "@/data/industries";
import type { PortfolioProject } from "@/data/portfolio";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { getCopy } from "@/versions/main/copy";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { Reveal } from "@/versions/main/motion/Reveal";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/** Same rhythm as the work index: wide, narrow / narrow, wide. */
const wide = (index: number) => index % 4 === 0 || index % 4 === 3;

type IndustryViewProps = { lang: Locale; industry: Industry; index: number };

/**
 * An industry: the problems we hear in it, what we build and run,
 * the work that proves it, then one call to action.
 */
export function IndustryView({ lang, industry, index }: IndustryViewProps) {
  const { copy, work, industries: list } = getCopy(lang);
  const labels = copy.industries.labels;
  const services = copy.services.list;
  const cases = industry.work.map((caseSlug) => work.find((project) => project.slug === caseSlug)).filter((project): project is PortfolioProject => Boolean(project));

  return (
    <>
      <PageHero title={industry.headline} intro={industry.intro} image={industry.image}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackLink href="/industries" label={labels.back} transitionLabel={copy.meta.pages.industries.title} />
          <p className="text-label tabular-nums text-subtle">
            {String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </p>
        </div>
      </PageHero>

      <section className="gutter section-y">
        <SectionHead label={labels.challenges.label} title={labels.challenges.title} />
        <Reveal as="ul" className="problems mt-14 md:mt-20" stagger={0.1}>
          {industry.challenges.map((challenge, challengeIndex) => (
            <li key={challenge.title} data-reveal-item className="problem rounded-card">
              <span aria-hidden className="problem-flutes" />
              <span aria-hidden className="problem-glow" />
              <div className="relative flex items-center justify-between">
                <span className="text-label tabular-nums text-subtle">
                  {String(challengeIndex + 1).padStart(2, "0")} / {String(industry.challenges.length).padStart(2, "0")}
                </span>
                <span aria-hidden className="problem-dot" />
              </div>
              <span aria-hidden className="problem-num stretch text-grain text-sky">
                {String(challengeIndex + 1).padStart(2, "0")}
              </span>
              <div className="relative mt-auto">
                <span aria-hidden className="problem-rule" />
                <h3 className="text-title font-medium">{challenge.title}</h3>
                <p className="problem-body mt-3 text-sm text-muted">{challenge.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
        <SectionHead label={labels.helps.label} title={labels.helps.title} />
        <Reveal as="ol" className="mt-14 border-b border-line md:mt-20" stagger={0.08}>
          {industry.helps.map((help, helpIndex) => {
            const service = services.find((item) => item.slug === help.service);
            return (
              <li key={help.title} data-reveal-item className="border-t border-line">
                <div className="grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                  <span className="text-label flex items-center gap-3 tabular-nums text-subtle md:col-span-2">
                    {String(helpIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-title font-medium md:col-span-4">{help.title}</h3>
                  <div className="md:col-span-6">
                    <p className="text-muted">{help.body}</p>
                    {service ? <p className="text-label mt-3 text-subtle">{service.title}</p> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </Reveal>
      </section>

      {cases.length ? (
        <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
          <SectionHead label={labels.work.label} title={labels.work.title} />
          <ul className="mt-14 grid gap-x-6 gap-y-16 md:mt-20 md:grid-cols-12 md:gap-y-24">
            {cases.map((project, caseIndex) => (
              <li key={project.slug} className={cn(wide(caseIndex) ? "md:col-span-7" : "md:col-span-5")}>
                <WorkCard
                  project={project}
                  index={work.indexOf(project)}
                  viewLabel={copy.ui.view}
                  aspect={wide(caseIndex) ? "landscape" : "portrait"}
                  sizes="(min-width: 768px) 58vw, 100vw"
                  frame={(media) => <FrameRise>{media}</FrameRise>}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ClosingCta
        label={copy.industries.closing.label}
        title={copy.industries.closing.title}
        body={copy.industries.closing.body}
        primary={{ label: copy.industries.closing.primary, href: "/start" }}
        secondary={{ label: copy.industries.closing.secondary, href: `/portfolio?industry=${industry.slug}` }}
      />
    </>
  );
}
