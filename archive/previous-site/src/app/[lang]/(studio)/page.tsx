import { Capabilities } from "@/components/studio/Capabilities";
import { ContactCTA } from "@/components/studio/ContactCTA";
import { EditorialMarquee } from "@/components/studio/EditorialMarquee";
import { FeaturedWork } from "@/components/studio/FeaturedWork";
import { StudioHero } from "@/components/studio/StudioHero";
import { StudioIntro } from "@/components/studio/StudioIntro";
import { alternatesFor, getLocale } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternatesFor("/", await getLocale()) };
}

export default function HomePage() {
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
