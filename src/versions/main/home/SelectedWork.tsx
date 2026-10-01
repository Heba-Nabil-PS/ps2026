import { assets } from "@/data/portfolio";
import { getServerCopy } from "@/versions/main/server";
import { ProjectJourney } from "@/versions/main/home/ProjectJourney";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ButtonLink } from "@/versions/main/ui/Button";
import { Label } from "@/versions/main/ui/Label";

/**
 * Objective 01 — "prominent, easy-to-reach portfolio". "Selected Work" with
 * a count, then the four flagship cases as one journey: a line drawn by the
 * scroll runs beside each card and on into the sections around it (ProjectJourney).
 */
export async function SelectedWork() {
  const { copy, featured } = await getServerCopy();
  const section = copy.home.work;

  return (
    <section data-thread-visible className="gutter section-y" aria-labelledby="selected-work">
      <header className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Label className="mb-6">{section.label}</Label>
          <div id="selected-work" data-thread-avoid className="relative inline-block">
            <StretchHeading lines={section.title} className="text-headline" />
            <sup aria-hidden className="absolute -end-10 -top-3 grid size-8 place-items-center rounded-full bg-sky text-sm font-semibold tabular-nums text-ink-900 md:-end-10 md:size-9">
              {featured.length}
            </sup>
          </div>
        </div>
        <Reveal className="flex flex-col items-start gap-6 md:col-span-4 md:pb-3">
          <p data-reveal-item className="max-w-sm text-muted">
            {section.intro}
          </p>
          <div data-reveal-item>
            <ButtonLink href="/work" variant="glass" transitionLabel={copy.meta.pages.work.title}>
              {section.cta}
            </ButtonLink>
          </div>
        </Reveal>
      </header>

      <ProjectJourney projects={featured.map((project) => ({ ...project, image: assets(project.slug).image("card") }))} viewLabel={copy.ui.view} />
    </section>
  );
}
