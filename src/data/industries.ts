/**
 * Industries (sitemap: /industries and /industries/[slug]).
 *
 * Every industry links to real case studies in ./portfolio.ts by slug, and
 * each "how we help" line points at one of the six service disciplines
 * (src/versions/main/content/en.ts → services.list) by slug. The Arabic twin
 * lives in ./industries.ar.ts with the same slugs, images and links.
 */

export type Industry = {
  slug: string;
  title: string;
  /** One line for menus, cards and the footer. */
  short: string;
  /** Stretched headline on the industry page, one entry per line. */
  headline: string[];
  intro: string;
  image: string;
  /** Our deepest specialism: flagged in menus and cards. */
  flagship?: boolean;
  challenges: { title: string; body: string }[];
  helps: { title: string; body: string; service: string }[];
  /** Case study slugs, in the order they should appear. */
  work: string[];
};

export const industries: Industry[] = [
  {
    slug: "restaurants",
    title: "Restaurants & F&B",
    short: "Ordering apps, loyalty and brands for restaurant groups.",
    headline: ["From one kitchen", "to sixteen markets"],
    intro:
      "We have built ordering platforms, kiosks, bilingual brand systems and always-on social for a global QSR brand and for fast-growing dessert and ice cream names.",
    image: "/images/projects/texas-chicken/hero.webp",
    flagship: true,
    challenges: [
      { title: "Orders come from everywhere", body: "App, website, kiosk and delivery partners all have to work as one system." },
      { title: "Every market is different", body: "Menus, prices and offers change by country, by branch and by order type." },
      { title: "Loyalty has to work on every channel", body: "Points, coupons and promotions must behave the same in the app, on the web and in store." },
      { title: "One brand, many markets", body: "The brand has to stay consistent while each market runs its own business." },
    ],
    helps: [
      { title: "One ordering platform", body: "App, website and kiosk running on the same market-aware journey.", service: "website-app-design" },
      { title: "A bilingual brand system", body: "One identity that works in Arabic and English from the first sketch.", service: "branding" },
      { title: "Always-on social", body: "Content calendars and community management that keep the menu in the feed.", service: "social-media" },
      { title: "Campaigns that drive orders", body: "Paid media and e-coupons measured against repeat orders, not reach.", service: "performance-marketing" },
    ],
    work: ["texas-chicken", "moishi", "yumochi"],
  },
  {
    slug: "healthcare",
    title: "Healthcare & Aesthetics",
    short: "Trusted content and lead pipelines for health brands.",
    headline: ["Trust first,", "then growth"],
    intro:
      "We help pharmaceutical companies, clinics and aesthetics brands speak to the public with one trustworthy voice, and turn that trust into measurable demand.",
    image: "/images/projects/physiowell/mood.webp",
    challenges: [
      { title: "Trust comes first", body: "Health information has to be accurate, clear and credible." },
      { title: "Complex topics, general audiences", body: "Clinical knowledge must be easy to understand and act on." },
      { title: "Regulated messaging", body: "Every claim has to hold up, market by market." },
      { title: "Proving the spend works", body: "Campaigns have to show booked appointments and leads, not just reach." },
    ],
    helps: [
      { title: "Awareness content", body: "Health content written for everyday life, at scale.", service: "social-media" },
      { title: "Lead campaigns", body: "Always-on paid media measured against booked patients.", service: "performance-marketing" },
      { title: "Brand architecture", body: "One brand and its sub-brands, positioned for each audience.", service: "branding" },
      { title: "Strategy before spend", body: "Audits and roadmaps that decide where the budget goes.", service: "digital-consultation" },
    ],
    work: ["physiowell", "sinclair-aesthetics", "pharco"],
  },
  {
    slug: "media",
    title: "Media & Entertainment",
    short: "Episode-paced social and platforms for formats and events.",
    headline: ["Built for", "the season"],
    intro:
      "TV formats, awards and live events run on deadlines. We build the accounts, the sites and the campaigns that carry an audience from the first teaser to the final episode.",
    image: "/images/projects/shark-tank-egypt/ocean.webp",
    challenges: [
      { title: "Launching from zero", body: "A new format needs accounts, a voice and an audience before the first episode airs." },
      { title: "Every episode is a deadline", body: "Content has to be ready the moment the show goes live." },
      { title: "Turning viewers into applicants", body: "Formats need founders, nominees and entrants, not just views." },
      { title: "One format, several markets", body: "The same show has to feel local in every country it launches in." },
    ],
    helps: [
      { title: "Episode-paced social", body: "Teasers, clips and live coverage timed to the broadcast.", service: "social-media" },
      { title: "Application platforms", body: "Bilingual sites where founders and entrants apply.", service: "website-app-design" },
      { title: "Campaign identities", body: "Key visuals and systems that hold every category together.", service: "branding" },
      { title: "In-house production", body: "Shoots, motion and post-production on the show's timeline.", service: "creative-production" },
    ],
    work: ["shark-tank-egypt", "million-pound-menu", "million-riyal-menu", "eea"],
  },
  {
    slug: "real-estate",
    title: "Real Estate & Development",
    short: "Campaigns and content for developers and destinations.",
    headline: ["Places people", "want to be"],
    intro:
      "Developers sell a future that does not exist yet. We give each destination its own voice and carry the campaign from billboards to the feed.",
    image: "/images/projects/elsewhere-developments/hero.webp",
    challenges: [
      { title: "Selling what is not built yet", body: "Buyers have to picture a place from renders, plans and a promise." },
      { title: "Several projects, one developer", body: "Each destination needs its own voice without losing the parent brand." },
      { title: "Long decisions", body: "Buyers take months to decide, so the campaign has to stay present." },
      { title: "Offline meets online", body: "Billboards, events and social all have to tell the same story." },
    ],
    helps: [
      { title: "Campaign lines", body: "A single idea carried from out-of-home to street posters to social.", service: "branding" },
      { title: "Destination content", body: "Always-on social for each project, in Arabic and English.", service: "social-media" },
      { title: "Renders, film and motion", body: "Visuals produced in-house to sell the place before it opens.", service: "creative-production" },
      { title: "Lead generation", body: "Paid media tuned to qualified buyers and site visits.", service: "performance-marketing" },
    ],
    work: ["elsewhere-developments", "m-squared"],
  },
  {
    slug: "lifestyle",
    title: "Lifestyle & Retail",
    short: "Content and social for fashion and home brands.",
    headline: ["Look and feel", "is the product"],
    intro:
      "For fashion and furniture brands, the way the work looks is the reason people buy. We make content that leads with material, light and mood.",
    image: "/images/projects/at-home/hero.webp",
    challenges: [
      { title: "Standing out in the feed", body: "Crowded feeds make it hard for a premium brand to be noticed." },
      { title: "Seasons move fast", body: "Collections change, and content has to keep up." },
      { title: "Showing quality on a screen", body: "Material and craft have to come through on a phone." },
      { title: "Turning interest into sales", body: "Beautiful content still has to bring customers to the store." },
    ],
    helps: [
      { title: "Seasonal content", body: "Shoots and edits planned around each collection.", service: "creative-production" },
      { title: "Social that sells", body: "Channel strategy and community management for the brand's audience.", service: "social-media" },
      { title: "Campaigns for launches", body: "Paid media for new collections and store openings.", service: "performance-marketing" },
      { title: "Brand refinement", body: "Identity and art direction that match the product.", service: "branding" },
    ],
    work: ["astk", "at-home"],
  },
];
