import { getServerCopy } from "@/versions/main/server";
import { BriefForm } from "@/versions/main/start/BriefForm";
import { ProcessSteps } from "@/versions/main/start/ProcessSteps";
import { PageHero } from "@/versions/main/ui/PageHero";
import { Suspense } from "react";

/** Start a project — where every "Start a project" leads: a single-form brief beside our process, drawn in step by step. /start?service=<slug> preselects a discipline. */
export async function StartView() {
  const { copy, site } = await getServerCopy();
  const page = copy.start;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/site/contact.webp" className="md:min-h-[70svh]" />
      <Suspense fallback={null}>
        <BriefForm aside={<ProcessSteps steps={site.process} />} />
      </Suspense>
    </>
  );
}
