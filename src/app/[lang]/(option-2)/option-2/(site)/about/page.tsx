import { alternatesFor, getLocale } from "@/i18n/server";
import { AboutView } from "@/versions/option-2/components/about/AboutView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.about;
  const alternates = alternatesFor("/about", locale, "option-2");
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default function AboutPage() {
  return <AboutView />;
}
