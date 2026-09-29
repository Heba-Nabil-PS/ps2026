import { getServerCopy } from "@/versions/main/server";
import { ClientsWall } from "@/versions/main/sections/ClientsWall";
import { PageHero } from "@/versions/main/ui/PageHero";
import { WorkIndex } from "@/versions/main/work/WorkIndex";
import { Suspense } from "react";

/** Work — objective 01: every case, filterable by discipline, then the clients behind them. */
export async function WorkView() {
  const { copy, site, work } = await getServerCopy();

  return (
    <>
      <PageHero label={copy.work.hero.label} title={copy.work.hero.title} intro={copy.work.hero.intro} image="/images/projects/shark-tank-egypt/ocean.webp">
        <p className="text-label text-subtle">
          <span className="text-sky tabular-nums">{String(work.length).padStart(2, "0")}</span> — {copy.meta.pages.work.title}
        </p>
      </PageHero>
      <Suspense fallback={null}>
        <WorkIndex />
      </Suspense>
      <ClientsWall label={copy.work.clients.label} title={copy.work.clients.title} clients={site.clients} />
    </>
  );
}
