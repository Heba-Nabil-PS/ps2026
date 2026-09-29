import { alternatesFor, getLocale } from "@/i18n/server";
import { HomeView } from "@/versions/main/home/HomeView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternatesFor("/", await getLocale()) };
}

export default function HomePage() {
  return <HomeView />;
}
