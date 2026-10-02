import { ProjectGrid } from "@/versions/main/portfolio/ProjectGrid";
import { getServerContent } from "@/versions/main/portfolio/server";
import { getServerCopy } from "@/versions/main/server";
import { ClientLogoSection } from "@/versions/main/sections/ClientLogoSection";
import { PageHero } from "@/versions/main/ui/PageHero";
import { ViewTransition } from "react";

export async function PortfolioView() {
  const { portfolio, t } = await getServerContent();
  const { copy, site } = await getServerCopy();

  return (
    <ViewTransition
      default="none"
      exit={{ "pf-open": "pf-list-exit", default: "none" }}
      enter={{ "pf-back": "pf-list-enter", default: "none" }}
    >
      <div>
        <div data-pf-exit>
          <PageHero
            title={[t.portfolio.title]}
            intro={copy.work.hero.intro}
            footer={
              <div className="mt-14 md:mt-20">
                <ClientLogoSection row clients={site.clients} />
              </div>
            }
          />
        </div>
        <section aria-label={t.projects.projectList} data-pf-exit className="gutter pb-32 pt-6 md:pb-28 md:pt-10">
          <ProjectGrid projects={portfolio} />
        </section>
      </div>
    </ViewTransition>
  );
}
