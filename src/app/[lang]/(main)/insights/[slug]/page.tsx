import { insights } from "@/data/insights";
import { hasLocale } from "@/i18n/config";
import { alternatesFor } from "@/i18n/server";
import { getCopy } from "@/versions/main/copy";
import { insightHref } from "@/versions/main/data/routes";
import { InsightView } from "@/versions/main/insights/InsightView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/insights/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const insight = getCopy(lang).insights.find((item) => item.slug === slug);
  if (!insight) return {};
  return {
    title: insight.title,
    description: insight.lead,
    alternates: alternatesFor(insightHref(slug), lang),
    openGraph: { type: "article", title: insight.title, description: insight.lead, images: [{ url: insight.cover }] },
  };
}

export default async function InsightPage({ params }: PageProps<"/[lang]/insights/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const insight = getCopy(lang).insights.find((item) => item.slug === slug);
  if (!insight) notFound();

  return <InsightView lang={lang} insight={insight} />;
}
