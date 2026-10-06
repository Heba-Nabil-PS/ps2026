import type { Industry } from "@/data/industries";
import type { Insight } from "@/data/insights";
import type { PortfolioProject } from "@/data/portfolio";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { formatDate, getCopy } from "@/versions/main/copy";
import { serviceHref } from "@/versions/main/data/routes";
import { workHref } from "@/versions/main/data/work";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { InsightCard } from "@/versions/main/sections/InsightCard";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { CaseStats } from "@/versions/main/work/CaseBlocks";
import { AppLink } from "@/versions/main/ui/AppLink";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Faq } from "@/versions/main/ui/Faq";
import { Label } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

const pad = (value: number) => String(value).padStart(2, "0");

/** The round arrow every link on the site ends with. */
function Arrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100",
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}

type IndustryViewProps = { lang: Locale; industry: Industry; index: number };

/**
 * An industry, paced so no two sections look alike: the numbers, the
 * problems as cards, then each stage a brand came to us at as an image-led
 * chapter with the case that answered it (so every case appears once), any
 * cases left over, the lessons, the reading, questions, and one call to
 * action that carries the sector into the brief.
 */
export function IndustryView({ lang, industry, index }: IndustryViewProps) {
  const { copy, work, insights, industries: list } = getCopy(lang);
  const labels = copy.industries.labels;
  const services = copy.services.list;
  const findCase = (slug: string) => work.find((project) => project.slug === slug);
  const staged = new Set(industry.stages.map((stage) => stage.work));
  const more = industry.work.filter((slug) => !staged.has(slug)).map(findCase).filter((project): project is PortfolioProject => Boolean(project));
  const reading = industry.insights.map((slug) => insights.find((insight) => insight.slug === slug)).filter((insight): insight is Insight => Boolean(insight));
  const start = `/start?industry=${industry.slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };

  return (
    <>
      {industry.faq.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <PageHero title={industry.headline} intro={industry.intro} image={industry.image} titleClassName="text-display-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackLink href="/industries" label={labels.back} transitionLabel={copy.meta.pages.industries.title} />
          <p className="text-label tabular-nums text-subtle">
            {pad(index + 1)} / {pad(list.length)}
          </p>
        </div>
      </PageHero>

      {industry.proof?.length ? (
        <section className="gutter pb-[clamp(4rem,9vw,8rem)]">
          <Label className="mb-8">{labels.proof}</Label>
          <CaseStats items={industry.proof} />
        </section>
      ) : null}

      <section className={cn("gutter section-y", industry.proof?.length && "pt-0!")}>
        <SectionHead label={labels.challenges.label} title={labels.challenges.title} />
        <Reveal as="ul" className="problems mt-14 md:mt-20" stagger={0.1}>
          {industry.challenges.map((challenge, challengeIndex) => (
            <li key={challenge.title} data-reveal-item className="problem rounded-card">
              <span aria-hidden className="problem-flutes" />
              <span aria-hidden className="problem-glow" />
              <div className="relative flex items-center justify-between">
                <span className="text-label tabular-nums text-subtle">
                  {pad(challengeIndex + 1)} / {pad(industry.challenges.length)}
                </span>
                <span aria-hidden className="problem-dot" />
              </div>
              <span aria-hidden className="problem-num stretch text-grain text-sky">
                {pad(challengeIndex + 1)}
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

      {/* Chapters: the case image leads, the stage reads beside it, sides alternate. */}
      <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
        <SectionHead label={labels.stages.label} title={labels.stages.title} intro={labels.stages.intro} />
        <ol className="mt-16 grid gap-[clamp(4.5rem,10vw,10rem)] md:mt-24">
          {industry.stages.map((stage, stageIndex) => {
            const project = findCase(stage.work);
            const service = services.find((item) => item.slug === stage.service);
            const flip = stageIndex % 2 === 1;
            return (
              <li key={stage.stage} className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
                {project ? (
                  <AppLink
                    href={workHref(project.slug)}
                    transitionLabel={project.title}
                    data-cursor={copy.ui.view}
                    className={cn("group block md:col-span-7", flip && "md:order-last")}
                  >
                    <FrameRise frameClassName="aspect-[4/3] bg-navy-800">
                      <Image
                        src={project.heroImage}
                        alt={project.title}
                        fill
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.04]"
                      />
                      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(3_7_13/0.65))]" />
                      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 md:inset-x-6 md:bottom-6">
                        <span className="min-w-0">
                          <span className="text-label block text-paper/70">{labels.stageCase}</span>
                          <span className="mt-1 block truncate text-lead font-medium text-paper">{project.title}</span>
                        </span>
                        <Arrow className="border-paper/40 text-paper" />
                      </div>
                    </FrameRise>
                  </AppLink>
                ) : null}

                <Reveal className={cn("md:col-span-5", flip ? "md:pe-6" : "md:ps-6")} stagger={0.08}>
                  <div data-reveal-item className="flex items-end gap-5">
                    <span aria-hidden className="stretch text-grain text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.8] text-sky">
                      {pad(stageIndex + 1)}
                    </span>
                    <span className="text-label mb-1 rounded-full border border-sky/40 px-3 py-2 text-sky">{stage.stage}</span>
                  </div>
                  <h3 data-reveal-item className="mt-8 text-[clamp(1.5rem,2.6vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                    {stage.title}
                  </h3>
                  <p data-reveal-item className="text-lead mt-5 text-muted">
                    {stage.body}
                  </p>
                  <div data-reveal-item className="mt-8 flex flex-wrap items-center gap-3">
                    <ButtonLink href={`${start}&service=${stage.service}`} variant="glass" transitionLabel={copy.meta.pages.start.title}>
                      {labels.stageStart}
                    </ButtonLink>
                    {service ? (
                      <AppLink
                        href={serviceHref(service.slug)}
                        transitionLabel={service.title}
                        className="text-label rounded-full border border-line-strong px-4 py-3 text-subtle transition-colors duration-500 hover:border-sky hover:text-sky"
                      >
                        {service.title}
                      </AppLink>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {more.length ? (
        // The cases no stage tells: the heading sits beside them, so one case never leaves half the row empty.
        <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Label className="mb-6">{labels.work.label}</Label>
            <StretchHeading lines={labels.work.title} className="text-headline" />
          </div>
          <ul className="grid gap-y-16 md:col-span-7">
            {more.map((project) => (
              <li key={project.slug}>
                <WorkCard project={project} index={work.indexOf(project)} viewLabel={copy.ui.view} aspect="landscape" sizes="(min-width: 768px) 58vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Lessons beside their heading: a quiet, text-only beat between the imagery and the reading. */}
      <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Label className="mb-6">{labels.lessons.label}</Label>
          <StretchHeading lines={labels.lessons.title} className="text-headline" />
        </div>
        <Reveal as="ol" className="border-b border-line md:col-span-7" stagger={0.1}>
          {industry.lessons.map((lesson, lessonIndex) => (
            <li key={lesson.title} data-reveal-item className="flex gap-6 border-t border-line py-8 md:gap-10">
              <span className="text-label pt-2 tabular-nums text-sky">{pad(lessonIndex + 1)}</span>
              <div>
                <h3 className="text-title font-medium">{lesson.title}</h3>
                <p className="mt-3 max-w-xl text-muted">{lesson.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </section>

      {reading.length ? (
        <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
          <SectionHead
            label={labels.insights.label}
            title={labels.insights.title}
            action={
              <ButtonLink href="/insights" variant="glass" transitionLabel={copy.meta.pages.insights.title}>
                {copy.home.insights.cta}
              </ButtonLink>
            }
          />
          <Reveal as="ul" className="mt-14 grid gap-x-6 gap-y-12 md:mt-20 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {reading.map((insight) => (
              <li key={insight.slug} data-reveal-item>
                <InsightCard insight={insight} date={formatDate(lang, insight.date)} viewLabel={copy.ui.readMore} />
              </li>
            ))}
          </Reveal>
        </section>
      ) : null}

      {industry.faq.length ? (
        <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Label className="mb-6">{labels.faq.label}</Label>
            <StretchHeading lines={labels.faq.title} className="text-headline" />
          </div>
          <div className="md:col-span-7">
            <Faq items={industry.faq} />
          </div>
        </section>
      ) : null}

      <ClosingCta
        label={copy.industries.closing.label}
        title={copy.industries.closing.title}
        body={copy.industries.closing.body}
        primary={{ label: copy.industries.closing.primary, href: start }}
        secondary={{ label: copy.industries.closing.secondary, href: `/portfolio?industry=${industry.slug}` }}
      />
    </>
  );
}
