import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { CareersView } from "@/versions/main/careers/CareersView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.careers;
  return { title: page.title, description: page.description, alternates: alternatesFor("/careers", await getLocale()) };
}

export default function CareersPage() {
  return <CareersView />;
}
