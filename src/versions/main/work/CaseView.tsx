import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import { getCopy, type findCase } from "@/versions/main/copy";
import { industryHref } from "@/versions/main/data/routes";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { AppLink } from "@/versions/main/ui/AppLink";
import { BackLink } from "@/versions/main/ui/BackLink";
import { Label } from "@/versions/main/ui/Label";
import { CaseBlocks } from "@/versions/main/work/CaseBlocks";
import { CaseApproach, CaseChallenge, CaseLinks, CaseResults, CaseReview } from "@/versions/main/work/CaseStory";
import { NextCase } from "@/versions/main/work/NextCase";
import Image from "next/image";

type CaseViewProps = { lang: Locale; found: NonNullable<ReturnType<typeof findCase>> };

/**
 * A case study: stretched title, the facts, the hero in full colour rising
 * into place, the story in blocks, then the next case to keep browsing.
 */
export function CaseView({ lang, found }: CaseViewProps) {
  const { copy, categoriesOf, industryOf } = getCopy(lang);
  const { project, next, index, total } = found;
  const labels = copy.work.case;
  const matched = copy.services.list.filter((service) => categoriesOf(project).includes(service.slug));
  const disciplines = matched.map((service) => service.title);
  const disciplineLinks = matched.length ? matched.map(({ slug, title }) => ({ slug, title })) : project.services.map((title) => ({ title }));

  const industry = industryOf(project);
  const facts: { term: string; value: string; href?: string }[] = [
    { term: labels.client, value: project.client },
    ...(industry ? [{ term: labels.industry, value: industry.title, href: industryHref(industry.slug) }] : []),
    ...(project.market ? [{ term: labels.market, value: project.market }] : []),
    { term: labels.services, value: (disciplines.length ? disciplines : project.services).join(", ") },
    { term: labels.deliverables, value: project.deliverables.join(", ") },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    image: `${siteConfig.url}${project.heroImage}`,
    creator: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    about: project.client,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="gutter pb-14 pt-36 md:pt-44">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <BackLink href="/work" label={labels.back} />
          <p className="text-label tabular-nums text-subtle">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
        <Label className="mb-8">{project.category}</Label>
        <StretchHeading as="h1" lines={[project.title]} immediate delay={0.3} className="text-display" />
        <Reveal immediate delay={0.8} className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12">
          <p data-reveal-item className="text-lead text-muted md:col-span-6">
            {project.description}
          </p>
          <dl data-reveal-item className="grid gap-x-8 gap-y-6 text-sm sm:grid-cols-2 md:col-span-5 md:col-start-8">
            {facts.map((fact) => (
              <div key={fact.term} className="border-t border-line pt-4">
                <dt className="text-label text-subtle">{fact.term}</dt>
                <dd className="mt-2 text-fg">
                  {fact.href ? (
                    <AppLink href={fact.href} transitionLabel={fact.value} className="underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
                      {fact.value}
                    </AppLink>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      <div className="gutter">
        <FrameRise frameClassName="aspect-[16/10] md:aspect-[16/8]">
          <Image src={project.heroImage} alt={`${project.title} — ${project.category}`} fill priority sizes="100vw" quality={85} className="object-cover" style={{ backgroundColor: project.color }} />
        </FrameRise>
      </div>

      <section className="gutter section-y grid md:grid-cols-12">
        <Label className="mb-6 md:col-span-3">{labels.overview}</Label>
        <Reveal className="md:col-span-8 md:col-start-5">
          <p data-reveal-item className="text-[clamp(1.35rem,2.4vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.02em]">
            {project.intro}
          </p>
        </Reveal>
      </section>

      {project.challenge ? <CaseChallenge label={labels.challenge} text={project.challenge} /> : null}
      {project.approach?.length ? (
        <CaseApproach label={labels.approach} steps={project.approach} disciplines={disciplineLinks} disciplinesLabel={labels.services} />
      ) : null}

      <CaseBlocks blocks={project.content} />

      {project.results ? <CaseResults label={labels.results} results={project.results} /> : null}
      {project.review ? <CaseReview label={labels.review} review={project.review} /> : null}
      {project.links?.some((link) => link.href) ? <CaseLinks label={labels.links} links={project.links.filter((link) => link.href)} names={labels.linkNames} /> : null}

      <NextCase project={next} label={labels.next} viewLabel={copy.ui.view} />
    </article>
  );
}
