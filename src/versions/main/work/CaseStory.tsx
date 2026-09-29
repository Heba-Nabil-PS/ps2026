import type { PortfolioProject, ProjectLink, ProjectLinkKind } from "@/data/portfolio";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { serviceHref } from "@/versions/main/data/routes";
import { Asterisk, Label } from "@/versions/main/ui/Label";
import { CaseStats } from "@/versions/main/work/CaseBlocks";
import { ArrowUpRight, Globe, Quote, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** 01 — the problem, lit word by word as it is read. */
export function CaseChallenge({ label, index, text }: { label: string; index: number; text: string }) {
  return (
    <section className="gutter section-y grid gap-8 md:grid-cols-12">
      <Label index={pad(index)} className="self-start md:col-span-3 md:pt-3">
        {label}
      </Label>
      <ScrollHighlight text={text} className="text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.025em] md:col-span-8 md:col-start-5" />
    </section>
  );
}

/**
 * 02 — what we did: the steps as numbered rows, with the disciplines that
 * delivered them pinned alongside (each opens the work index filtered to it).
 */
export function CaseApproach({
  label,
  index,
  steps,
  disciplines,
  disciplinesLabel,
}: {
  label: string;
  index: number;
  steps: NonNullable<PortfolioProject["approach"]>;
  disciplines: { slug?: string; title: string }[];
  disciplinesLabel: string;
}) {
  return (
    <section className="gutter section-y grid gap-12 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-32">
          <Label index={pad(index)}>{label}</Label>
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
            <span className="stretch text-[clamp(2.5rem,4.5vw,4rem)] leading-none text-sky tabular-nums">{pad(i + 1)}</span>
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

/** 03 — where it landed: the summary, then the numbers counting up. */
export function CaseResults({ label, index, results }: { label: string; index: number; results: NonNullable<PortfolioProject["results"]> }) {
  return (
    <section className="gutter section-y">
      <div className="grid gap-8 md:grid-cols-12">
        <Label index={pad(index)} className="self-start md:col-span-3 md:pt-3">
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
        <blockquote className="relative max-w-4xl text-[clamp(1.5rem,3vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.02em]">“{review.quote}”</blockquote>
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

/** Brand marks lucide no longer ships; simple single-colour glyphs. */
const brand = (path: string) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
    <path d={path} />
  </svg>
);

const icons: Record<ProjectLinkKind, ReactNode> = {
  website: <Globe aria-hidden className="size-4" />,
  app: <Smartphone aria-hidden className="size-4" />,
  instagram: (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  facebook: brand("M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z"),
  linkedin: brand("M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2 9h4v12H2zM9 9h4v1.7C13.6 9.7 14.9 9 16.5 9 20 9 22 11 22 14.8V21h-4v-5.6c0-1.7-.7-2.7-2.1-2.7-1.5 0-2.9 1-2.9 3V21H9z"),
  tiktok: brand("M16.5 3c.4 2.3 1.9 3.8 4.5 4v3.6c-1.6 0-3.1-.5-4.5-1.3V16a6 6 0 1 1-6-6h.6v3.7a2.4 2.4 0 1 0 1.8 2.3V3z"),
  youtube: brand("M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9L15.5 12z"),
  x: brand("M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"),
  behance: brand("M8.2 11.3c1-.5 1.6-1.2 1.6-2.4C9.8 6.5 8 6 6 6H0v12h6.2c2.3 0 4.5-1.1 4.5-3.7 0-1.6-.8-2.8-2.5-3zM2.7 8h2.6c1 0 1.9.3 1.9 1.4 0 1.1-.7 1.5-1.7 1.5H2.7zm2.9 7.9H2.7v-3.3h3c1.2 0 2 .5 2 1.8 0 1.2-.9 1.5-2.1 1.5zM18 9c-3.2 0-5.3 2.3-5.3 5.2 0 3.1 2 5.2 5.3 5.2 2.5 0 4.1-1.1 4.9-3.5h-2.5c-.3.9-1.4 1.4-2.3 1.4-1.7 0-2.6-1-2.6-2.7h7.5C23.1 11.4 21.4 9 18 9zm-2.5 4.2c.1-1.4 1-2.2 2.4-2.2 1.4 0 2.2.8 2.3 2.2zM15.5 6.5h5.3v1.3h-5.3z"),
};

/** Where to see the work live — the site, the app and the brand's social accounts. */
export function CaseLinks({ label, links, names }: { label: string; links: ProjectLink[]; names: Record<ProjectLinkKind, string> }) {
  return (
    <Reveal as="section" className="gutter pb-[clamp(5rem,11vw,10rem)]">
      <div data-reveal-item className="flex flex-col gap-8 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
        <p className="text-title flex items-center gap-4 font-medium">
          <Asterisk className="text-sky" />
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
                {icons[link.kind]}
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
