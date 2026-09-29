import { PortfolioView } from "@/versions/option-2/components/portfolio/PortfolioView";
import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { portfolio, t } = await getServerContent();
  const { title, description } = t.meta.portfolio;
  const alternates = alternatesFor("/portfolio", locale, "option-2");
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
