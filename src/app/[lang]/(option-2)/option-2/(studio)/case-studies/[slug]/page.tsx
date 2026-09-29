import { CaseStudyView } from "@/versions/option-2/components/studio/case-studies/CaseStudyView";
import { caseStudies, caseStudyHref } from "@/versions/option-2/data/caseStudies";
import { findWithNeighbours } from "@/versions/option-2/i18n/content";
import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/option-2/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { portfolio, t } = await getServerContent();
  const project = portfolio.find((item) => item.slug === slug);
  if (!project) return { title: t.meta.caseStudyNotFound, robots: { index: false } };

  const title = `${project.title} — ${project.category}`;
  const alternates = alternatesFor(caseStudyHref(project.slug), locale, "option-2");
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

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/option-2/case-studies/[slug]">) {
  const { slug } = await params;
  const { portfolio } = await getServerContent();
  const found = findWithNeighbours(portfolio, slug);
  if (!found) notFound();

  return <CaseStudyView project={found.item} next={found.next} previous={found.previous} />;
}
