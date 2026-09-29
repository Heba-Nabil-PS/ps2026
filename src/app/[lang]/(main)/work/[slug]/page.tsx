import { portfolio } from "@/data/portfolio";
import { hasLocale } from "@/i18n/config";
import { alternatesFor } from "@/i18n/server";
import { findCase, getCopy } from "@/versions/main/copy";
import { workHref } from "@/versions/main/data/work";
import { CaseView } from "@/versions/main/work/CaseView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return portfolio.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const found = findCase(getCopy(lang).work, slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: project.title,
    description: project.description,
    alternates: alternatesFor(workHref(slug), lang),
    openGraph: { title: project.title, description: project.description, images: [{ url: project.heroImage }] },
  };
}

export default async function CasePage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const found = findCase(getCopy(lang).work, slug);
  if (!found) notFound();

  return <CaseView lang={lang} found={found} />;
}
