import { CareersValues } from "@/components/studio/careers/CareersValues";
import { OpenRoles } from "@/components/studio/careers/OpenRoles";
import { ContactCTA } from "@/components/studio/ContactCTA";
import { InkStatement } from "@/components/studio/InkStatement";
import { PageHero } from "@/components/studio/PageHero";
import { PillButton } from "@/components/studio/PillButton";
import { ProcessSteps } from "@/components/studio/ProcessSteps";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.careers;
  const alternates = alternatesFor("/careers", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function CareersPage() {
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
