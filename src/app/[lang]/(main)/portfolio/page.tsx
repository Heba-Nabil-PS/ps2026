import { redirectRetired } from "@/app/[lang]/(main)/retired";

/** Retired route — see src/app/[lang]/retired.ts. */
export default async function Retired({ params }: { params: Promise<{ lang: string; slug?: string }> }) {
  await redirectRetired(params, "/work");
}
