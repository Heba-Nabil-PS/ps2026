/**
 * The flagship case studies on /projects — the long-form cut of the work.
 * The full index of campaigns and builds lives in `src/data/portfolio.ts`.
 *
 * Every fact here comes from the PSdigital company profile. Numbers that
 * belong to a client's show or business (rather than to our campaigns) are
 * labelled as such.
 */

export type ProjectResult = { value: string; label: string };

export type Project = {
  slug: string;
  number: string;
  title: string;
  client: string;
  category: string;
  /** Where the work runs. */
  market: string;
  /** One-line summary used for cards and metadata. */
  description: string;
  /** Longer case-study introduction. */
  intro: string;
  /** Tone shown behind media while it loads. */
  color: string;
  heroImage: string;
  /** Optional — when provided, video replaces the hero image (image becomes the poster). */
  heroVideo?: string;
  /** Optional full-width film for the case study. Falls back to a gallery image. */
  video?: string;
  gallery: [string, string, string, ...string[]];
  services: string[];
  challenge: { heading: string; body: string };
  approach: { heading: string; body: string };
  details: { label: string; value: string }[];
  results: ProjectResult[];
  outcome: string;
};

export const img = (slug: string, name: string) => `/images/projects/${slug}/${name}.webp`;

export const projects: Project[] = [
  {
    slug: "texas-chicken",
    number: "01",
    title: "Texas Chicken",
    client: "Texas Chicken — Middle East & Africa",
    category: "Brand · App · Web · Social",
    market: "16 markets — MEA",
    description: "One bilingual brand system and one regional ordering app, replacing sixteen country-by-country experiences.",
    intro:
      "Since partnering with PSdigital, Texas Chicken's Middle East and Africa business has run through a single agency of record: brand identity, mobile app, e-commerce, loyalty, in-store kiosks, SEO and social, unified across 16 countries under one bilingual brand system.",
    color: "#1a0f08",
    heroImage: img("texas-chicken", "hero"),
    gallery: [img("texas-chicken", "web-01"), img("texas-chicken", "post-02"), img("texas-chicken", "web-03")],
    services: ["Branding", "Website & App Development", "Social Media Management", "SEO", "Production"],
    challenge: {
      heading: "Sixteen markets pulling a brand sixteen ways",
      body: "Ordering was fragmented country by country, with separate experiences, separate agencies and a brand that read differently in every market — in two languages.",
    },
    approach: {
      heading: "One regional app. 16 countries. One checkout.",
      body: "We designed and built a single regional ordering app for Africa and the Middle East, replacing 16 fragmented, country-by-country experiences with one bilingual, market-aware journey built to drive repeat orders through customizable e-coupons — and carried the same system into e-commerce, loyalty, in-store kiosks and social.",
    },
    details: [
      { label: "Client", value: "Texas Chicken MEA" },
      { label: "Market", value: "16 countries" },
      { label: "Platform", value: "App, e-commerce, kiosk, web" },
      { label: "Scope", value: "Agency of record" },
    ],
    results: [
      { value: "16", label: "Countries on one platform" },
      { value: "1", label: "Checkout, replacing sixteen journeys" },
      { value: "2", label: "Languages, one brand system" },
    ],
    outcome:
      "Sixteen markets, one brand system, no hand-offs — every discipline delivered by the same in-house team.",
  },
  {
    slug: "shark-tank-egypt",
    number: "02",
    title: "Shark Tank Egypt",
    client: "Shark Tank Egypt",
    category: "Social Media · Website",
    market: "Egypt",
    description: "Accounts built from zero and a bilingual home for the show — episodes, sharks and the pitch application.",
    intro:
      "Shark Tank Egypt's social accounts were built from zero and grown season after season, alongside a bilingual website where viewers watch episodes, meet the sharks and entrepreneurs apply to pitch.",
    color: "#071426",
    heroImage: img("shark-tank-egypt", "hero"),
    gallery: [img("shark-tank-egypt", "web-hero"), img("shark-tank-egypt", "post-01"), img("shark-tank-egypt", "ocean")],
    services: ["Social Media Management", "Website & App Development", "Production", "Digital Campaigns"],
    challenge: {
      heading: "A global format, launching with no audience of its own",
      body: "The Egyptian edition arrived with the weight of the format but none of its local following, and a weekly broadcast schedule that leaves no room to be late.",
    },
    approach: {
      heading: "Publish at broadcast speed, in both languages",
      body: "Design, motion and copy in-house meant episode drops, special episodes and partner formats like She's Next could be produced and published to the minute — while the website carried the show's numbers, seasons and sharks, and turned viewers into applicants.",
    },
    details: [
      { label: "Client", value: "Shark Tank Egypt" },
      { label: "Market", value: "Egypt" },
      { label: "Platform", value: "Social, web (AR/EN)" },
      { label: "Scope", value: "Social from zero, website" },
    ],
    results: [
      { value: "900M+", label: "Show viewership, as published on the site" },
      { value: "170+", label: "Companies pitched" },
      { value: "4", label: "Seasons covered" },
    ],
    outcome:
      "Four seasons on, the accounts and the site are the show's front door for viewers and entrepreneurs alike.",
  },
  {
    slug: "sinclair-aesthetics",
    number: "03",
    title: "Sinclair Aesthetics",
    client: "Sinclair",
    category: "Social Media · B2B Campaigns",
    market: "MENA",
    description: "Positioning global aesthetics science as the regional benchmark — one brand, three sub-brands, one strategy.",
    intro:
      "PSdigital manages Sinclair's overarching brand alongside its specialized sub-brands across MENA, running social strategy, B2B clinical outreach and localized product launches that position its aesthetics portfolio as the regional benchmark.",
    color: "#1b1030",
    heroImage: img("sinclair-aesthetics", "hero"),
    gallery: [img("sinclair-aesthetics", "showcase"), img("sinclair-aesthetics", "event-01"), img("sinclair-aesthetics", "social-01")],
    services: ["Social Media Management", "Digital Campaigns", "Production", "Branding"],
    challenge: {
      heading: "A science portfolio reading as a product catalog",
      body: "Three sub-brands, two audiences — consumers and clinicians — and launches that arrived market by market without a shared point of view.",
    },
    approach: {
      heading: "A point of view before a plan",
      body: "We reframed Sinclair's science as a MENA credibility benchmark rather than a product catalog, then built one regional social and campaign strategy across the sub-brands, with B2B clinical outreach — expert meetings, workshops and speaker programmes — carrying the proof.",
    },
    details: [
      { label: "Client", value: "Sinclair" },
      { label: "Market", value: "MENA" },
      { label: "Platform", value: "Social, campaigns, events" },
      { label: "Scope", value: "Brand + 3 sub-brands" },
    ],
    results: [
      { value: "3", label: "Sub-brands on one strategy" },
      { value: "B2B + B2C", label: "Audiences served in parallel" },
      { value: "MENA", label: "Region unified under one calendar" },
    ],
    outcome:
      "The portfolio now runs on a single regional social and campaign strategy, with clinical education as its centre of gravity.",
  },
  {
    slug: "physiowell",
    number: "04",
    title: "Physiowell",
    client: "Physiowell",
    category: "Performance Marketing",
    market: "Dubai, UAE",
    description: "Always-on paid media that turned clinical trust into a measurable lead pipeline — up to 10x ROAS.",
    intro:
      "Across Facebook, Instagram and Google, PSdigital's always-on campaigns for this Dubai physiotherapy and chiropractic clinic turned brand trust into a measurable, ongoing lead pipeline for the business.",
    color: "#141a1c",
    heroImage: img("physiowell", "hero"),
    gallery: [img("physiowell", "mood"), img("physiowell", "post-03"), img("physiowell", "post-06")],
    services: ["Digital Campaigns", "Social Media Management", "Production"],
    challenge: {
      heading: "Trust that never reached the booking form",
      body: "A clinic's reputation lives in its treatment rooms. Turning it into bookings meant reaching people at the moment a symptom starts to worry them.",
    },
    approach: {
      heading: "Symptom-led creative, tested against real numbers",
      body: "Frozen shoulder, scoliosis, pregnancy support — each hook ran as its own audience test across paid channels, with winners scaled and the rest retired. Continuous testing, not a launch campaign.",
    },
    details: [
      { label: "Client", value: "Physiowell" },
      { label: "Market", value: "Dubai, UAE" },
      { label: "Platform", value: "Facebook, Instagram, Google" },
      { label: "Scope", value: "Always-on paid media" },
    ],
    results: [
      { value: "Up to 10x", label: "Return on ad spend across paid channels" },
      { value: "3", label: "Always-on channels" },
      { value: "Ongoing", label: "Lead pipeline, not a campaign spike" },
    ],
    outcome: "Record-breaking return on ad spend, and a pipeline the clinic can plan its week around.",
  },
  {
    slug: "million-pound-menu",
    number: "05",
    title: "Million Pound Menu",
    client: "Million Pound Menu",
    category: "Social Media · Website",
    market: "Egypt",
    description: "From kitchen dreams to business realities — episode-paced social and a site where food founders apply.",
    intro:
      "A business show for food entrepreneurs needs a campaign that runs at the pace of broadcast. We built the episode-by-episode social system and the bilingual website where founders read the format, meet the investors and apply to pitch.",
    color: "#120d0a",
    heroImage: img("million-pound-menu", "hero"),
    gallery: [img("million-pound-menu", "laptop"), img("million-pound-menu", "post-02"), img("million-pound-menu", "post-05")],
    services: ["Social Media Management", "Website & App Development", "Production"],
    challenge: {
      heading: "Two jobs, one campaign",
      body: "The show had to hold a weekly audience and recruit the founders who would fill the next season — two very different asks from the same channels.",
    },
    approach: {
      heading: "A feed for viewers, a site for founders",
      body: "Episode creative carried the broadcast rhythm in Arabic and English, while the website explained the format, introduced the investors and pop-up restaurants, and kept Apply Now within reach on every screen.",
    },
    details: [
      { label: "Client", value: "Million Pound Menu" },
      { label: "Market", value: "Egypt" },
      { label: "Platform", value: "Social, web (AR/EN)" },
      { label: "Scope", value: "Campaign + website" },
    ],
    results: [
      { value: "AR / EN", label: "Bilingual campaign and platform" },
      { value: "Weekly", label: "Episode creative through the season" },
      { value: "Apply", label: "Founder journey built into the site" },
    ],
    outcome:
      "One platform now carries the format — and was localized again for its Saudi edition, Million Riyal Menu.",
  },
  {
    slug: "million-riyal-menu",
    number: "06",
    title: "Million Riyal Menu",
    client: "Million Riyal Menu — MBC & Riyadh Season",
    category: "Social Media · Website",
    market: "Saudi Arabia",
    description: "The Saudi edition of the format — Arabic-first episode campaigns with MBC and Riyadh Season.",
    intro:
      "The Saudi edition of the format, running with MBC and Riyadh Season: Arabic-first episode campaigns and a localized site built on the same platform as its Egyptian counterpart.",
    color: "#0b1a16",
    heroImage: img("million-riyal-menu", "hero"),
    gallery: [img("million-riyal-menu", "laptop"), img("million-riyal-menu", "post-01"), img("million-riyal-menu", "post-04")],
    services: ["Social Media Management", "Website & App Development", "Production"],
    challenge: {
      heading: "Localization that isn't translation",
      body: "The Saudi audience, its partners and its founders are not the Egyptian ones. Reusing the format's platform could not mean reusing its voice.",
    },
    approach: {
      heading: "Same structure, rebuilt surface",
      body: "Arabic-first creative and navigation, Riyadh Season and MBC partnership carried through the campaign, and an application journey tuned to local founders — all on the platform we had already built.",
    },
    details: [
      { label: "Client", value: "MBC · Riyadh Season" },
      { label: "Market", value: "Saudi Arabia" },
      { label: "Platform", value: "Social, web" },
      { label: "Scope", value: "Localized campaign + site" },
    ],
    results: [
      { value: "Arabic-first", label: "Creative and navigation" },
      { value: "2", label: "Editions running on one platform" },
      { value: "Season", label: "Campaign delivered end to end" },
    ],
    outcome: "A second market live on the same foundations, without rebuilding the format from scratch.",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** Wraps around so the last project links back to the first. */
export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  const total = projects.length;
  return {
    previous: projects[(index - 1 + total) % total],
    next: projects[(index + 1) % total],
  };
}
