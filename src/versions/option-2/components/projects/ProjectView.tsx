import { ImageReveal } from "@/versions/option-2/components/animations/ImageReveal";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { HorizontalGallery } from "@/versions/option-2/components/projects/HorizontalGallery";
import { NextProject } from "@/versions/option-2/components/projects/NextProject";
import { ProjectHero } from "@/versions/option-2/components/projects/ProjectHero";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import type { Project } from "@/versions/option-2/data/projects";
import { getServerContent } from "@/versions/option-2/i18n/server";

type ProjectViewProps = { project: Project; next: Project; previous: Project };

export async function ProjectView({ project, next, previous }: ProjectViewProps) {
  const { t } = await getServerContent();
  const copy = t.projects;
  const [wideImage, portraitImage, filmImage] = project.gallery;
  const galleryImages = [project.heroImage, ...project.gallery].map((src, i) => ({
    src,
    alt: `${project.title} — ${copy.galleryImage} ${i + 1}`,
  }));

  return (
    <article>
      <ProjectHero project={project} />

      {/* Introduction */}
      <section aria-labelledby="overview" className="gutter grid grid-cols-1 gap-10 py-24 md:grid-cols-12 md:py-28">
        <div className="md:col-span-3">
          <SectionLabel index="01">{copy.overview}</SectionLabel>
          <h2 id="overview" className="sr-only">
            {copy.overview}
          </h2>
        </div>
        <div className="md:col-span-9">
          <RevealText as="p" mode="words" stagger={0.012} className="text-lead font-medium">
            {project.intro}
          </RevealText>
        </div>
      </section>

      {/* Services + details */}
      <section aria-labelledby="scope" className="gutter grid grid-cols-1 gap-12 border-t border-line py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-3">
          <SectionLabel index="02">{copy.scope}</SectionLabel>
          <h2 id="scope" className="sr-only">
            {copy.scopeTitle}
          </h2>
        </div>
        <ul className="md:col-span-4" aria-label={t.common.services}>
          {project.services.map((service) => (
            <li key={service} className="text-title border-b border-line py-3 font-medium first:pt-0">
              {service}
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-8 md:col-span-4 md:col-start-9">
          {project.details.map((detail) => (
            <div key={detail.label} className="flex flex-col">
              <dt className="text-label order-1 mb-2 text-muted">{detail.label}</dt>
              <dd className="order-2">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Full-width visual */}
      <ImageReveal
        src={wideImage}
        alt={`${project.title} — ${t.common.keyVisual}`}
        sizes="100vw"
        parallax={0.12}
        tone={project.color}
        className="h-[60svh] md:h-[110svh]"
      />

      {/* Text + image */}
      <section aria-labelledby="challenge" className="gutter grid grid-cols-1 items-center gap-14 py-24 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <SectionLabel index="03" className="mb-6">
            {copy.challenge}
          </SectionLabel>
          <RevealText id="challenge" as="h2" mode="words" className="text-headline font-medium">
            {project.challenge.heading}
          </RevealText>
          <p className="mt-8 max-w-md leading-relaxed text-muted">{project.challenge.body}</p>
        </div>
        <ImageReveal
          src={portraitImage}
          alt={`${project.title} — ${copy.detail}`}
          sizes="(min-width: 768px) 50vw, 100vw"
          direction="left"
          parallax={0.08}
          tone={project.color}
          className="aspect-[4/5] md:col-span-6 md:col-start-7"
        />
      </section>

      {/* Full-width film */}
      <section aria-labelledby="approach" className="relative">
        <ImageReveal
          src={filmImage}
          video={project.video}
          alt={`${project.title} — ${copy.film}`}
          sizes="100vw"
          parallax={0.1}
          direction="down"
          tone={project.color}
          className="h-[70svh] md:h-screen"
        >
          <div className="gutter absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/80 to-transparent pb-10 pt-40 md:pb-16">
            <SectionLabel index="04" className="mb-6 text-fg">
              {copy.approach}
            </SectionLabel>
            <RevealText id="approach" as="h2" mode="words" className="text-headline max-w-4xl font-medium">
              {project.approach.heading}
            </RevealText>
          </div>
        </ImageReveal>
        <div className="gutter grid grid-cols-1 py-16 md:grid-cols-12 md:py-24">
          <p className="text-lead text-muted md:col-span-7 md:col-start-6">{project.approach.body}</p>
        </div>
      </section>

      {/* Gallery */}
      <section aria-label={copy.gallery} className="pb-24 md:pb-16">
        <HorizontalGallery images={galleryImages} tone={project.color} />
      </section>

      {/* Results */}
      <section aria-labelledby="results" className="gutter border-t border-line py-24 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionLabel index="05">{copy.results}</SectionLabel>
            <h2 id="results" className="sr-only">
              {copy.results}
            </h2>
          </div>
          <div className="md:col-span-9">
            <dl className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {project.results.map((result, i) => (
                <div key={result.label} className="flex flex-col border-t border-line pt-6">
                  <dt className="text-label order-2 mt-3 text-muted">{result.label}</dt>
                  <dd className="order-1">
                    <RevealText as="span" delay={i * 0.08} className="text-display block font-medium tabular-nums">
                      {result.value}
                    </RevealText>
                  </dd>
                </div>
              ))}
            </dl>
            <RevealText as="p" mode="words" stagger={0.015} className="text-lead mt-16 max-w-3xl md:mt-24">
              {project.outcome}
            </RevealText>
          </div>
        </div>
      </section>

      <NextProject next={next} previous={previous} />
    </article>
  );
}
