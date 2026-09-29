import { getServerCopy } from "@/versions/main/server";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Reveal } from "@/versions/main/motion/Reveal";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { ButtonLink } from "@/versions/main/ui/Button";
import { Label } from "@/versions/main/ui/Label";

/**
 * Objective 01 — "prominent, easy-to-reach portfolio". "Selected Work" with
 * a count, as in the Agentura reference, then four flagship cases in large
 * frames that flatten as they rise, two to a row so the grid stays full.
 */
export async function SelectedWork() {
  const { copy, featured } = await getServerCopy();
  const section = copy.home.work;

  return (
    <section className="gutter section-y" aria-labelledby="selected-work">
      <header className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Label className="mb-6">{section.label}</Label>
          <div id="selected-work" className="relative inline-block">
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

      <ul className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-2 md:gap-y-14">
        {featured.map((project, index) => (
          <li key={project.slug}>
            <WorkCard
              project={project}
              index={index}
              viewLabel={copy.ui.view}
              aspect="landscape"
              sizes="(min-width: 768px) 50vw, 100vw"
              frame={(media) => <FrameRise>{media}</FrameRise>}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
