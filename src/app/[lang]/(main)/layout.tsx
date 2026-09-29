/**
 * Root layout of the main (current) design. Other design versions have their own
 * root layout (see src/versions/registry.ts), so switching versions is a full page load.
 */
import { hasLocale, localeDirection, locales } from "@/i18n/config";
import { getCopy } from "@/versions/main/copy";
import { alternatesFor } from "@/i18n/server";
import { siteConfig } from "@/lib/site";
import { AppShell } from "@/versions/main/shell/AppShell";
import type { Metadata, Viewport } from "next";
import { Anybody, IBM_Plex_Sans_Arabic, Inter_Tight } from "next/font/google";
import { notFound } from "next/navigation";
import "@/versions/main/styles.css";

/* Display: Anybody's width axis (50–150) stands in for Gero Bold's stretched
   cut and lets headlines animate from condensed to extended. Gero wins
   automatically when installed (see globals.css). */
const stretch = Anybody({
  variable: "--font-stretch",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/* Text: Helvetica Neue per the deck, where installed; Inter Tight otherwise. */
const text = Inter_Tight({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

/* Arabic, not preloaded so English pages never download it. */
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { copy, site } = getCopy(lang);
  const title = `${site.name} — ${copy.meta.siteTitle}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s — ${site.name}` },
    description: copy.meta.description,
    applicationName: site.name,
    keywords: [...copy.meta.keywords],
    alternates: alternatesFor("/", lang),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: lang === "ar" ? "ar_AR" : "en_US",
      title,
      description: copy.meta.description,
      url: alternatesFor("/", lang).canonical,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title, description: copy.meta.description, images: ["/images/og.jpg"] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#07121f",
  colorScheme: "dark",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { copy, site } = getCopy(lang);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    email: site.email,
    description: copy.meta.description,
    address: site.offices.map((office) => ({ "@type": "PostalAddress", addressLocality: office.city, streetAddress: office.address })),
  };

  return (
    <html lang={lang} dir={localeDirection(lang)} className={`${stretch.variable} ${text.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        {/* Reveal animations hide content only once we know scripts run. Safety net: if the
            app has not started within 5 s (a script failed to load), drop the flag so every
            section shows as plain content instead of staying hidden.
            It has already run by the time React hydrates, and browser extensions or the dev
            overlay can empty inline scripts in the DOM, so React must not compare its contents.
            It also decides, before first paint, whether the home intro plays: on every full load
            of the home page, never with reduced motion (the "intro-play" class is named in
            versions/main/intro/intro-signal.ts). */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');try{var p=location.pathname.replace(/\\/+$/,'');if((p===''||p==='/ar')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-play')}catch(e){}setTimeout(function(){if(!window.__psReady)d.classList.remove('js','intro-play')},5000)",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </head>
      <body>
        <AppShell locale={lang}>{children}</AppShell>
      </body>
    </html>
  );
}
