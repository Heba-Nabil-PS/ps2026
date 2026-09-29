import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { InsightsView } from "@/versions/main/insights/InsightsView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.insights;
  return { title: page.title, description: page.description, alternates: alternatesFor("/insights", await getLocale()) };
}

export default function InsightsPage() {
  return <InsightsView />;
}
