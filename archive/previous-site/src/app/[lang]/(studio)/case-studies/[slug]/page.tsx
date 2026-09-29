import { ProjectContent } from "@/components/portfolio/ProjectContent";
import { CaseStudyFacts } from "@/components/studio/case-studies/CaseStudyFacts";
import { CaseStudyHero } from "@/components/studio/case-studies/CaseStudyHero";
import { CaseStudyNext } from "@/components/studio/case-studies/CaseStudyNext";
import { InkStatement } from "@/components/studio/InkStatement";
import { caseStudies, caseStudyHref } from "@/data/caseStudies";
import { findWithNeighbours } from "@/i18n/content";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { portfolio, t } = await getServerContent();
  const project = portfolio.find((item) => item.slug === slug);
  if (!project) return { title: t.meta.caseStudyNotFound, robots: { index: false } };

  const title = `${project.title} — ${project.category}`;
  const alternates = alternatesFor(caseStudyHref(project.slug), locale);
  return {
    title,
    description: project.description,
    keywords: [...project.tags, ...project.deliverables],
    alternates,
    openGraph: {
      type: "article",
      title,
      description: project.description,
      url: alternates.canonical,
      images: [{ url: project.heroImage, width: 2400, height: 1500, alt: project.title }],
    },
    twitter: { card: "summary_large_image", title, description: project.description, images: [project.heroImage] },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/case-studies/[slug]">) {
  const { slug } = await params;
  const { portfolio, t } = await getServerContent();
  const found = findWithNeighbours(portfolio, slug);
  if (!found) notFound();

  const { item: project, next, previous } = found;

  return (
    <article>
      <CaseStudyHero project={project} />
      <CaseStudyFacts project={project} />
      <InkStatement label={t.common.introduction} id="case-intro">
        {project.intro}
      </InkStatement>
      {/* Portfolio content blocks are token-driven; remap them to ink on paper. */}
      <div className="studio-tokens">
        <ProjectContent project={project} />
      </div>
      <CaseStudyNext next={next} previous={previous} />
    </article>
  );
}
