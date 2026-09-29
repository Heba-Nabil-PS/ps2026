import { alternatesFor, getLocale } from "@/i18n/server";
import { StudioHomeView } from "@/versions/option-2/components/studio/StudioHomeView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternatesFor("/", await getLocale(), "option-2") };
}

export default function HomePage() {
  return <StudioHomeView />;
}
