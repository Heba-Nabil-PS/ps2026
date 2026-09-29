import { ContactCTA } from "@/components/studio/ContactCTA";
import { TeamCrew } from "@/components/studio/team/TeamCrew";
import { TeamDisciplines } from "@/components/studio/team/TeamDisciplines";
import { TeamHero } from "@/components/studio/team/TeamHero";
import { TeamLead } from "@/components/studio/team/TeamLead";
import { TeamLife } from "@/components/studio/team/TeamLife";
import { TeamManifesto } from "@/components/studio/team/TeamManifesto";
import { localizeHref } from "@/i18n/config";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.team;
  const alternates = alternatesFor("/team", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

/**
 * The team, told as seven scenes: opening → manifesto (pinned type) → the lead →
 * the crew → disciplines → studio life (pinned horizontal) → join us.
 * Motion notes live in docs/team-motion-system.md.
 */
export default async function TeamPage() {
  const locale = await getLocale();
  const { teamPage } = await getServerContent();
  const { cta } = teamPage;

  return (
    <>
      <TeamHero />
      <TeamManifesto />
      <TeamLead />
      <TeamCrew />
      <TeamDisciplines />
      <TeamLife />
      <ContactCTA label={cta.label} title={cta.title} button={cta.button} href={localizeHref("/careers", locale)} />
    </>
  );
}
