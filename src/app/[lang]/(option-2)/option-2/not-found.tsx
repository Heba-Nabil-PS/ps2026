import { NotFoundView } from "@/versions/option-2/components/layout/NotFoundView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerContent();
  return { title: t.meta.notFound, robots: { index: false } };
}

export default function NotFound() {
  return <NotFoundView />;
}
