import { getServerCopy } from "@/versions/main/server";
import { ClientLogoSection } from "@/versions/main/sections/ClientLogoSection";
import { PageHero } from "@/versions/main/ui/PageHero";
import { WorkIndex } from "@/versions/main/work/WorkIndex";
import { Suspense } from "react";

/** Work — objective 01: every case, filterable by discipline, then the clients behind them. */
export async function WorkView() {
  const { copy, site } = await getServerCopy();

  return (
    <>
      <PageHero
        title={copy.work.hero.title}
        intro={copy.work.hero.intro}
        image="/images/projects/shark-tank-egypt/ocean.webp"
        titleClassName="text-headline"
        className="min-h-[60svh]"
        footer={<ClientLogoSection row clients={site.clients} />}
      />
      <Suspense fallback={null}>
        <WorkIndex />
      </Suspense>
    </>
  );
}
