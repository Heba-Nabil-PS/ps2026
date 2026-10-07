import { getServerCopy } from "@/versions/main/server";
import { JobsBoard } from "@/versions/main/careers/JobsBoard";
import { WhyJoin } from "@/versions/main/careers/WhyJoin";
import { PageHero } from "@/versions/main/ui/PageHero";

/**
 * Careers — objective 03. The open roles come first, straight under the hero;
 * each opens its own page with the full brief and the application form.
 * Life at the studio follows for those who want to read on.
 */
export async function CareersLanding() {
  const { copy } = await getServerCopy();
  const page = copy.careers;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/careers/careers-banner.webp" imageClassName="object-[72%_center] md:object-center" raw />

      <JobsBoard />

      <WhyJoin label={page.values.label} title={page.values.title} intro={page.values.intro} items={page.values.items} />
    </>
  );
}
