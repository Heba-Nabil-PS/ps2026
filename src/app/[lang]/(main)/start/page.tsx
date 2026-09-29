import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { StartView } from "@/versions/main/start/StartView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.start;
  return { title: page.title, description: page.description, alternates: alternatesFor("/start", await getLocale()) };
}

export default function StartPage() {
  return <StartView />;
}
