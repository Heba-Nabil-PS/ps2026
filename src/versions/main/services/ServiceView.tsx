import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { fill, getCopy } from "@/versions/main/copy";
import { industryHref } from "@/versions/main/data/routes";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { DeliverableGrid } from "@/versions/main/services/DeliverableGrid";
import { NumbersGrid } from "@/versions/main/sections/NumbersGrid";
import { ProcessCards } from "@/versions/main/sections/ProcessCards";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { AppLink } from "@/versions/main/ui/AppLink";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Faq } from "@/versions/main/ui/Faq";
import { Label } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { ArrowUpRight } from "lucide-react";

const pad = (value: number) => String(value).padStart(2, "0");

/** The round arrow every row link on the site ends with. */
function Arrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center self-start rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100",
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}

/**
 * A service discipline: what it is, the numbers behind it, what you get, how
 * we work, the work that proves it, the industries it serves, questions, then
 * one call to action. Every list links on: cases to their pages, sectors to
 * theirs, and the work section to the index filtered to this discipline.
 */
export function ServiceView({ lang, index }: { lang: Locale; index: number }) {
  const { copy, site, work, categoriesOf, industries } = getCopy(lang);
  const list = copy.services.list;
  const service = list[index];
  const slug = service.slug;
  const labels = copy.services.detail;
  const cases = work.filter((project) => categoriesOf(project).includes(slug)).slice(0, 3);
  const sectors = industries.filter((industry) => industry.helps.some((help) => help.service === slug));

  return (
    <>
      <PageHero title={service.headline} intro={service.intro} image={service.image}>
        <BackLink href="/services" label={labels.back} transitionLabel={copy.meta.pages.services.title} />
      </PageHero>

      {service.numbers.length ? (
        <section className="gutter pb-[clamp(4rem,9vw,8rem)]">
          <Label className="mb-8">{labels.numbers}</Label>
          <NumbersGrid items={service.numbers} />
        </section>
      ) : null}

      <section className={cn("gutter section-y", service.numbers.length && "pt-0!")}>
        <SectionHead label={labels.deliverables.label} title={labels.deliverables.title} intro={service.summary} />
        <DeliverableGrid items={service.deliverables} />
      </section>

      <ProcessCards label={copy.services.process.label} title={copy.services.process.title} steps={site.process} />

      {cases.length ? (
        <section className="gutter section-y">
          <SectionHead
            label={labels.work.label}
            title={labels.work.title}
            action={
              <ButtonLink href={`/portfolio?service=${slug}`} variant="glass" transitionLabel={copy.meta.pages.work.title}>
                {fill(labels.work.all, { service: service.title })}
              </ButtonLink>
            }
          />
          <ul className="mt-14 grid gap-x-6 gap-y-16 md:mt-20 md:grid-cols-3">
            {cases.map((project) => (
              <li key={project.slug}>
                <WorkCard project={project} index={work.indexOf(project)} viewLabel={copy.ui.view} aspect="portrait" sizes="(min-width: 768px) 33vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sectors.length ? (
        <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
          <SectionHead
            label={labels.industries.label}
            title={labels.industries.title}
            action={
              <ButtonLink href="/industries" variant="glass" transitionLabel={copy.meta.pages.industries.title}>
                {labels.industries.all}
              </ButtonLink>
            }
          />
          <Reveal as="ol" className="mt-14 border-b border-line md:mt-20" stagger={0.08}>
            {sectors.map((industry, sectorIndex) => {
              const help = industry.helps.find((item) => item.service === slug);
              return (
                <li key={industry.slug} data-reveal-item className="border-t border-line">
                  <AppLink href={industryHref(industry.slug)} transitionLabel={industry.title} className="group grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                    <span className="text-label flex items-center gap-3 tabular-nums text-subtle md:col-span-2">{pad(sectorIndex + 1)}</span>
                    <h3 className="text-title font-medium transition-colors duration-500 group-hover:text-sky md:col-span-4">{industry.title}</h3>
                    <p className="text-muted md:col-span-5">{help?.body ?? industry.short}</p>
                    <Arrow className="md:col-span-1 md:justify-self-end" />
                  </AppLink>
                </li>
              );
            })}
          </Reveal>
        </section>
      ) : null}

      <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] md:grid-cols-12">
        <div className="md:col-span-5">
          <Label className="mb-6">{labels.faq.label}</Label>
          <StretchHeading lines={labels.faq.title} className="text-headline" />
        </div>
        <div className="md:col-span-7">
          <Faq items={service.faq} />
        </div>
      </section>

      <ClosingCta
        label={labels.closing.label}
        title={labels.closing.title}
        body={labels.closing.body}
        primary={{ label: labels.closing.primary, href: `/start?service=${slug}` }}
        secondary={{ label: labels.closing.secondary, href: "/services" }}
      />
    </>
  );
}
