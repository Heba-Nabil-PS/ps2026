import type { Industry } from "@/data/industries";
import type { PortfolioProject } from "@/data/portfolio";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { getCopy } from "@/versions/main/copy";
import { serviceHref } from "@/versions/main/data/routes";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { Reveal } from "@/versions/main/motion/Reveal";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { AppLink } from "@/versions/main/ui/AppLink";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Asterisk } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { ArrowUpRight } from "lucide-react";

/** Same rhythm as the work index: wide, narrow / narrow, wide. */
const wide = (index: number) => index % 4 === 0 || index % 4 === 3;

type IndustryViewProps = { lang: Locale; industry: Industry; index: number };

/**
 * An industry: the problems we hear in it, what we build and run (each line
 * links to its service), the work that proves it, then one call to action.
 */
export function IndustryView({ lang, industry, index }: IndustryViewProps) {
  const { copy, work, industries: list } = getCopy(lang);
  const labels = copy.industries.labels;
  const services = copy.services.list;
  const cases = industry.work.map((caseSlug) => work.find((project) => project.slug === caseSlug)).filter((project): project is PortfolioProject => Boolean(project));

  return (
    <>
      <PageHero label={industry.flagship ? `${industry.title} · ${copy.nav.menus.flagship}` : industry.title} title={industry.headline} intro={industry.intro} image={industry.image}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackLink href="/industries" label={labels.back} transitionLabel={copy.meta.pages.industries.title} />
          <p className="text-label tabular-nums text-subtle">
            {String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </p>
        </div>
      </PageHero>

      <section className="gutter section-y">
        <SectionHead label={labels.challenges.label} title={labels.challenges.title} />
        <Reveal as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4" stagger={0.1}>
          {industry.challenges.map((challenge) => (
            <li key={challenge.title} data-reveal-item className="glass group flex min-h-64 flex-col rounded-card p-7">
              <Asterisk className="size-5 text-sky" />
              <h3 className="text-title mt-auto pt-12 font-medium">{challenge.title}</h3>
              <p className="mt-3 text-sm text-muted">{challenge.body}</p>
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
                <AppLink href={serviceHref(help.service)} transitionLabel={service?.title} className="group grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                  <span className="text-label flex items-center gap-3 tabular-nums text-subtle md:col-span-2">
                    <Asterisk className="text-sky" />
                    {String(helpIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-title font-medium transition-colors duration-500 group-hover:text-sky md:col-span-4">{help.title}</h3>
                  <div className="md:col-span-5">
                    <p className="text-muted">{help.body}</p>
                    {service ? <p className="text-label mt-3 text-subtle">{service.title}</p> : null}
                  </div>
                  <span
                    aria-hidden
                    className="grid size-10 place-items-center self-start rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 md:col-span-1 md:justify-self-end rtl:-scale-x-100"
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </AppLink>
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
        secondary={{ label: copy.industries.closing.secondary, href: "/work" }}
      />
    </>
  );
}
