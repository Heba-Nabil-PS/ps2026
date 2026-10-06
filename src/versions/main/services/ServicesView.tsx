import { getServerCopy } from "@/versions/main/server";
import { ServiceStack } from "@/versions/main/services/ServiceStack";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";

/** Services — the deck's six disciplines, then one call to action. */
export async function ServicesView() {
  const { copy } = await getServerCopy();
  const page = copy.services;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/services/services-banner.webp" raw />
      <ServiceStack />
      <ClosingCta
        label={page.closing.label}
        title={page.closing.title}
        body={page.closing.body}
        primary={{ label: page.closing.primary, href: "/start" }}
        secondary={{ label: page.closing.secondary, href: "/portfolio" }}
      />
    </>
  );
}
