import { industries } from "@/data/industries";
import { hasLocale } from "@/i18n/config";
import { alternatesFor } from "@/i18n/server";
import { getCopy } from "@/versions/main/copy";
import { industryHref } from "@/versions/main/data/routes";
import { IndustryView } from "@/versions/main/industries/IndustryView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/industries/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const industry = getCopy(lang).industries.find((item) => item.slug === slug);
  if (!industry) return {};
  return {
    title: industry.title,
    description: industry.intro,
    alternates: alternatesFor(industryHref(slug), lang),
    openGraph: { title: industry.title, description: industry.intro, images: [{ url: industry.image }] },
  };
}

export default async function IndustryPage({ params }: PageProps<"/[lang]/industries/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const list = getCopy(lang).industries;
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  return <IndustryView lang={lang} industry={list[index]} />;
}
