import { getServerCopy } from "@/versions/main/server";
import { NotFoundView } from "@/versions/main/shell/NotFoundView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  return { title: copy.meta.pages.notFound.title, robots: { index: false } };
}

export default function NotFound() {
  return <NotFoundView />;
}
