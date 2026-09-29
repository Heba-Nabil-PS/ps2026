import { alternatesFor, getLocale } from "@/i18n/server";
import { TeamView } from "@/versions/option-2/components/studio/team/TeamView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.team;
  const alternates = alternatesFor("/team", locale, "option-2");
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default function TeamPage() {
  return <TeamView />;
}
