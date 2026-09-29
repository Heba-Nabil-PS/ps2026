import { Clients } from "@/components/home/Clients";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Hero } from "@/components/home/Hero";
import { Reasons } from "@/components/home/Reasons";
import { Services } from "@/components/home/Services";
import { StudioStatement } from "@/components/home/StudioStatement";
import { CallToAction } from "@/components/ui/CallToAction";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

/** The previous home page, kept as an alternative option. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  return {
    title: t.meta.homeOption2,
    alternates: alternatesFor("/home-opt2", locale),
    robots: { index: false, follow: true },
  };
}

export default function HomeOptionTwoPage() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <Reasons />
      <Services />
      <StudioStatement />
      <Clients />
      <CallToAction />
    </>
  );
}
