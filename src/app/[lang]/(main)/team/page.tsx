import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { TeamView } from "@/versions/main/team/TeamView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.team;
  return { title: page.title, description: page.description, alternates: alternatesFor("/team", await getLocale()) };
}

export default function TeamPage() {
  return <TeamView />;
}
