import { ContactCTA } from "@/versions/option-2/components/studio/ContactCTA";
import { EditorialMarquee } from "@/versions/option-2/components/studio/EditorialMarquee";
import { InkStatement } from "@/versions/option-2/components/studio/InkStatement";
import { PageHero } from "@/versions/option-2/components/studio/PageHero";
import { PillButton } from "@/versions/option-2/components/studio/PillButton";
import { ProcessSteps } from "@/versions/option-2/components/studio/ProcessSteps";
import { ServiceStack } from "@/versions/option-2/components/studio/services/ServiceStack";
import { getServerContent } from "@/versions/option-2/i18n/server";

export async function ServicesView() {
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
