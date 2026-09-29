import { en } from "@/versions/main/content/en";
import { hasLocale } from "@/i18n/config";
import { alternatesFor } from "@/i18n/server";
import { getCopy } from "@/versions/main/copy";
import { serviceHref } from "@/versions/main/data/routes";
import { ServiceView } from "@/versions/main/services/ServiceView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return en.services.list.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const service = getCopy(lang).copy.services.list.find((item) => item.slug === slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: alternatesFor(serviceHref(slug), lang),
    openGraph: { title: service.title, description: service.summary, images: [{ url: service.image }] },
  };
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const index = getCopy(lang).copy.services.list.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  return <ServiceView lang={lang} index={index} />;
}
