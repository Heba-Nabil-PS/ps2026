/**
 * Industries (sitemap: /industries and /industries/[slug]).
 *
 * Every industry links to real case studies in ./portfolio.ts by slug, and
 * each "how we help" line points at one of the six service disciplines
 * (src/versions/main/content/en.ts → services.list) by slug. The Arabic twin
 * lives in ./industries.ar.ts with the same slugs, images and links.
 */

import type { StatItem } from "@/data/portfolio";

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
  /** Numbers across the sector, each one taken from a case study's results. */
  proof?: StatItem[];
  /**
   * Where a business in this sector is when it comes to us: the situation,
   * the discipline that answered it and the case study that proves it.
   * Together they show the whole sector, not one project.
   */
  stages: { stage: string; title: string; body: string; service: string; work: string }[];
  /** What working across several disciplines in this sector taught us. */
  lessons: { title: string; body: string }[];
  faq: { question: string; answer: string }[];
  /** Insight slugs (./insights.ts) written about this sector. */
  insights: string[];
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
    proof: [
      { value: 16, label: "Countries ordering on one regional platform" },
      { value: 1, label: "Checkout, replacing sixteen separate journeys" },
      { value: 2, label: "Taps from craving to checkout in a dessert app" },
    ],
    stages: [
      {
        stage: "Launching",
        title: "A new brand that needs to be ordered",
        body: "An identity and an ordering app designed around the small, frequent basket, so the second order is easier than the first.",
        service: "website-app-design",
        work: "moishi",
      },
      {
        stage: "Growing",
        title: "A product people have to understand and crave",
        body: "Always-on content and campaigns that explain the product, keep it seasonal and keep it in the feed.",
        service: "social-media",
        work: "yumochi",
      },
      {
        stage: "Scaling",
        title: "Many markets running on many systems",
        body: "One brand, one platform and one checkout for sixteen countries, with menus, prices and offers set market by market.",
        service: "website-app-design",
        work: "texas-chicken",
      },
    ],
    lessons: [
      { title: "The basket decides the design", body: "A dessert order and a family meal need different apps. Small baskets live or die on taps; large ones on customisation." },
      { title: "Local without splitting", body: "Each market needs its own menu and offers, but the moment it gets its own app, the brand starts to drift." },
      { title: "Campaigns should end at the order", body: "Because we build the ordering journeys too, our campaigns point at the step that converts, and we measure repeat orders, not reach." },
    ],
    faq: [
      { question: "Do you only work with large chains?", answer: "No. Our restaurant work runs from a sixteen-market QSR brand to young dessert brands launching their first app. We scope the work to the stage you are at." },
      { question: "Can we start with one service, like social or the app?", answer: "Yes. Each restaurant brand we work with started with a different discipline. Start where the need is, and add the rest when it makes sense." },
      { question: "Can one ordering platform serve several countries?", answer: "Yes. Texas Chicken's Middle East and Africa ordering runs on one regional platform across sixteen countries, with menus, prices and offers that change by market." },
      { question: "Do you design in Arabic and English?", answer: "Every brand system and ordering journey we build is bilingual from the first sketch, not translated at the end." },
    ],
    insights: ["one-platform-many-markets", "kiosk-app-or-both", "ai-integration-for-ecommerce"],
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
    proof: [
      { value: 10, suffix: "×", label: "Up to, return on ad spend for a Dubai clinic" },
      { value: 3, label: "Aesthetics sub-brands under one regional strategy" },
      { value: 1, label: "Clinical education platform for the region's injectors" },
    ],
    stages: [
      {
        stage: "Clinics",
        title: "A good reputation, but not enough new patients",
        body: "Always-on paid media measured against booked patients, with up to 10× return on ad spend.",
        service: "performance-marketing",
        work: "physiowell",
      },
      {
        stage: "Pharmaceuticals",
        title: "People need to understand the condition first",
        body: "An awareness system that explains first and sells second, written for everyday readers.",
        service: "social-media",
        work: "pharco",
      },
      {
        stage: "Aesthetics portfolios",
        title: "Two audiences: consumers and the clinicians who choose",
        body: "One regional voice for consumers, and an education platform injectors come back to.",
        service: "social-media",
        work: "sinclair-aesthetics",
      },
    ],
    lessons: [
      { title: "Explain before you sell", body: "Health content that sells too early loses trust. The audience has to understand the problem before they hear the product." },
      { title: "Count patients, not likes", body: "A clinic's campaign is judged on booked appointments, so tracking leads is set up before spend, not after." },
      { title: "Clinicians are an audience too", body: "In aesthetics, the injector chooses the product. Education for professionals sells more than ads to consumers." },
    ],
    faq: [
      { question: "How do you handle regulated health claims?", answer: "Claims are agreed with your medical and regulatory team before anything is published, and content leads with education, not the product." },
      { question: "Can you show what our ad spend returns?", answer: "Yes. For Physiowell, campaigns are reported against leads, not reach, and paid channels returned up to 10× their spend." },
      { question: "Do you work with B2B audiences such as doctors?", answer: "Yes. For Sinclair we built a clinical education platform for injectors alongside the consumer channels." },
    ],
    insights: ["measuring-campaigns-by-leads", "first-party-data-architecture", "generative-engine-optimization"],
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
    proof: [
      { value: 900, suffix: "M+", label: "Viewership for Shark Tank Egypt" },
      { value: 170, suffix: "+", label: "Companies pitched on the show" },
      { value: 2, label: "Markets running one format platform, Egypt and Saudi Arabia" },
    ],
    stages: [
      {
        stage: "Launching a format",
        title: "An audience before the first episode",
        body: "Accounts, a voice and an application site that turned viewers into founders who apply to pitch, four seasons running.",
        service: "social-media",
        work: "shark-tank-egypt",
      },
      {
        stage: "Taking it to a new market",
        title: "The same show, without reading as a translation",
        body: "The Egyptian platform localised for Saudi Arabia alongside MBC and Riyadh Season, faster because it was already proven.",
        service: "website-app-design",
        work: "million-riyal-menu",
      },
      {
        stage: "Building an event",
        title: "Many categories, one ceremony",
        body: "One identity that holds every category together, and a campaign that builds anticipation to the night.",
        service: "branding",
        work: "eea",
      },
    ],
    lessons: [
      { title: "The broadcast is the brief", body: "The content calendar is the episode schedule. Everything is ready before air, and live coverage runs on the night." },
      { title: "Views are not the goal", body: "Formats need founders, nominees and entrants. The application journey matters as much as the feed." },
      { title: "Build once, localise", body: "A platform designed for one edition carried the next one into a new country, with its own voice." },
    ],
    faq: [
      { question: "Can you keep up with a weekly broadcast?", answer: "Yes. Million Pound Menu aired a new episode every week, and social and the website kept pace for the whole season." },
      { question: "Do you build the application platform as well as social?", answer: "Yes. For Shark Tank Egypt and Million Pound Menu we ran social and built the bilingual sites where founders apply." },
      { question: "Have you launched a format in more than one country?", answer: "Yes. Million Pound Menu in Egypt became Million Riyal Menu in Saudi Arabia, on the same platform." },
    ],
    insights: ["social-at-broadcast-speed", "measuring-campaigns-by-leads", "generative-engine-optimization"],
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
    proof: [
      { value: 3, label: "Destinations in one developer's brand system" },
      { value: 3, label: "Campaign executions carrying one line" },
    ],
    stages: [
      {
        stage: "Several destinations",
        title: "Each place needs its own voice",
        body: "A coastal community, residences and offices, each selling itself while still reading as one developer.",
        service: "social-media",
        work: "elsewhere-developments",
      },
      {
        stage: "A launch",
        title: "A campaign people actually remember",
        body: "One line carried from billboards to street posters to social, leading with a feeling instead of a skyline.",
        service: "branding",
        work: "m-squared",
      },
    ],
    lessons: [
      { title: "Sell the feeling, then the floor plan", body: "Renders and skylines all look alike. A campaign idea is what makes a development memorable." },
      { title: "The developer keeps the name", body: "Each destination gets its own voice, but buyers should always know who is behind it." },
      { title: "Stay present for months", body: "Buyers decide slowly, so the campaign has to keep the place in view long after launch." },
    ],
    faq: [
      { question: "Do you handle outdoor as well as digital?", answer: "Yes. For M Squared one campaign line ran across billboards, street posters and social." },
      { question: "Can each project have its own identity?", answer: "Yes. For Elsewhere Developments, three destinations each have their own voice inside one brand system." },
      { question: "Do you produce the visuals in-house?", answer: "Yes. Renders, film and motion are produced by our own team, on the campaign's timeline." },
    ],
    insights: ["measuring-campaigns-by-leads", "first-party-data-architecture", "generative-engine-optimization"],
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
    stages: [
      {
        stage: "Fashion",
        title: "Seasons that move faster than the feed",
        body: "A seasonal content engine that carries each collection from launch day to the last sale without losing the look.",
        service: "creative-production",
        work: "astk",
      },
      {
        stage: "Home & furniture",
        title: "A slow purchase that has to be felt first",
        body: "A calm, consistent feed that sells the feeling of a room, not only the piece in it.",
        service: "social-media",
        work: "at-home",
      },
    ],
    lessons: [
      { title: "Plan around the collection", body: "Shoots are scheduled with the product calendar, so content is ready the day a collection lands." },
      { title: "Material before message", body: "On a phone, texture and light do the selling. Copy comes second." },
      { title: "Consistency reads as premium", body: "A feed that always looks the same is what makes a brand feel expensive." },
    ],
    faq: [
      { question: "Do you shoot the content yourselves?", answer: "Yes. Shoots, edits and motion are produced in-house and planned around each collection." },
      { question: "Can you support launches and sales, not only brand content?", answer: "Yes. For ASTK we run launches and sale pushes with paid media alongside the always-on feed." },
    ],
    insights: ["ai-integration-for-ecommerce", "first-party-data-architecture", "generative-engine-optimization"],
  },
];
