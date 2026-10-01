/**
 * Insights (sitemap: /insights and /insights/[slug]).
 *
 * Practical notes from building and marketing digital products in the region.
 * Articles are written from the case studies in ./portfolio.ts; figures quoted
 * here must match those case studies. The Arabic twin is ./insights.ar.ts.
 */

export type InsightBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "pull"; text: string }
  | { type: "list"; items: string[] };

export type Insight = {
  slug: string;
  /** Filter key, translated per locale. */
  topic: string;
  /** Minutes to read. */
  read: number;
  /** Publish date, ISO (YYYY-MM-DD). */
  date: string;
  cover: string;
  title: string;
  lead: string;
  /** Case study this article draws on, linked at the end. */
  related?: string;
  body: InsightBlock[];
};

export const insights: Insight[] = [
  {
    slug: "generative-engine-optimization",
    topic: "AI Search",
    read: 6,
    date: "2026-09-24",
    cover: "/images/insights/social-at-broadcast-speed.webp",
    title: "Generative Engine Optimization (GEO) & AI Search Discovery: How to earn brand citations and source links inside AI answers like Google AI Overviews, Gemini, and ChatGPT Search",
    lead: "More searches now end in an AI answer, not a list of links. The brands that get named in that answer, and linked as its source, are the ones that win the click.",
    body: [
      { type: "heading", text: "From ranking to being cited" },
      {
        type: "paragraph",
        text: "Classic SEO asked how high a page ranks. Generative engines ask a different question: which sources are clear, trustworthy and specific enough to quote. Google AI Overviews, Gemini and ChatGPT Search assemble an answer from several pages and credit a few of them. The goal is to be one of those few.",
      },
      { type: "heading", text: "Write pages an answer engine can quote" },
      {
        type: "list",
        items: [
          "Answer the question in the first lines of the page, then go deeper",
          "Use clear headings that match the way people phrase questions",
          "Back claims with figures, dates and named sources",
          "Keep one topic per page so the answer is easy to lift",
        ],
      },
      { type: "pull", text: "AI answers quote pages that are easy to quote. Make the answer obvious, specific and verifiable." },
      { type: "heading", text: "Make the brand easy to recognise" },
      {
        type: "paragraph",
        text: "Structured data, consistent brand names across the web, an up-to-date business profile and mentions on trusted third-party sites all help AI systems connect a question to your brand. Technical basics still matter: pages that load fast and can be crawled are the only ones that can be cited.",
      },
      { type: "heading", text: "Measure visibility, not just traffic" },
      {
        type: "paragraph",
        text: "Track which priority questions mention your brand in AI answers, how often you are linked as a source and how that traffic converts. Review the list regularly, because answers change as models and sources update.",
      },
    ],
  },
  {
    slug: "first-party-data-architecture",
    topic: "Data",
    read: 7,
    date: "2026-09-10",
    cover: "/images/insights/measuring-campaigns-by-leads.webp",
    title: "First-Party Data Architecture: Privacy-first tracking strategies, conversion APIs, and marketing mix modeling (MMM) to replace deprecated third-party identifiers",
    lead: "Third-party cookies and device identifiers are fading. Measurement now depends on the data a brand collects itself, with consent, and on models that do not need to follow every user.",
    body: [
      { type: "heading", text: "Start with consent and a clean data layer" },
      {
        type: "paragraph",
        text: "Privacy-first tracking begins with a consent platform that actually controls what fires, and a single data layer that names every event the same way on web and app. Without that foundation, every downstream report is guesswork.",
      },
      { type: "heading", text: "Send conversions server-side" },
      {
        type: "paragraph",
        text: "Conversion APIs from Meta, Google, TikTok and Snap let the business send purchases and leads from its own server, matched with hashed first-party details. Signals survive browser restrictions and ad blockers, and ad platforms get the data they need to optimise campaigns.",
      },
      { type: "pull", text: "Own the data, send it with consent, and stop depending on identifiers you do not control." },
      { type: "heading", text: "Model what can no longer be tracked" },
      {
        type: "paragraph",
        text: "Marketing mix modeling looks at spend and results over time across every channel, online and offline, without user-level tracking. Paired with incrementality tests, it shows where the next budget will work hardest.",
      },
      {
        type: "list",
        items: ["Consent management and a unified event schema", "Server-side tagging and conversion APIs", "A customer data store the business owns", "MMM and lift tests for budget decisions"],
      },
    ],
  },
  {
    slug: "ai-integration-for-ecommerce",
    topic: "AI",
    read: 5,
    date: "2026-08-27",
    cover: "/images/insights/one-platform-many-markets.webp",
    title: "AI integration strategies for e-commerce businesses",
    lead: "AI pays off in e-commerce when it is attached to a clear job: helping customers find products, keeping stock in line with demand and taking repetitive work off the team.",
    body: [
      { type: "heading", text: "Start with the problem, not the model" },
      {
        type: "paragraph",
        text: "The useful question is not which AI tool to buy but where customers drop off and where the team loses time. Each answer becomes a candidate use case, ranked by value and by how ready the data is.",
      },
      { type: "heading", text: "Where AI earns its place" },
      {
        type: "list",
        items: [
          "Search and recommendations that understand what shoppers mean",
          "Product content and translations generated at catalogue scale",
          "Customer service assistants that resolve orders, returns and tracking",
          "Demand forecasting and dynamic merchandising",
        ],
      },
      { type: "pull", text: "Attach every AI feature to one number the business already watches." },
      { type: "heading", text: "Integrate, then scale" },
      {
        type: "paragraph",
        text: "Connect AI to the systems that hold the truth: catalogue, inventory, orders and customer data. Launch one use case, measure it against a control, and only then roll it out across markets and channels, with people reviewing what customers see.",
      },
    ],
  },
  {
    slug: "one-platform-many-markets",
    topic: "Restaurants",
    read: 6,
    date: "2026-08-06",
    cover: "/images/insights/one-platform-many-markets.webp",
    title: "One ordering platform, many markets: what changes from country to country",
    lead: "Launching a restaurant app in one country is a project. Running it across sixteen is a product. Here is what changes when you cross a border.",
    related: "texas-chicken",
    body: [
      { type: "heading", text: "Start with what stays the same" },
      {
        type: "paragraph",
        text: "Most of the platform should be shared: the ordering flow, the account, the cart, the checkout and the admin tools. Sharing is what keeps a multi-market platform affordable to run. The work is deciding, feature by feature, what each market is allowed to change.",
      },
      { type: "heading", text: "Menus and prices are local" },
      {
        type: "paragraph",
        text: "A meal that costs one price in one city can cost another in the next country, and sometimes a different price for delivery than for pick-up in the same branch. The platform has to treat price as something that belongs to a market, a branch and an order type, never as a fixed property of the product.",
      },
      { type: "pull", text: "Treat price as a property of the market, the branch and the order type. Never of the product alone." },
      { type: "heading", text: "Language is more than translation" },
      {
        type: "paragraph",
        text: "Arabic runs right to left, so every screen needs a mirrored layout, not just translated labels. Product names, offers and even the tone of notifications often need their own local version.",
      },
      { type: "heading", text: "Give each market control, within guardrails" },
      {
        type: "list",
        items: ["Local teams manage menus, prices, branches and banners", "Global rules protect the brand, the design system and the data", "Every change is visible in one dashboard"],
      },
      { type: "heading", text: "Plan for channels, not just countries" },
      { type: "paragraph", text: "Web, app and kiosk should all read from the same menu and the same rules. When they drift apart, customers notice first." },
    ],
  },
  {
    slug: "kiosk-app-or-both",
    topic: "Restaurants",
    read: 4,
    date: "2026-07-16",
    cover: "/images/insights/kiosk-app-or-both.webp",
    title: "Kiosk, app or both? How restaurant brands decide",
    lead: "Kiosks shorten queues. Apps build loyalty. The best setups share one platform so each channel strengthens the other.",
    related: "moishi",
    body: [
      {
        type: "paragraph",
        text: "Kiosks work where queues are the problem: busy branches, food courts and peak hours. Apps work where repeat visits are the goal: they carry loyalty, offers and order history in the customer’s pocket.",
      },
      {
        type: "paragraph",
        text: "The decision gets easier when both run on the same system. One menu, one set of prices, one promotions engine. A customer who earns a coupon in the app can redeem it at the kiosk, and the operations team manages it all from a single dashboard.",
      },
      { type: "pull", text: "Choose the channel for the problem you want to solve, then run every channel on one platform." },
    ],
  },
  {
    slug: "measuring-campaigns-by-leads",
    topic: "Growth",
    read: 4,
    date: "2026-06-25",
    cover: "/images/insights/measuring-campaigns-by-leads.webp",
    title: "Measuring campaigns by the leads they bring in",
    lead: "Reach and impressions are easy to report. Booked appointments and return on ad spend are what a business can plan with.",
    related: "physiowell",
    body: [
      {
        type: "paragraph",
        text: "For Physiowell, a physiotherapy clinic in Dubai, the figures that mattered were leads and return on ad spend. Always-on campaigns on Facebook, Instagram and Google reached up to 10x ROAS because every creative was judged on the patients it brought in.",
      },
      {
        type: "paragraph",
        text: "Getting there starts before the first ad: tracking in place, a clear conversion event and targeting built around real patients. Then each idea runs as its own test. The ones that win get the budget; the rest are switched off.",
      },
      { type: "pull", text: "Agree the number that matters before the first ad goes live." },
    ],
  },
  {
    slug: "social-at-broadcast-speed",
    topic: "Content",
    read: 5,
    date: "2026-06-04",
    cover: "/images/insights/social-at-broadcast-speed.webp",
    title: "Social at broadcast speed: running a TV format online",
    lead: "When the show airs, the content has to be live the same minute. That takes a system, not a scramble.",
    related: "shark-tank-egypt",
    body: [
      { type: "heading", text: "Build the accounts before the first episode" },
      {
        type: "paragraph",
        text: "Shark Tank Egypt started with no social presence. The audience had to exist before the premiere, so teasers, the sharks and the application call went out weeks ahead of the first broadcast.",
      },
      { type: "heading", text: "Make every episode a template" },
      {
        type: "paragraph",
        text: "A repeatable format for each episode, in Arabic and English, means the team spends its time on the moments that matter instead of rebuilding the same post every week.",
      },
      { type: "pull", text: "A format is a system. Design the system once, then fill it every week." },
      { type: "heading", text: "Give viewers somewhere to go" },
      { type: "paragraph", text: "Views are not the goal on their own. A bilingual site where founders can apply turns an audience into entrants for the next season." },
    ],
  },
];
