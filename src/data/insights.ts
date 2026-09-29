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
  cover: string;
  title: string;
  lead: string;
  /** Case study this article draws on, linked at the end. */
  related?: string;
  body: InsightBlock[];
};

export const insights: Insight[] = [
  {
    slug: "one-platform-many-markets",
    topic: "Restaurants",
    read: 6,
    cover: "/images/projects/texas-chicken/app.webp",
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
    cover: "/images/projects/moishi/hero.webp",
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
    cover: "/images/projects/physiowell/post-02.webp",
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
    cover: "/images/projects/shark-tank-egypt/web-hero.webp",
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
