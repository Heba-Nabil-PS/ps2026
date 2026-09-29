import { getServerCopy } from "@/versions/main/server";
import { BriefForm } from "@/versions/main/start/BriefForm";
import { PageHero } from "@/versions/main/ui/PageHero";
import { Suspense } from "react";

/** Start a project — where every "Start a project" leads: a five-step brief. /start?service=<slug> preselects a discipline. */
export async function StartView() {
  const { copy } = await getServerCopy();
  const page = copy.start;

  return (
    <>
      <PageHero label={page.hero.label} title={page.hero.title} intro={page.hero.intro} image="/images/site/contact.webp" className="min-h-[70svh]" />
      <Suspense fallback={null}>
        <BriefForm />
      </Suspense>
    </>
  );
}
