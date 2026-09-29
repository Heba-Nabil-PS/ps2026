import { hasLocale, localizeHref } from "@/i18n/config";
import { permanentRedirect } from "next/navigation";

/**
 * Routes from the previous site (case studies, portfolio, projects,
 * home-opt2) now live under /work. next.config.ts redirects them before they
 * render; these stubs keep the old files buildable as a safety net.
 * The original pages are preserved in archive/previous-site/.
 */
export async function redirectRetired(params: Promise<{ lang: string; slug?: string }>, base: "/work" | "/") {
  const { lang, slug } = await params;
  const path = base === "/work" && slug ? `/work/${slug}` : base;
  permanentRedirect(hasLocale(lang) ? localizeHref(path, lang) : path);
}
