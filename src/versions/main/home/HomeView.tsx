import { getServerCopy } from "@/versions/main/server";
import { HeroSection } from "@/versions/main/home/HeroSection";
import { LogoThread } from "@/versions/main/home/LogoThread";
import { StretchSectionTitles } from "@/versions/main/motion/StretchHeading";
import { InsightsPreview } from "@/versions/main/home/InsightsPreview";
import { Numbers } from "@/versions/main/home/Numbers";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Positioning } from "@/versions/main/home/Positioning";
import { SelectedWork } from "@/versions/main/home/SelectedWork";
import { ServicesIndex } from "@/versions/main/home/ServicesIndex";
import { Showreel } from "@/versions/main/home/Showreel";
import { Testimonials } from "@/versions/main/home/Testimonials";
import { ClientLogoSection } from "@/versions/main/sections/ClientLogoSection";

/**
 * Home — first impression (the loading intro, see AppShell, lands its logo on the hero's mark) → positioning → showreel → proof (work, then the numbers it
 * delivered) → capabilities → trust (client words) → insights → conversion.
 * See docs/website-direction.md §4.
 */
export async function HomeView() {
  const { copy, site } = await getServerCopy();
  const home = copy.home;

  return (
    <StretchSectionTitles>
      <LogoThread />
      <HeroSection />
      {/* The client marks in a single drifting row under the hero, as on the projects page. */}
      <ClientLogoSection row clients={site.clients} />
      <Positioning />
      <Showreel {...home.showreel} />
      <SelectedWork />
      <Numbers />
      <ServicesIndex />
      <Testimonials />
      <InsightsPreview />
      <ClosingCta
        label={home.closing.label}
        title={home.closing.title}
        body={home.closing.body}
        primary={{ label: home.closing.primary, href: "/start" }}
        secondary={{ label: home.closing.secondary, href: "/careers" }}
        bleed={false}
      />
    </StretchSectionTitles>
  );
}
