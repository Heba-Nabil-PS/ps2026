import { PortfolioIntro } from "@/components/portfolio/PortfolioIntro";
import { ProjectGrid } from "@/components/portfolio/ProjectGrid";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";
import { ViewTransition } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { portfolio, t } = await getServerContent();
  const { title, description } = t.meta.portfolio;
  const alternates = alternatesFor("/portfolio", locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      images: [{ url: portfolio[0].heroImage, width: 2400, height: 1500, alt: portfolio[0].title }],
    },
  };
}

export default async function PortfolioPage() {
  const { portfolio, t } = await getServerContent();

  return (
    <ViewTransition
      default="none"
      exit={{ "pf-open": "pf-list-exit", default: "none" }}
      enter={{ "pf-back": "pf-list-enter", default: "none" }}
    >
      <div>
        <PortfolioIntro title={t.portfolio.title} count={portfolio.length} range={t.common.defaultMarket} />
        <section aria-label={t.projects.projectList} data-pf-exit className="gutter pb-32 pt-12 md:pb-48 md:pt-24">
          <ProjectGrid projects={portfolio} />
        </section>
      </div>
    </ViewTransition>
  );
}
