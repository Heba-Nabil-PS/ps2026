import type { PortfolioProject, ProjectLink, ProjectLinkKind } from "@/data/portfolio";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { serviceHref } from "@/versions/main/data/routes";
import { Label } from "@/versions/main/ui/Label";
import { CaseStats } from "@/versions/main/work/CaseBlocks";
import { linkIcons } from "@/versions/main/ui/linkIcons";
import { ArrowUpRight, Quote } from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

/** The problem, lit word by word as it is read. */
export function CaseChallenge({ label, text }: { label: string; text: string }) {
  return (
    <section className="gutter section-y grid gap-8 md:grid-cols-12">
      <Label className="self-start md:col-span-3 md:pt-3">
        {label}
      </Label>
      <ScrollHighlight text={text} className="text-[clamp(1.28rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.025em] md:col-span-8 md:col-start-5" />
    </section>
  );
}

/**
 * What we did: the steps as numbered rows, with the disciplines that
 * delivered them pinned alongside (each opens the work index filtered to it).
 */
export function CaseApproach({
  label,
  steps,
  disciplines,
  disciplinesLabel,
}: {
  label: string;
  steps: NonNullable<PortfolioProject["approach"]>;
  disciplines: { slug?: string; title: string }[];
  disciplinesLabel: string;
}) {
  return (
    <section className="gutter section-y grid gap-12 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-32">
          <Label>{label}</Label>
          {disciplines.length ? (
            <div className="mt-10">
              <p className="text-label text-subtle">{disciplinesLabel}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {disciplines.map((discipline) => (
                  <li key={discipline.title}>
                    {discipline.slug ? (
                      <AppLink
                        href={serviceHref(discipline.slug)}
                        transitionLabel={discipline.title}
                        className="glass inline-flex rounded-full px-4 py-2 text-sm text-muted transition-colors duration-500 hover:text-fg"
                      >
                        {discipline.title}
                      </AppLink>
                    ) : (
                      <span className="glass inline-flex rounded-full px-4 py-2 text-sm text-muted">{discipline.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <Reveal as="ol" className="md:col-span-8" stagger={0.12}>
        {steps.map((step, i) => (
          <li key={step.title} data-reveal-item className="grid gap-4 border-t border-line py-10 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr] md:py-12">
            <span className="stretch text-[clamp(2rem,4.5vw,4rem)] leading-none text-sky tabular-nums">{pad(i + 1)}</span>
            <div>
              <h3 className="text-title font-medium">{step.title}</h3>
              <p className="mt-4 max-w-xl text-lead text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}

/** Where it landed: the summary, then the numbers counting up. */
export function CaseResults({ label, results }: { label: string; results: NonNullable<PortfolioProject["results"]> }) {
  return (
    <section className="gutter section-y">
      <div className="grid gap-8 md:grid-cols-12">
        <Label className="self-start md:col-span-3 md:pt-3">
          {label}
        </Label>
        <Reveal className="md:col-span-8 md:col-start-5">
          <p data-reveal-item className="text-[clamp(1.35rem,2.4vw,2.25rem)] font-medium leading-[1.25] tracking-[-0.02em]">
            {results.summary}
          </p>
        </Reveal>
      </div>
      {results.stats?.length ? (
        <div className="mt-14 md:mt-20">
          <CaseStats items={results.stats} />
        </div>
      ) : null}
    </section>
  );
}

/** The client, in their own words. Only rendered for a real, approved quote. */
export function CaseReview({ label, review }: { label: string; review: NonNullable<PortfolioProject["review"]> }) {
  const initials = review.author
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <Reveal as="section" className="gutter section-y pt-0!">
      <figure data-reveal-item className="glass relative overflow-hidden rounded-card p-8 md:p-16">
        <Quote aria-hidden className="absolute -end-6 -top-6 size-48 text-sky/10 md:size-72 rtl:-scale-x-100" />
        <Label className="mb-10">{label}</Label>
        <blockquote className="relative max-w-4xl text-[clamp(1.25rem,3vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.02em]">“{review.quote}”</blockquote>
        <figcaption className="relative mt-12 flex items-center gap-4">
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-sky text-sm font-semibold text-ink-900">
            {initials}
          </span>
          <span className="text-sm">
            <span className="block text-fg">{review.author}</span>
            <span className="block text-muted">{review.role}</span>
          </span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

/** Kinds shown in the case study's facts row: where to visit the site or download the app. */
const liveKinds: ProjectLinkKind[] = ["website", "app", "appStore", "googlePlay"];

/** The project's site and app-store links, skipping any whose URL is still missing. */
export const liveLinksOf = (links: ProjectLink[] = []) => links.filter((link) => link.href && liveKinds.includes(link.kind));

/** Everything else — the brand's social accounts — for the strip at the end of the case. */
export const socialLinksOf = (links: ProjectLink[] = []) => links.filter((link) => link.href && !liveKinds.includes(link.kind));

/** A website reads as its domain; store links read as the store's name. */
const linkText = (link: ProjectLink, names: Record<ProjectLinkKind, string>) =>
  link.label ?? (link.kind === "website" ? new URL(link.href).hostname.replace(/^www\./, "") : names[link.kind]);

/** Site and app-store links stacked as pills, sized to sit in the facts row. */
export function LiveLinks({ links, names }: { links: ProjectLink[]; names: Record<ProjectLinkKind, string> }) {
  return (
    <ul className="flex flex-col items-start gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group inline-flex items-center gap-2.5 rounded-full py-2 pe-3.5 ps-4 text-sm transition-colors duration-500 hover:bg-sky hover:text-ink-900"
          >
            {linkIcons[link.kind]}
            <span>{linkText(link, names)}</span>
            <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Where to see the work live — the site, the app and the brand's social accounts. */
export function CaseLinks({ label, links, names }: { label: string; links: ProjectLink[]; names: Record<ProjectLinkKind, string> }) {
  return (
    <Reveal as="section" className="gutter pb-[clamp(5rem,11vw,10rem)]">
      <div data-reveal-item className="flex flex-col gap-8 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
        <p className="text-title flex items-center gap-4 font-medium">
          {label}
        </p>
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group inline-flex items-center gap-3 rounded-full py-2.5 pe-4 ps-5 text-sm transition-colors duration-500 hover:bg-sky hover:text-ink-900"
              >
                {linkIcons[link.kind]}
                <span>{link.label ?? names[link.kind]}</span>
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
