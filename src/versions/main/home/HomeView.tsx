import { getServerCopy } from "@/versions/main/server";
import { Hero } from "@/versions/main/home/Hero";
import { IntroAnimation } from "@/versions/main/intro/IntroAnimation";
import { IndustriesPreview } from "@/versions/main/home/IndustriesPreview";
import { InsightsPreview } from "@/versions/main/home/InsightsPreview";
import { Numbers } from "@/versions/main/home/Numbers";
import { Positioning } from "@/versions/main/home/Positioning";
import { SelectedWork } from "@/versions/main/home/SelectedWork";
import { ServicesIndex } from "@/versions/main/home/ServicesIndex";
import { Testimonials } from "@/versions/main/home/Testimonials";
import { ClientsWall } from "@/versions/main/sections/ClientsWall";
import { ProcessCards } from "@/versions/main/sections/ProcessCards";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";

/**
 * Home — the intro (every full load of the home page) → first impression → positioning → proof (work, then the numbers it
 * delivered) → capabilities → industries → trust (clients, then their words)
 * → how we work → insights → conversion.
 * See docs/website-direction.md §4.
 */
export async function HomeView() {
  const { copy, site } = await getServerCopy();
  const home = copy.home;

  return (
    <>
      <IntroAnimation />
      <Hero />
      <Positioning />
      <SelectedWork />
      <Numbers />
      <ServicesIndex />
      <IndustriesPreview />
      <ClientsWall label={home.clients.label} title={home.clients.title} intro={home.clients.intro} clients={site.clients} />
      <Testimonials />
      <ProcessCards label={home.process.label} title={home.process.title} steps={site.process} />
      <InsightsPreview />
      <ClosingCta
        label={home.closing.label}
        title={home.closing.title}
        body={home.closing.body}
        primary={{ label: home.closing.primary, href: "/start" }}
        secondary={{ label: home.closing.secondary, href: "/careers" }}
      />
    </>
  );
}
