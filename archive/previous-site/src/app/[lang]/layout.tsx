import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/navigation/Navbar";
import { hasLocale, localeDirection, locales } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { alternatesFor } from "@/i18n/server";
import { siteConfig } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter_Tight, Noto_Naskh_Arabic, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

/* Poppins carries the identity's accent voice — the logo wordmark and the
   italic headline pairing on the "Connected flow" key visual. */
const accent = Poppins({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Arabic faces: IBM Plex Sans Arabic for the body and display, Noto Naskh
   Arabic standing in for the italic accent (Arabic has no true italic).
   Not preloaded, so English pages never download them. */
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const arabicAccent = Noto_Naskh_Arabic({
  variable: "--font-arabic-accent",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { site, t } = getContent(lang);
  const title = `${site.name} — ${t.meta.siteTitle}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s — ${site.name}` },
    description: site.description,
    applicationName: site.name,
    keywords: [...t.meta.keywords],
    alternates: alternatesFor("/", lang),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: lang === "ar" ? "ar_AR" : "en_US",
      title,
      description: site.description,
      url: alternatesFor("/", lang).canonical,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: site.description,
      images: ["/images/og.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#122443",
  colorScheme: "dark",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { t } = getContent(lang);

  return (
    <html
      lang={lang}
      dir={localeDirection(lang)}
      className={`${display.variable} ${accent.variable} ${arabic.variable} ${arabicAccent.variable} antialiased`}
    >
      <body>
        <a
          href="#main"
          className="text-label fixed start-4 top-4 z-[100] -translate-y-24 bg-fg px-4 py-3 text-bg focus:translate-y-0"
        >
          {t.common.skipToContent}
        </a>
        <LocaleProvider locale={lang}>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </LocaleProvider>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
