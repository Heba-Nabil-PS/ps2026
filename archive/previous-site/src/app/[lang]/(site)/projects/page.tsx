import { RevealText } from "@/components/animations/RevealText";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { CallToAction } from "@/components/ui/CallToAction";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.projects;
  const alternates = alternatesFor("/projects", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function ProjectsPage() {
  const { projects, t } = await getServerContent();
  const categories = Array.from(new Set(projects.map((project) => project.category)));

  return (
    <>
      <section aria-labelledby="projects-title" className="gutter pb-20 pt-36 md:pb-32 md:pt-48">
        <div className="relative">
          <RevealText
            id="projects-title"
            as="h1"
            immediate
            delay={0.1}
            className="text-mega font-extrabold uppercase"
            lineClassName="md:nth-2:ps-[18vw]"
          >
            {t.projects.title}
          </RevealText>
          <span className="text-label absolute end-0 top-2 tabular-nums text-accent md:top-6">
            ({String(projects.length).padStart(2, "0")})
          </span>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-6 md:mt-20 md:grid-cols-12">
          <RevealText as="p" mode="words" immediate delay={0.45} className="text-lead md:col-span-6">
            {t.projects.lead}
          </RevealText>
          <ul className="flex flex-wrap content-start gap-x-6 gap-y-2 md:col-span-5 md:col-start-8 md:justify-end" aria-label={t.studio.disciplines}>
            {categories.map((category) => (
              <li key={category} className="text-label text-muted">
                {category}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label={t.projects.projectList} className="gutter pb-28 md:pb-44">
        <ProjectGrid projects={projects} layout="editorial" preloadFirst />
      </section>

      <CallToAction />
    </>
  );
}
