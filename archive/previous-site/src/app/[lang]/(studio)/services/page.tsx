import { ContactCTA } from "@/components/studio/ContactCTA";
import { EditorialMarquee } from "@/components/studio/EditorialMarquee";
import { InkStatement } from "@/components/studio/InkStatement";
import { PageHero } from "@/components/studio/PageHero";
import { PillButton } from "@/components/studio/PillButton";
import { ProcessSteps } from "@/components/studio/ProcessSteps";
import { ServiceStack } from "@/components/studio/services/ServiceStack";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.services;
  const alternates = alternatesFor("/services", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function ServicesPage() {
  const { servicesPage } = await getServerContent();
  const { hero, statement, process, cta } = servicesPage;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} intro={hero.intro} meta={hero.meta} />
      <InkStatement label={statement.label} action={<PillButton href="#disciplines">{statement.action}</PillButton>}>
        {statement.text}
      </InkStatement>
      <ServiceStack />
      <EditorialMarquee />
      <ProcessSteps label={process.label} title={process.title} steps={process.steps} />
      <ContactCTA label={cta.label} title={cta.title} button={cta.button} href="/contact" />
    </>
  );
}
