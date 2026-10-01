import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { CareersLanding } from "@/versions/main/careers/CareersLanding";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.careers;
  return { title: page.title, description: page.description, alternates: alternatesFor("/careers", await getLocale()) };
}

export default function CareersPage() {
  return <CareersLanding />;
}
