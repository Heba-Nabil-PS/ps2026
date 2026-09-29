import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { IndustriesView } from "@/versions/main/industries/IndustriesView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.industries;
  return { title: page.title, description: page.description, alternates: alternatesFor("/industries", await getLocale()) };
}

export default function IndustriesPage() {
  return <IndustriesView />;
}
