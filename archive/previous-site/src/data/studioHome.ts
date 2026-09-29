/**
 * Content for the immersive home page ("/").
 *
 * Every string, image and video used on the home lives here, so the page can be
 * re-skinned without touching components. Media paths are plain strings: drop a
 * file in /public and point to it. Any `video` field is optional — when it is
 * missing the component falls back to the `poster`/image.
 */

import { portfolio, portfolioHref, type PortfolioProject } from "@/data/portfolio";
import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export type StudioMedia = {
  /** Image shown while loading, and permanently when there is no video. */
  image: string;
  alt: string;
  /** Optional looping, muted background video (webm or mp4). */
  video?: string;
};

export type FeaturedProject = {
  slug: string;
  href: string;
  title: string;
  category: string;
  market?: string;
  media: StudioMedia;
  /** Card proportion in the staggered grid. */
  shape: "landscape" | "portrait";
};

const FEATURED_SLUGS = [
  "texas-chicken",
  "sinclair-aesthetics",
  "shark-tank-egypt",
  "physiowell",
  "million-riyal-menu",
  "eea",
] as const;

/** Resolves the featured slugs against a (localized) portfolio list. */
export function buildFeaturedProjects(list: PortfolioProject[]): FeaturedProject[] {
  return FEATURED_SLUGS.flatMap((slug, index) => {
    const project = list.find((item) => item.slug === slug);
    if (!project) return [];
    return [
      {
        slug,
        href: portfolioHref(slug),
        title: project.title,
        category: project.category,
        market: project.market,
        media: { image: project.heroImage, alt: `${project.title} — ${project.category}`, video: project.hoverVideo },
        shape: index % 3 === 0 ? "landscape" : "portrait",
      },
    ];
  });
}

export const featuredProjects = buildFeaturedProjects(portfolio);

export const studioHome = {
  hero: {
    /** One entry per line of the display headline. */
    title: ["Connected flow,", "infinite", "possibilities"],
    intro:
      "PSdigital is a full-service digital studio for MENA and beyond. We blend strategy, design, technology and motion into brands people remember.",
    scrollHint: "Scroll to explore",
    location: siteConfig.location,
  },

  intro: {
    label: "The studio",
    statement:
      "We are a team of strategists, designers, engineers and storytellers who build brands, platforms and campaigns end to end — from the first idea to the last pixel, all under one roof.",
    cta: { label: "About the agency", href: "/about" },
  },

  reel: {
    label: "Showreel",
    year: "2026",
    /** Add a video path here (e.g. "/videos/reel.webm") to replace the slideshow. */
    video: undefined as string | undefined,
    slides: [
      { image: "/images/projects/texas-chicken/hero.webp", alt: "Texas Chicken campaign" },
      { image: "/images/projects/sinclair-aesthetics/hero.webp", alt: "Sinclair Aesthetics campaign" },
      { image: "/images/projects/shark-tank-egypt/hero.webp", alt: "Shark Tank Egypt" },
      { image: "/images/projects/physiowell/hero.webp", alt: "Physiowell campaign" },
    ] satisfies StudioMedia[],
  },

  work: {
    title: ["Featured", "work"],
    body: "A selection of partnerships where strategy, craft and performance meet — shipped for brands across sixteen markets.",
    cta: { label: "See all projects", href: "/portfolio" },
  },

  marquee: {
    rows: [
      siteConfig.services.slice(0, 3).map((service) => service.title),
      siteConfig.services.slice(3).map((service) => service.title),
    ],
  },

  capabilities: {
    label: "What we do",
    title: ["One studio.", "Every discipline.", "No hand-offs."],
    services: siteConfig.services.map((service, index) => ({
      ...service,
      /** Preview image that follows the cursor when a row is hovered. */
      image: portfolio[index % portfolio.length]?.heroImage ?? "/images/og.jpg",
    })),
    stats: siteConfig.stats,
  },

  cta: {
    label: "Have a project in mind?",
    title: ["Let's build", "something", "unforgettable"],
    button: "Start a project",
    email: siteConfig.email,
  },

  footer: {
    newsletter: {
      title: "Stay in the flow",
      body: "Occasional notes on new work, launches and what we're learning.",
      placeholder: "Your email",
    },
  },
} as const;

export type StudioHome = Localized<typeof studioHome>;
