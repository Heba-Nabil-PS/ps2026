import { PortfolioIntro } from "@/versions/option-2/components/portfolio/PortfolioIntro";
import { ProjectGrid } from "@/versions/option-2/components/portfolio/ProjectGrid";
import { getServerContent } from "@/versions/option-2/i18n/server";
import { ViewTransition } from "react";

export async function PortfolioView() {
  const { portfolio, t } = await getServerContent();

  return (
    <ViewTransition
      default="none"
      exit={{ "pf-open": "pf-list-exit", default: "none" }}
      enter={{ "pf-back": "pf-list-enter", default: "none" }}
    >
      <div>
        <PortfolioIntro title={t.portfolio.title} count={portfolio.length} range={t.common.defaultMarket} />
        <section aria-label={t.projects.projectList} data-pf-exit className="gutter pb-32 pt-12 md:pb-28 md:pt-24">
          <ProjectGrid projects={portfolio} />
        </section>
      </div>
    </ViewTransition>
  );
}
