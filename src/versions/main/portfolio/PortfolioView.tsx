import { PortfolioIntro } from "@/versions/main/portfolio/PortfolioIntro";
import { ProjectGrid } from "@/versions/main/portfolio/ProjectGrid";
import { getServerContent } from "@/versions/main/portfolio/server";
import { getServerCopy } from "@/versions/main/server";
import { ClientLogoSection } from "@/versions/main/sections/ClientLogoSection";
import { ViewTransition } from "react";

export async function PortfolioView() {
  const { portfolio, t } = await getServerContent();
  const { site } = await getServerCopy();

  return (
    <ViewTransition
      default="none"
      exit={{ "pf-open": "pf-list-exit", default: "none" }}
      enter={{ "pf-back": "pf-list-enter", default: "none" }}
    >
      <div>
        <PortfolioIntro
          title={t.portfolio.title}
          footer={<ClientLogoSection row clients={site.clients} />}
        />
        <section aria-label={t.projects.projectList} data-pf-exit className="gutter pb-32 pt-12 md:pb-28 md:pt-24">
          <ProjectGrid projects={portfolio} />
        </section>
      </div>
    </ViewTransition>
  );
}
