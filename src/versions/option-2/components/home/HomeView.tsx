import { Clients } from "@/versions/option-2/components/home/Clients";
import { FeaturedProjects } from "@/versions/option-2/components/home/FeaturedProjects";
import { Hero } from "@/versions/option-2/components/home/Hero";
import { Reasons } from "@/versions/option-2/components/home/Reasons";
import { Services } from "@/versions/option-2/components/home/Services";
import { StudioStatement } from "@/versions/option-2/components/home/StudioStatement";
import { CallToAction } from "@/versions/option-2/components/ui/CallToAction";

/** The previous home page, kept as an alternative option. */
export function HomeView() {
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
