import { NextProject } from "@/components/portfolio/NextProject";
import { ProjectContent } from "@/components/portfolio/ProjectContent";
import { ProjectDetails } from "@/components/portfolio/ProjectDetails";
import { ProjectHero } from "@/components/portfolio/ProjectHero";
import { portfolio as englishPortfolio, portfolioHref } from "@/data/portfolio";
import { findWithNeighbours } from "@/i18n/content";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

export function generateStaticParams() {
  return englishPortfolio.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { portfolio, t } = await getServerContent();
  const project = portfolio.find((item) => item.slug === slug);
  if (!project) return { title: t.meta.projectNotFound, robots: { index: false } };

  const title = `${project.title} — ${project.category}`;
  const alternates = alternatesFor(portfolioHref(project.slug), locale);
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

export default async function PortfolioProjectPage({ params }: PageProps<"/[lang]/portfolio/[slug]">) {
  const { slug } = await params;
  const { portfolio } = await getServerContent();
  const found = findWithNeighbours(portfolio, slug);
  if (!found) notFound();

  const { item: project, next, previous } = found;

  return (
    <ViewTransition
      default="none"
      enter={{ "pf-open": "pf-page-enter", default: "none" }}
      exit={{ "pf-open": "pf-list-exit", "pf-back": "pf-list-exit", default: "none" }}
    >
      <article>
        <ProjectHero project={project} />
        <ProjectDetails project={project} />
        <ProjectContent project={project} />
        <NextProject next={next} previous={previous} />
      </article>
    </ViewTransition>
  );
}
