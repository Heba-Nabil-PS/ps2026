import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { WorkView } from "@/versions/main/work/WorkView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.work;
  return { title: page.title, description: page.description, alternates: alternatesFor("/work", await getLocale()) };
}

export default function WorkPage() {
  return <WorkView />;
}
