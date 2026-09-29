import { Capabilities } from "@/versions/option-2/components/studio/Capabilities";
import { ContactCTA } from "@/versions/option-2/components/studio/ContactCTA";
import { EditorialMarquee } from "@/versions/option-2/components/studio/EditorialMarquee";
import { FeaturedWork } from "@/versions/option-2/components/studio/FeaturedWork";
import { StudioHero } from "@/versions/option-2/components/studio/StudioHero";
import { StudioIntro } from "@/versions/option-2/components/studio/StudioIntro";

/** Option 2's home: the immersive studio page. */
export function StudioHomeView() {
  return (
    <>
      <StudioHero />
      <StudioIntro />
      <FeaturedWork />
      <EditorialMarquee />
      <Capabilities />
      <ContactCTA />
    </>
  );
}
