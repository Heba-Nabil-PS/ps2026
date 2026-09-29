import { ProjectView } from "@/versions/option-2/components/projects/ProjectView";
import { projects as englishProjects } from "@/versions/option-2/data/projects";
import { findWithNeighbours } from "@/versions/option-2/i18n/content";
import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return englishProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/option-2/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { projects, t } = await getServerContent();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return { title: t.meta.projectNotFound, robots: { index: false } };

  const title = `${project.title} — ${project.category}`;
  const alternates = alternatesFor(`/projects/${project.slug}`, locale, "option-2");
  return {
    title,
    description: project.description,
    alternates,
    openGraph: {
      type: "article",
      title,
      description: project.description,
      url: alternates.canonical,
      images: [{ url: project.heroImage, width: 2400, height: 1350, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
      images: [project.heroImage],
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/option-2/projects/[slug]">) {
  const { slug } = await params;
  const { projects } = await getServerContent();
  const found = findWithNeighbours(projects, slug);
  if (!found) notFound();

  return <ProjectView project={found.item} next={found.next} previous={found.previous} />;
}
