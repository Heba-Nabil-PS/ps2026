import { CareersValues } from "@/versions/option-2/components/studio/careers/CareersValues";
import { OpenRoles } from "@/versions/option-2/components/studio/careers/OpenRoles";
import { ContactCTA } from "@/versions/option-2/components/studio/ContactCTA";
import { InkStatement } from "@/versions/option-2/components/studio/InkStatement";
import { PageHero } from "@/versions/option-2/components/studio/PageHero";
import { PillButton } from "@/versions/option-2/components/studio/PillButton";
import { ProcessSteps } from "@/versions/option-2/components/studio/ProcessSteps";
import { getServerContent } from "@/versions/option-2/i18n/server";

export async function CareersView() {
  const { careersPage, site } = await getServerContent();
  const { hero, statement, process, cta } = careersPage;
  const openApplication = `mailto:${site.email}?subject=${encodeURIComponent(cta.subject)}`;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} meta={hero.meta} />
      <InkStatement label={statement.label} action={<PillButton href="#roles">{statement.action}</PillButton>}>
        {statement.text}
      </InkStatement>
      <CareersValues />
      <OpenRoles />
      <ProcessSteps label={process.label} title={process.title} steps={process.steps} id="hiring-title" />
      <ContactCTA label={cta.label} title={cta.title} button={cta.button} href={openApplication} />
    </>
  );
}
