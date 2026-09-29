/**
 * Content for the /services page.
 *
 * Each service extends the six disciplines in `siteConfig.services` with what
 * we actually ship, a proof point from the company profile, and a case study
 * that shows the discipline at work. Images come from the portfolio.
 */

import { caseStudyHref } from "@/data/caseStudies";
import { portfolio } from "@/data/portfolio";
import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export type Service = {
  slug: string;
  index: string;
  title: string;
  /** Short line shown under the title on the stacked card. */
  tagline: string;
  description: string;
  deliverables: string[];
  /** Case study that shows this discipline at work. */
  proof: { label: string; slug: string };
  image: { src: string; alt: string };
  /** Card surface — cards alternate so the stack reads as a deck. */
  tone: "paper" | "ink" | "blue";
};

const image = (slug: string) => portfolio.find((project) => project.slug === slug)?.heroImage ?? "/images/og.jpg";

const details: Record<string, Omit<Service, "slug" | "index" | "title" | "description" | "image" | "tone">> = {
  Branding: {
    tagline: "Identities that travel across markets.",
    deliverables: ["Positioning & brand strategy", "Naming & verbal identity", "Visual identity systems", "Bilingual typography", "Brand guidelines", "Packaging & retail"],
    proof: { label: "Texas Chicken — one bilingual system across 16 markets", slug: "texas-chicken" },
  },
  "Website & App Development": {
    tagline: "Designed and engineered under one roof.",
    deliverables: ["UI/UX design", "E-commerce & ordering", "Loyalty programmes", "iOS & Android apps", "In-store kiosks", "Headless & custom builds"],
    proof: { label: "Texas Chicken — one regional ordering app, one checkout", slug: "texas-chicken" },
  },
  Production: {
    tagline: "Photography, film and motion by our own studio.",
    deliverables: ["Art direction", "Food & product photography", "Film & TVC", "Motion graphics & 3D", "Post-production", "Studio & location shoots"],
    proof: { label: "Shark Tank Egypt — a broadcast brand built for every feed", slug: "shark-tank-egypt" },
  },
  "Digital Campaigns": {
    tagline: "Paid media tested against real numbers.",
    deliverables: ["Campaign strategy", "Media planning & buying", "Performance creative", "Conversion tracking", "A/B testing", "Reporting & optimisation"],
    proof: { label: "Physiowell — up to 10x return on ad spend", slug: "physiowell" },
  },
  "Social Media Management": {
    tagline: "Strategy, content and community, every day.",
    deliverables: ["Channel strategy", "Content calendars", "Always-on creative", "Community management", "Influencer programmes", "Social listening"],
    proof: { label: "Sinclair Aesthetics — one voice across three sub-brands", slug: "sinclair-aesthetics" },
  },
  SEO: {
    tagline: "Search that compounds after the campaign ends.",
    deliverables: ["Technical audits", "Keyword & content strategy", "On-page optimisation", "Bilingual content", "Local SEO", "Analytics & reporting"],
    proof: { label: "Texas Chicken — search across sixteen storefronts", slug: "texas-chicken" },
  },
};

const tones: Service["tone"][] = ["paper", "ink", "blue", "paper", "ink", "blue"];

export type ServiceDetails = (typeof details)[string];

/** Anchor ids stay English in every locale, so /services#branding works everywhere. */
const slugs = siteConfig.services.map((service) =>
  service.title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
);

/** Joins (localized) discipline titles with their details, matched by position. */
export function buildServices(list: readonly { title: string; description: string }[], extras: readonly ServiceDetails[]): Service[] {
  return list.map((service, index) => {
    const extra = extras[index];
    return {
      slug: slugs[index],
      index: String(index + 1).padStart(2, "0"),
      title: service.title,
      description: service.description,
      image: { src: image(extra.proof.slug), alt: `${service.title} — ${extra.proof.label}` },
      tone: tones[index % tones.length],
      ...extra,
    };
  });
}

export const services = buildServices(
  siteConfig.services,
  siteConfig.services.map((service) => details[service.title]),
);

export const servicesPage = {
  hero: {
    label: "Services",
    title: ["Every discipline,", "one", "connected flow"],
    intro:
      "Six disciplines, one team, no hand-offs. Strategy, brand, web and app development, production, campaigns, social and SEO — delivered end to end by 80+ in-house specialists.",
    meta: `${siteConfig.services.length} disciplines · ${siteConfig.location}`,
  },
  statement: {
    label: "How we work",
    action: "Explore the disciplines",
    text: "Most agencies hand your brand from vendor to vendor. We keep every discipline in the same room, so the strategy that shapes the identity also shapes the app, the campaign and the content that runs on it.",
  },
  stack: {
    label: "What we do",
    title: ["Six ways", "we move brands"],
  },
  process: {
    label: "Our process",
    title: ["From first idea", "to last pixel"],
    steps: siteConfig.process,
  },
  cta: {
    label: "Need more than one discipline?",
    title: ["Let's build", "the whole", "system"],
    button: "Start a project",
  },
} as const;

export type ServicesPage = Localized<typeof servicesPage>;

export const serviceProofHref = (service: Service) => caseStudyHref(service.proof.slug);
