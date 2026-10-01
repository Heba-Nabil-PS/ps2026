import { hasLocale } from "@/i18n/config";
import { alternatesFor } from "@/i18n/server";
import { findRole, roleSlugs } from "@/versions/main/careers/roles";
import { JobView } from "@/versions/main/careers/JobView";
import { roleHref } from "@/versions/main/data/routes";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return roleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/careers/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const role = findRole(lang, slug);
  if (!role) return {};
  return { title: role.title, description: role.summary, alternates: alternatesFor(roleHref(slug), lang) };
}

export default async function RolePage({ params }: PageProps<"/[lang]/careers/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const role = findRole(lang, slug);
  if (!role) notFound();

  return <JobView lang={lang} role={role} />;
}
