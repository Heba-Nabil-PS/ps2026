/**
 * Content for the /team page.
 *
 * People come from `siteConfig.team`; this file adds the page copy and the
 * imagery each scene uses. Crew `image` values are placeholders taken from the
 * studio's own work — swap in real portraits (portrait 4:5 works best) and the
 * cards, hover motion and reveals keep working unchanged.
 */

import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

const crewImages = [
  "/images/projects/sinclair-aesthetics/hero.webp",
  "/images/projects/yumochi/hero.webp",
  "/images/projects/shark-tank-egypt/hero.webp",
  "/images/projects/texas-chicken/hero.webp",
  "/images/projects/physiowell/hero.webp",
] as const;

export const teamPage = {
  hero: {
    label: "The team",
    /** One entry per line; the second line is set in the italic accent face. */
    title: ["People who", "move", "brands forward"],
    intro:
      "Strategists, designers, engineers, writers and producers under one roof in Alexandria and Dubai — the same people from the first idea to the last pixel.",
    meta: siteConfig.location,
    action: "Meet the leads",
    hello: "Say hello",
    /** Photos dealt into the hero's card stack. */
    cards: ["/images/site/who-we-are.webp", "/images/site/ceo.webp", "/images/site/why.webp"],
  },
  manifesto: {
    label: "How we are built",
    /** Each line moves on its own path while the section is pinned. */
    lines: ["One room.", "Every discipline.", "No hand-offs."],
    images: ["/images/site/cover.webp", "/images/site/sky.webp"],
  },
  lead: {
    label: "Leadership",
    quote:
      "We built PSdigital so the people who win the brief are the same people who ship it. Nothing gets lost when nobody has to hand anything over.",
    alt: "Portrait of the PSdigital Chief Executive Officer",
  },
  crew: {
    label: "The leads",
    title: ["Specialists,", "not generalists"],
    intro: "The people who set the bar in each discipline and review every piece of work before it leaves the studio.",
    images: crewImages,
    cursor: "Say hi",
    /** Closing card of the grid: the rest of the studio, linking to /careers. */
    more: { value: siteConfig.stats[0].value, title: "and more specialists behind them", action: "Join them" },
  },
  disciplines: {
    label: "Disciplines",
    title: ["Seven crafts,", "one team"],
    items: [
      { title: "Strategy", body: "Audience, positioning and the point of view behind every brief.", image: "/images/projects/texas-chicken/web-01.webp" },
      { title: "Design", body: "Identity, campaign and product design, bilingual from day one.", image: "/images/projects/sinclair-aesthetics/showcase.webp" },
      { title: "Motion", body: "2D, 3D and film that make brands move the way they sound.", image: "/images/projects/m-squared/posters.webp" },
      { title: "Content", body: "Copy, social and production for brands that publish every day.", image: "/images/projects/yumochi/post-02.webp" },
      { title: "Development", body: "Websites, ordering platforms and kiosks, engineered in-house.", image: "/images/projects/shark-tank-egypt/web-desktop.webp" },
      { title: "UI/UX", body: "Research, flows and design systems that scale across markets.", image: "/images/projects/million-pound-menu/web-mobile.webp" },
      { title: "Performance", body: "Paid media and testing measured against real numbers.", image: "/images/projects/physiowell/mood.webp" },
    ],
  },
  life: {
    label: "Studio life",
    title: ["Two cities,", "one flow"],
    images: [
      { src: "/images/site/who-we-are.webp", alt: "The team in the Alexandria studio" },
      { src: "/images/projects/sinclair-aesthetics/event-02.webp", alt: "On set at a Sinclair event" },
      { src: "/images/site/why.webp", alt: "A client workshop" },
      { src: "/images/projects/shark-tank-egypt/ocean.webp", alt: "Shark Tank Egypt key visual" },
      { src: "/images/projects/sinclair-aesthetics/event-04.webp", alt: "Production day" },
    ],
  },
  cta: {
    label: "Want a seat in the room?",
    title: ["Join the", "crew"],
    button: "Open roles",
  },
} as const;

export type TeamPage = Localized<typeof teamPage>;
