import { localizeHref } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { ContactCTA } from "@/versions/option-2/components/studio/ContactCTA";
import { TeamCrew } from "@/versions/option-2/components/studio/team/TeamCrew";
import { TeamDisciplines } from "@/versions/option-2/components/studio/team/TeamDisciplines";
import { TeamHero } from "@/versions/option-2/components/studio/team/TeamHero";
import { TeamLead } from "@/versions/option-2/components/studio/team/TeamLead";
import { TeamLife } from "@/versions/option-2/components/studio/team/TeamLife";
import { TeamManifesto } from "@/versions/option-2/components/studio/team/TeamManifesto";
import { getServerContent } from "@/versions/option-2/i18n/server";

/**
 * The team, told as seven scenes: opening → manifesto (pinned type) → the lead →
 * the crew → disciplines → studio life (pinned horizontal) → join us.
 * Motion notes live in docs/team-motion-system.md.
 */
export async function TeamView() {
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
