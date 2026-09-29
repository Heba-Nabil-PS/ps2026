import { alternatesFor, getLocale } from "@/i18n/server";
import { HomeView } from "@/versions/option-2/components/home/HomeView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

/** The previous home page, kept as an alternative option. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  return {
    title: t.meta.homeOption2,
    alternates: alternatesFor("/home-opt2", locale, "option-2"),
    robots: { index: false, follow: true },
  };
}

export default function HomeOptionTwoPage() {
  return <HomeView />;
}
