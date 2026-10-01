import { portfolio as englishPortfolio, portfolioHref } from "@/data/portfolio";
import { alternatesFor, getLocale } from "@/i18n/server";
import { PortfolioProjectView } from "@/versions/main/portfolio/PortfolioProjectView";
import { getServerContent } from "@/versions/main/portfolio/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  const index = portfolio.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();
  const total = portfolio.length;

  return (
    <PortfolioProjectView project={portfolio[index]} next={portfolio[(index + 1) % total]} previous={portfolio[(index - 1 + total) % total]} />
  );
}
