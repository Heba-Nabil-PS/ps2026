import { alternatesFor, getLocale } from "@/i18n/server";
import { PortfolioView } from "@/versions/main/portfolio/PortfolioView";
import { getServerContent } from "@/versions/main/portfolio/server";
import type { Metadata } from "next";

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

export default function PortfolioPage() {
  return <PortfolioView />;
}
