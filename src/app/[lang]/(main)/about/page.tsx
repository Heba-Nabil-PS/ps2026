import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { AboutView } from "@/versions/main/about/AboutView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.about;
  return { title: page.title, description: page.description, alternates: alternatesFor("/about", await getLocale()) };
}

export default function AboutPage() {
  return <AboutView />;
}
