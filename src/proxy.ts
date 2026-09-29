import { defaultLocale, hasLocale } from "@/i18n/config";
import { NextResponse, type NextRequest } from "next/server";

/**
 * English keeps its unprefixed URLs ("/services") and is rewritten internally
 * to "/en/services" so every route reads its locale from `[lang]`. Arabic is
 * served at "/ar/…". An explicit "/en/…" URL redirects to the clean one.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (segment === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (hasLocale(segment)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, metadata routes and anything with a file extension (images, audio, fonts…).
  matcher: ["/((?!_next|api|sitemap.xml|robots.txt|icon.svg|favicon.ico|.*\\..*).*)"],
};
