import { assets } from "@/data/portfolio";
import { getServerCopy } from "@/versions/main/server";
import { ProjectJourney } from "@/versions/main/home/ProjectJourney";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ButtonLink } from "@/versions/main/ui/Button";
import { Label } from "@/versions/main/ui/Label";

/**
 * Objective 01 — "prominent, easy-to-reach portfolio". "Selected Work", its
 * intro and CTA, then the four flagship cases as one journey: a line drawn by the
 * scroll runs beside each card and on into the sections around it (ProjectJourney).
 */
export async function SelectedWork() {
  const { copy, featured } = await getServerCopy();
  const section = copy.home.work;

  return (
    <section data-thread-visible className="gutter section-y relative pb-[clamp(1rem,2.5vw,2.5rem)]" aria-labelledby="selected-work">
      <header>
        <Label className="mb-6">{section.label}</Label>
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-8">
            {/* Only the heading itself: the home thread (LogoThread) is routed clear of it, and the column is far wider. */}
            <div id="selected-work" data-thread-avoid className="inline-block">
              <StretchHeading lines={section.title} className="text-headline" />
            </div>
          </div>
          <Reveal className="flex flex-col items-start gap-6 md:col-span-4 md:pt-2">
            <p data-reveal-item className="max-w-sm text-muted">
              {section.intro}
            </p>
            <div data-reveal-item>
              <ButtonLink href="/portfolio" variant="glass" transitionLabel={copy.meta.pages.work.title}>
                {section.cta}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </header>

      <ProjectJourney projects={featured.map((project) => ({ ...project, image: assets(project.slug).image("card-v2") }))} viewLabel={copy.ui.view} />
    </section>
  );
}
