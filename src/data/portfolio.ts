/**
 * The entire /portfolio experience renders from this file.
 *
 * Content and artwork come from the PSdigital company profile. Where the deck
 * carried placeholder copy, the description was written from the work shown on
 * the slide — those projects are worth a copy review before launch.
 *
 * To add a project:
 *   1. Drop media in /public/images/projects/<slug>/ (and optionally /public/videos/projects/<slug>/)
 *   2. Append an object to `portfolio` below — cards, case study, metadata and sitemap update automatically.
 */

export type MediaRef = { src: string; alt: string };

export type StatItem = { value: number; prefix?: string; suffix?: string; decimals?: number; label: string };

export type ProjectLinkKind = "website" | "app" | "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "x" | "behance";

/** An outbound link to the live work — the site, the app or a social account. */
export type ProjectLink = { kind: ProjectLinkKind; href: string; label?: string };

export type ContentBlock =
  /** Oversized typographic statement, optionally over a dimmed image. */
  | { type: "hero"; eyebrow?: string; title: string; image?: MediaRef }
  | { type: "image"; image: MediaRef; caption?: string; aspect?: "landscape" | "portrait" | "square"; align?: "left" | "center" | "right" }
  | { type: "fullWidthImage"; image: MediaRef; caption?: string }
  | { type: "video"; src: string; poster: string; label: string; caption?: string }
  | { type: "gallery"; title?: string; images: MediaRef[] }
  /** Campaign work shown whole, never cropped — social posts, screens, key visuals. */
  | {
      type: "posts";
      eyebrow?: string;
      title?: string;
      body?: string;
      items: MediaRef[];
      shape?: "portrait" | "square" | "story" | "phone" | "screen" | "wide";
      columns?: 2 | 3;
    }
  | { type: "twoColumn"; eyebrow?: string; title: string; body: string; image: MediaRef; reverse?: boolean }
  | { type: "text"; eyebrow?: string; title: string; body: string }
  | { type: "quote"; quote: string; author: string; role: string }
  | { type: "stats"; title?: string; items: StatItem[] }
  | { type: "3d"; eyebrow?: string; title: string; body: string; poster: MediaRef }
  | { type: "interactive"; eyebrow?: string; title: string; body: string; before: MediaRef & { label: string }; after: MediaRef & { label: string } };

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Where the work runs — shown wherever a date would sit on a studio site. */
  market?: string;
  description: string;
  /** Editorial introduction shown under the case-study hero. */
  intro: string;
  client: string;
  services: string[];
  /** What we actually shipped. */
  deliverables: string[];
  tags: string[];
  /** Base tone shown behind media while it loads. */
  color: string;
  heroImage: string;
  /** Plays on card hover (desktop). */
  hoverVideo?: string;
  /** Loops behind the case-study hero. */
  backgroundVideo?: string;
  /** The problem the brief had to solve. */
  challenge?: string;
  /** What we did, as ordered steps. */
  approach?: { title: string; body: string }[];
  /** Where it landed: a short summary and the numbers behind it. */
  results?: { summary: string; stats?: StatItem[] };
  /** Client testimonial — only ever a real, approved quote. */
  review?: { quote: string; author: string; role: string };
  /** Live site, app store or social accounts. */
  links?: ProjectLink[];
  content: ContentBlock[];
};

/** Central asset resolver — change folder structure or formats in one place. */
export const assets = (slug: string) => ({
  image: (name: string) => `/images/projects/${slug}/${name}.webp`,
  video: (name: string) => `/videos/projects/${slug}/${name}.webm`,
  media: (name: string, alt: string): MediaRef => ({ src: `/images/projects/${slug}/${name}.webp`, alt }),
});

const texas = assets("texas-chicken");
const sinclair = assets("sinclair-aesthetics");
const sharkTank = assets("shark-tank-egypt");
const poundMenu = assets("million-pound-menu");
const physiowell = assets("physiowell");
const riyalMenu = assets("million-riyal-menu");
const yumochi = assets("yumochi");
const moishi = assets("moishi");
const atHome = assets("at-home");
const elsewhere = assets("elsewhere-developments");
const pharco = assets("pharco");
const eea = assets("eea");
const mSquared = assets("m-squared");
const astk = assets("astk");

export const portfolio: PortfolioProject[] = [
  {
    id: "01",
    slug: "texas-chicken",
    title: "Texas Chicken",
    category: "Brand · App · Web · Social",
    market: "16 markets — MEA",
    description: "One bilingual brand system, one regional ordering app, sixteen countries — run through a single agency of record.",
    intro:
      "Since partnering with PSdigital, Texas Chicken’s Middle East and Africa business has run through a single agency of record: brand identity, mobile app, e-commerce, loyalty, in-store kiosks, SEO and social, unified across 16 countries under one bilingual brand system.",
    client: "Texas Chicken — Middle East & Africa",
    services: ["Branding", "Website & App Development", "Social Media Management", "SEO", "Production"],
    deliverables: ["Brand identity", "Regional ordering app", "E-commerce & loyalty", "In-store kiosks", "Always-on social"],
    tags: ["QSR", "Bilingual", "Flagship"],
    color: "#1a0f08",
    heroImage: texas.image("hero"),
    challenge: "Sixteen countries were running sixteen separate digital experiences — different apps, different checkouts, different voices. Every market solved the same problems on its own, and the brand read differently from one border to the next.",
    approach: [
      { title: "One bilingual brand system", body: "A single identity built to work in Arabic and English from the first sketch, so every market speaks with the same voice." },
      { title: "One regional ordering app", body: "We replaced sixteen country-by-country experiences with one market-aware journey — delivery, pick-up and dine-in — built around customizable e-coupons that drive repeat orders." },
      { title: "Commerce, loyalty and kiosks", body: "E-commerce, loyalty and in-store kiosks run on the same platform, so a customer's journey continues from phone to counter." },
      { title: "Always-on social and SEO", body: "Food-first content and search run continuously across the region, fed by the same brand system." },
    ],
    results: {
      summary: "Texas Chicken's Middle East and Africa business now runs through a single agency of record: one brand, one platform and one checkout, instead of sixteen hand-offs.",
      stats: [
        { value: 16, label: "Countries served through one regional platform" },
        { value: 2, label: "Languages in a single bilingual brand system" },
        { value: 1, label: "Checkout, replacing sixteen separate journeys" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Flagship partnership", title: "Sixteen markets. One brand system. No hand-offs." },
      {
        type: "text",
        eyebrow: "The build",
        title: "One regional app. 16 countries. One checkout.",
        body: "We designed and built a single regional ordering app for Africa and the Middle East, replacing 16 fragmented, country-by-country experiences with one bilingual, market-aware journey built to drive repeat orders through customizable e-coupons.",
      },
      {
        type: "image",
        image: texas.media("app", "Texas Chicken ordering app — home screen with delivery, pick-up and dine-in"),
        aspect: "portrait",
        align: "right",
        caption: "One ordering journey, served through a single unified regional platform",
      },
      {
        type: "posts",
        eyebrow: "Web",
        title: "A storefront that speaks Egyptian — and fifteen other markets",
        items: [
          texas.media("web-01", "Texas Chicken website hero — More Flavor"),
          texas.media("web-02", "Bold Texas flavor, rooted in tradition — brand section"),
          texas.media("web-03", "Explore our menu — chicken meals, sandwiches and sides"),
          texas.media("web-04", "What customers say — review carousel"),
        ],
        shape: "wide",
        columns: 2,
      },
      {
        type: "posts",
        eyebrow: "Social",
        title: "Appetite, in every feed",
        items: [
          texas.media("post-01", "Maxi Cheesy sandwich key visual"),
          texas.media("post-02", "Not your average crunch — sandwich campaign"),
          texas.media("post-03", "No meal is complete without your dips"),
          texas.media("post-04", "Every passenger princess deserves a Tex Wrap"),
          texas.media("post-05", "A chicken lover once said — flavor box"),
          texas.media("post-06", "Crunchhhh — hero food photography"),
        ],
      },
    ],
  },
  {
    id: "02",
    slug: "sinclair-aesthetics",
    title: "Sinclair Aesthetics",
    category: "Social Media · B2B Campaigns",
    market: "MENA",
    description: "Positioning global aesthetics science as the regional benchmark — one brand, three sub-brands, one strategy.",
    intro:
      "PSdigital manages Sinclair’s overarching brand alongside its specialized sub-brands across MENA, running social strategy, B2B clinical outreach and localized product launches that position its aesthetics portfolio as the regional benchmark.",
    client: "Sinclair",
    services: ["Social Media Management", "Digital Campaigns", "Production", "Branding"],
    deliverables: ["Regional social strategy", "B2B clinical outreach", "Product launches", "Event campaigns"],
    tags: ["Healthcare", "B2B", "MENA"],
    color: "#1b1030",
    heroImage: sinclair.image("hero"),
    challenge: "A global aesthetics portfolio with several specialised sub-brands had to earn trust with two very different audiences in MENA: consumers who want results, and the clinicians who actually choose the product.",
    approach: [
      { title: "One regional strategy", body: "The master brand and its sub-brands — Ellansé, Maili and the wider portfolio — share one visual language and one social strategy." },
      { title: "Consumer storytelling", body: "Treatment-led content that explains what happens beneath the skin, localised for each market." },
      { title: "B2B clinical outreach", body: "The Sinclair Experts Meeting MEA — agendas, speaker line-ups and cadaver workshops promoted to a clinical audience across the region." },
    ],
    results: {
      summary: "A product calendar became a credibility platform: one regional voice for consumers, and an education platform the region's injectors come back to.",
      stats: [
        { value: 3, label: "Sub-brands unified under one regional strategy" },
        { value: 1, label: "Clinical education platform built around the portfolio" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Positioning", title: "Global aesthetics science, made regional." },
      {
        type: "posts",
        eyebrow: "Consumer",
        title: "Secrets are beneath the skin",
        body: "Product and treatment storytelling for Ellansé, Maili and the wider portfolio — one visual language across three sub-brands.",
        items: [
          sinclair.media("social-01", "Secrets are beneath the skin — Ellansé campaign"),
          sinclair.media("social-02", "Introducing the Sinclair College — register to know more"),
          sinclair.media("social-03", "The Maili treatment areas — interactive treatment guide"),
        ],
        shape: "square",
      },
      {
        type: "text",
        eyebrow: "B2B",
        title: "Where the region’s injectors meet",
        body: "The Sinclair Experts Meeting MEA turned a product calendar into a credibility platform: agendas, speaker line-ups and cadaver workshops promoted to a clinical audience across the region.",
      },
      {
        type: "posts",
        title: "Sinclair Experts Meeting — MEA",
        items: [
          sinclair.media("event-01", "Sinclair Experts Meeting MEA — agenda, 26th April"),
          sinclair.media("event-02", "Meet the speakers — SEM MEA 2025"),
          sinclair.media("event-03", "Cadaver workshop, April 27 — Gulf Medical University, Ajman"),
          sinclair.media("event-04", "Speaker card — Dr Filis Demirgean"),
          sinclair.media("event-05", "Speaker card — Dr Francisco de Melo"),
        ],
      },
      {
        type: "image",
        image: sinclair.media("showcase", "Sinclair campaign shown across mobile and desktop"),
        aspect: "landscape",
        caption: "One regional social and campaign strategy",
      },
    ],
  },
  {
    id: "03",
    slug: "shark-tank-egypt",
    title: "Shark Tank Egypt",
    category: "Social Media · Website",
    market: "Egypt",
    description: "Accounts built from zero and a bilingual home for the show — episodes, sharks and the pitch application.",
    intro:
      "Shark Tank Egypt’s social accounts were built from zero and grown season after season, alongside a bilingual website where viewers watch episodes, meet the sharks and entrepreneurs apply to pitch.",
    client: "Shark Tank Egypt",
    services: ["Social Media Management", "Website & App Development", "Production", "Digital Campaigns"],
    deliverables: ["Always-on social", "Episode campaigns", "Bilingual website", "Applications journey"],
    tags: ["Entertainment", "Bilingual", "Broadcast"],
    color: "#071426",
    heroImage: sharkTank.image("hero"),
    challenge: "A new broadcast format needed an audience online before the first episode aired — and a way to turn viewers into entrepreneurs who apply to pitch.",
    approach: [
      { title: "Social built from zero", body: "We opened the accounts and grew them season after season, with episode drops published to the minute in Arabic and English." },
      { title: "Campaigns and partner formats", body: "Special episodes, teasers and partner formats like She's Next with Visa, each with its own campaign." },
      { title: "A bilingual home for the show", body: "A website to watch every season, meet the sharks and apply to pitch — without leaving the page." },
    ],
    results: {
      summary: "Four seasons in, the show has a following of its own and a steady pipeline of founders applying to pitch.",
      stats: [
        { value: 900, suffix: "M+", label: "Viewership" },
        { value: 170, suffix: "+", label: "Companies pitched" },
        { value: 4, label: "Seasons" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Social media", title: "Built from zero. Grown season after season." },
      {
        type: "posts",
        eyebrow: "Campaign",
        title: "A feed that runs on broadcast time",
        body: "Episode drops, special episodes and partner formats like She’s Next — published to the minute, in Arabic and English.",
        items: [
          sharkTank.media("post-01", "The rise begins — season teaser"),
          sharkTank.media("post-02", "Meet She's Next — 9 finalists, with Visa"),
          sharkTank.media("post-03", "Special episode 2 — today 9:00 PM"),
          sharkTank.media("post-04", "Episode 10 — today at 9 PM"),
          sharkTank.media("post-05", "Innovation is in our DNA"),
          sharkTank.media("post-06", "Wednesday 9PM — the sharks"),
        ],
      },
      {
        type: "text",
        eyebrow: "Website",
        title: "One place to watch, and one place to apply",
        body: "The site carries the show’s numbers up front, keeps every season a click away, introduces the sharks, and turns a viewer into an applicant without leaving the page — in both languages.",
      },
      { type: "fullWidthImage", image: sharkTank.media("web-hero", "Shark Tank Egypt website — welcome to season 4"), caption: "Season 4 — desktop" },
      {
        type: "posts",
        items: [
          sharkTank.media("web-desktop", "Shark Tank Egypt website — full desktop page"),
          sharkTank.media("web-mobile", "Shark Tank Egypt website — mobile experience"),
        ],
        shape: "screen",
        columns: 2,
      },
    ],
  },
  {
    id: "04",
    slug: "million-pound-menu",
    title: "Million Pound Menu",
    category: "Social Media · Website",
    market: "Egypt",
    description: "From kitchen dreams to business realities — episode-paced social and a site where food founders apply.",
    intro:
      "A business show for food entrepreneurs needs a campaign that runs at the pace of broadcast. We built the episode-by-episode social system and the bilingual website where founders read the format, meet the investors and apply to pitch.",
    client: "Million Pound Menu",
    services: ["Social Media Management", "Website & App Development", "Production"],
    deliverables: ["Episode campaigns", "Bilingual website", "Applications journey", "Content production"],
    tags: ["Entertainment", "Food", "Broadcast"],
    color: "#120d0a",
    heroImage: poundMenu.image("hero"),
    challenge: "A business show for food founders had to keep pace with broadcast — a new episode every week — while making it easy for the next founder to apply.",
    approach: [
      { title: "An episode-by-episode social system", body: "A repeatable format for every cuisine and episode, published weekly in two languages." },
      { title: "A bilingual website", body: "The site explains the format, introduces the investors and the pop-up restaurants, and keeps Apply Now within reach on every screen." },
      { title: "Content production", body: "Episode artwork, judge line-ups and finale countdowns produced in-house." },
    ],
    results: {
      summary: "One system carried the whole season on social and on the web — and became the platform later localised for the Saudi edition.",
    },
    content: [
      { type: "hero", eyebrow: "The line", title: "From kitchen dreams to business realities." },
      {
        type: "posts",
        eyebrow: "Social",
        title: "An episode a week, in two languages",
        items: [
          poundMenu.media("post-01", "Comfort food — episode seven"),
          poundMenu.media("post-02", "Season finale — tomorrow at 8:30 PM"),
          poundMenu.media("post-03", "The Mediterranean cuisine — episode nine"),
          poundMenu.media("post-04", "Asian kitchen — episode five"),
          poundMenu.media("post-05", "Sandwiches concept — season finale"),
          poundMenu.media("post-06", "Episode nine — the judges"),
        ],
      },
      {
        type: "twoColumn",
        eyebrow: "Website",
        title: "Behind the menu",
        body: "The site explains the format, introduces the investors and the pop-up restaurants, and puts Apply Now within reach on every screen — desktop, tablet and phone.",
        image: poundMenu.media("web-mobile", "Million Pound Menu website on mobile — behind the menu"),
      },
      { type: "fullWidthImage", image: poundMenu.media("laptop", "Million Pound Menu website shown on a laptop") },
    ],
  },
  {
    id: "05",
    slug: "physiowell",
    title: "Physiowell",
    category: "Performance Marketing",
    market: "Dubai, UAE",
    description: "Always-on paid media that turned clinical trust into a measurable lead pipeline — up to 10x ROAS.",
    intro:
      "Across Facebook, Instagram and Google, PSdigital’s always-on campaigns for this Dubai physiotherapy and chiropractic clinic turned brand trust into a measurable, ongoing lead pipeline for the business.",
    client: "Physiowell",
    services: ["Digital Campaigns", "Social Media Management", "Production"],
    deliverables: ["Always-on paid media", "Creative testing", "Lead generation", "Content production"],
    tags: ["Healthcare", "Performance", "Lead gen"],
    color: "#141a1c",
    heroImage: physiowell.image("hero"),
    challenge: "A Dubai physiotherapy and chiropractic clinic had the clinical reputation, but needed a predictable flow of new patients — and proof of what paid media was actually returning.",
    approach: [
      { title: "Symptom-led creative", body: "Hooks built around what patients actually search for — frozen shoulder, scoliosis, pregnancy support." },
      { title: "Every hook is a test", body: "Each creative runs as its own audience test; the winners are scaled and the rest retired." },
      { title: "Always-on across three channels", body: "Facebook, Instagram and Google run continuously, measured against real lead numbers." },
    ],
    results: {
      summary: "Brand trust turned into a measurable, ongoing lead pipeline — with up to 10x return on ad spend.",
      stats: [
        { value: 10, suffix: "×", label: "Up to, return on ad spend across paid channels" },
        { value: 3, label: "Always-on channels: Facebook, Instagram, Google" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Performance", title: "Turning clinical trust into paid performance." },
      {
        type: "text",
        eyebrow: "Approach",
        title: "Creative tested against real numbers",
        body: "Symptom-led hooks — frozen shoulder, scoliosis, pregnancy support — each running as its own audience test, with the winners scaled and the rest retired. Paid media and continuous testing against real numbers is the discipline behind the result.",
      },
      {
        type: "posts",
        title: "The creative system",
        items: [
          physiowell.media("post-01", "Your pain is our solution — personalised care"),
          physiowell.media("post-02", "Signs your injury isn't fully healed"),
          physiowell.media("post-03", "Ever wondered why frozen shoulder feels worse in summer?"),
          physiowell.media("post-04", "Scoliosis comes in different forms — support starts the same way"),
          physiowell.media("post-05", "Physiotherapy for pregnancy support"),
          physiowell.media("post-06", "30 years old, but does your body move like it?"),
        ],
      },
    ],
  },
  {
    id: "06",
    slug: "million-riyal-menu",
    title: "Million Riyal Menu",
    category: "Social Media · Website",
    market: "Saudi Arabia",
    description: "The Saudi edition of the format — Arabic-first episode campaigns with MBC and Riyadh Season.",
    intro:
      "The Saudi edition of the format, running with MBC and Riyadh Season: Arabic-first episode campaigns and a localized site built on the same platform as its Egyptian counterpart.",
    client: "Million Riyal Menu — MBC & Riyadh Season",
    services: ["Social Media Management", "Website & App Development", "Production"],
    deliverables: ["Arabic-first episode campaigns", "Localized website", "Content production"],
    tags: ["Entertainment", "Arabic", "KSA"],
    color: "#0b1a16",
    heroImage: riyalMenu.image("hero"),
    challenge: "Bring a proven format to Saudi Arabia without it reading as a translation — alongside MBC and Riyadh Season.",
    approach: [
      { title: "Arabic-first campaigns", body: "Episode campaigns written and designed for the Saudi audience first." },
      { title: "A localized platform", body: "Built on the same platform as the Egyptian edition, with navigation, partnerships and the application journey rebuilt for local founders." },
      { title: "Content production", body: "Episode artwork and judge line-ups produced for every week of the season." },
    ],
    results: {
      summary: "The same format, launched in a new market with its own voice — faster, because the platform was already proven.",
      stats: [
        { value: 2, label: "Editions run on one platform — Egypt and Saudi Arabia" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Localization", title: "Same format. Another market. Its own voice." },
      {
        type: "posts",
        title: "Episode campaign",
        items: [
          riyalMenu.media("post-01", "The global kitchen — final episode"),
          riyalMenu.media("post-02", "The global kitchen — with the judges"),
          riyalMenu.media("post-03", "Grab & go — episode six"),
          riyalMenu.media("post-04", "Fine dining — episode seven"),
        ],
      },
      {
        type: "twoColumn",
        eyebrow: "Website",
        title: "A localized platform, not a translation",
        body: "The Saudi site keeps the format’s structure and rebuilds its surface for the market: Arabic-first navigation, Riyadh Season partnership and an application journey tuned to local founders.",
        image: riyalMenu.media("web-mobile", "Million Riyal Menu website on mobile"),
        reverse: true,
      },
      { type: "fullWidthImage", image: riyalMenu.media("laptop", "Million Riyal Menu website shown on a laptop") },
    ],
  },
  {
    id: "07",
    slug: "pharco",
    title: "Pharco",
    category: "Healthcare · Social Media",
    market: "Egypt",
    description: "Health awareness content for one of Egypt’s largest pharmaceutical companies.",
    intro:
      "Health awareness content for one of Egypt’s largest pharmaceutical companies: symptom-led education, World Hepatitis Day and Tour n’ Cure storytelling — written to be understood before it is sold.",
    client: "Pharco Pharmaceuticals",
    services: ["Social Media Management", "Production", "Digital Campaigns"],
    deliverables: ["Awareness campaigns", "Content production", "Always-on social"],
    tags: ["Healthcare", "Awareness", "Egypt"],
    color: "#151310",
    heroImage: pharco.image("hero"),
    challenge: "Health content that sells too early loses trust. One of Egypt's largest pharmaceutical companies needed people to understand a condition before they heard about a product.",
    approach: [
      { title: "Symptom-led education", body: "Posts that start from what people notice — tiredness, hair loss, warning signs — and explain it plainly." },
      { title: "Awareness moments", body: "World Hepatitis Day and Tour n' Cure storytelling that put Egypt's hepatitis C progress in front of the public." },
      { title: "Always-on content", body: "Everyday health reminders produced and published in a consistent visual system." },
    ],
    results: {
      summary: "An awareness system that explains first and sells second — built to be understood, trusted and shared.",
    },
    content: [
      { type: "hero", eyebrow: "Awareness", title: "Explain it first. Sell it second." },
      {
        type: "posts",
        title: "Awareness system",
        items: [
          pharco.media("post-01", "Could these signs mean diabetes?"),
          pharco.media("post-02", "World Hepatitis Day — honoring progress, inspiring hope"),
          pharco.media("post-03", "Reminder: take a 10-minute walk"),
          pharco.media("post-04", "Still losing hair despite trying every solution?"),
          pharco.media("post-05", "Tour n' Cure — bringing the world to Egypt for hepatitis C"),
          pharco.media("post-06", "Vitamin D supports healthy bones, immunity and wellbeing"),
        ],
      },
    ],
  },
  {
    id: "08",
    slug: "m-squared",
    title: "M.Squared",
    category: "Campaign · OOH",
    description: "“Beyond Time.” — a campaign line carried from billboards to street posters.",
    intro:
      "Three verbs — reminisce, belong, achieve — and one line: Beyond Time. The campaign runs across billboards and street posters, shot in lived-in places rather than rendered ones.",
    client: "M Squared",
    services: ["Branding", "Digital Campaigns", "Production"],
    deliverables: ["Campaign platform", "Out-of-home", "Poster system", "Art direction"],
    tags: ["Campaign", "OOH", "Real estate"],
    color: "#141a12",
    heroImage: mSquared.image("hero"),
    challenge: "Real estate advertising tends to look the same: renders, skylines and promises. M Squared needed a campaign people would actually remember.",
    approach: [
      { title: "One line", body: "Beyond Time — built on three verbs: reminisce, belong, achieve." },
      { title: "Places, not renders", body: "Every frame is a moment someone could remember having — a walk, a shoreline, a field at the end of the day." },
      { title: "Out-of-home", body: "A poster system that runs from billboards to street fences, with the brand signing quietly in the corner." },
    ],
    results: {
      summary: "A campaign platform that carries across every format and reads as a feeling first, a development second.",
      stats: [
        { value: 3, label: "Executions carrying one line" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "The line", title: "Reminisce. Belong. Achieve. Beyond time." },
      { type: "fullWidthImage", image: mSquared.media("posters", "Beyond Time poster series on a street fence"), caption: "Three executions, one line" },
      {
        type: "text",
        eyebrow: "Art direction",
        title: "Places, not renders",
        body: "Every frame is a moment someone could remember having: a walk, a shoreline, a field at the end of the day. The brand signs it quietly in the corner.",
      },
    ],
  },
  {
    id: "09",
    slug: "elsewhere-developments",
    title: "Elsewhere Developments",
    category: "Real Estate · Social Media",
    market: "Egypt",
    description: "One developer, several destinations — Ajaza, The One residences and offices.",
    intro:
      "Social and campaign content for a developer’s portfolio of destinations — Ajaza coastal living, The One residences and The One offices — each given its own voice inside a single system.",
    client: "Elsewhere Developments",
    services: ["Social Media Management", "Production", "Digital Campaigns"],
    deliverables: ["Brand-led social", "Launch campaigns", "Content production"],
    tags: ["Real estate", "Lifestyle", "Egypt"],
    color: "#141015",
    heroImage: elsewhere.image("hero"),
    challenge: "One developer, several very different destinations — a coastal community, residences and offices — each needing its own voice without splitting the brand.",
    approach: [
      { title: "One system, several voices", body: "Ajaza, The One residences and The One offices each get their own tone inside a shared visual system." },
      { title: "Launch campaigns", body: "Destination-led campaigns built around lifestyle and location, not floor plans." },
      { title: "Content production", body: "Always-on content for every destination, produced in-house." },
    ],
    results: {
      summary: "A portfolio of destinations that feels like one developer — and still lets each place sell itself.",
      stats: [
        { value: 3, label: "Destinations in one brand system" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Positioning", title: "Coastal living, beyond the season." },
      {
        type: "posts",
        title: "Destination content",
        items: [
          elsewhere.media("post-01", "Live in reach of everything — minutes from Alamein's iconic towers"),
          elsewhere.media("post-02", "Coastal living, beyond the season"),
          elsewhere.media("post-03", "Home and community, built for belonging"),
          elsewhere.media("post-04", "Your lifestyle, built around community"),
          elsewhere.media("post-05", "Work. Shop. Thrive. All within reach — The One offices"),
          elsewhere.media("post-06", "Pools — where you let go, float free and refill your energy"),
        ],
      },
    ],
  },
  {
    id: "10",
    slug: "astk",
    title: "ASTK",
    category: "Fashion · Social Media",
    description: "Seasonal fashion content between the city and the coast.",
    intro:
      "Seasonal content for ASTK: seamless collection launches, sale pushes and lifestyle stories, shot between the city and the coast and cut for a feed that moves quickly.",
    client: "ASTK",
    services: ["Social Media Management", "Production", "Digital Campaigns"],
    deliverables: ["Collection launches", "Seasonal campaigns", "Content production"],
    tags: ["Fashion", "E-commerce", "Lifestyle"],
    color: "#101418",
    heroImage: astk.image("hero"),
    challenge: "Fashion moves in seasons, and the feed moves faster. ASTK needed launches and sale pushes that kept up without the brand losing its look.",
    approach: [
      { title: "Collection launches", body: "The seamless collection introduced through fit, fabric and colour." },
      { title: "Seasonal and sale campaigns", body: "Sale pushes designed in the same language as the collection, so offers never cheapen the brand." },
      { title: "Lifestyle production", body: "Shoots between the city and the coast, cut for a feed that moves quickly." },
    ],
    results: {
      summary: "A seasonal content engine that keeps the brand consistent from launch day to the last sale.",
    },
    content: [
      { type: "hero", eyebrow: "Fashion", title: "Fitting. Flattering. Effortless." },
      {
        type: "posts",
        title: "Collection & sale",
        items: [
          astk.media("square-01", "Seamless collection, fabricated to perfection"),
          astk.media("square-02", "Sale — 70% off on all items"),
          astk.media("square-03", "Up to 50% off on the seamless collection"),
          astk.media("square-04", "Fitting / flattering — activewear on the beach"),
          astk.media("square-05", "Fitting / flattering — seamless colourways"),
          astk.media("square-06", "Comfort / effortless — editorial key visual"),
        ],
        shape: "square",
      },
      {
        type: "posts",
        title: "Lifestyle",
        items: [
          astk.media("portrait-01", "Summer editorial — coastal shoot"),
          astk.media("portrait-02", "Resort wear on the water"),
          astk.media("portrait-03", "Movement — studio to street"),
        ],
      },
    ],
  },
  {
    id: "11",
    slug: "yumochi",
    title: "Yumochi",
    category: "Social Media · Content",
    description: "Product-led social for a Japanese mochi ice cream brand.",
    intro:
      "Product-led social for a Japanese mochi ice cream brand — seasonal moments, new-flavour launches and everyday content shot so that texture does the selling.",
    client: "Yumochi",
    services: ["Social Media Management", "Production", "Digital Campaigns"],
    deliverables: ["Always-on social", "Product launches", "Seasonal campaigns", "Content production"],
    tags: ["FMCG", "Food", "Content"],
    color: "#1b1424",
    heroImage: yumochi.image("hero"),
    challenge: "Mochi ice cream is still new to many people. The product had to be understood — and craved — in a single scroll.",
    approach: [
      { title: "Product first", body: "Close-ups that let the texture do the selling." },
      { title: "Launches and seasons", body: "New flavours, sugar-free launches and seasonal moments planned across the year." },
      { title: "Everyday content", body: "Yumochi placed wherever people go — a cooler box, a bike basket, a ride." },
    ],
    results: {
      summary: "An always-on feed that introduces the product, keeps it seasonal and makes it feel like an everyday treat.",
    },
    content: [
      { type: "hero", eyebrow: "Content", title: "Let the texture do the selling." },
      {
        type: "posts",
        title: "Always-on content",
        items: [
          yumochi.media("post-01", "With Yumochi's refreshing Japanese desserts — cooler box"),
          yumochi.media("post-02", "Yumochi wherever you go — bike basket"),
          yumochi.media("post-03", "New sugar free ice cream spotted"),
          yumochi.media("post-04", "Creamiest texture — mochi close-up"),
          yumochi.media("post-05", "Japanese treat for the ride"),
          yumochi.media("post-06", "Cool for the Christmas treat"),
        ],
      },
    ],
  },
  {
    id: "12",
    slug: "at-home",
    title: "@Home",
    category: "Social Media · Content",
    description: "Furniture content that leads with material, light and the way a room feels.",
    intro:
      "Furniture is bought slowly. The always-on content system for @Home leads with material, light and the way a room feels to live in, carrying product stories across launches and seasons.",
    client: "@Home",
    services: ["Social Media Management", "Production", "Digital Campaigns"],
    deliverables: ["Always-on social", "Product launches", "Content production"],
    tags: ["Retail", "Interiors", "Content"],
    color: "#18140f",
    heroImage: atHome.image("hero"),
    challenge: "Furniture is bought slowly and felt before it is bought. Social had to convey material, comfort and light through a screen.",
    approach: [
      { title: "Material and light", body: "Every product story leads with texture, light and how a room feels to live in." },
      { title: "Product launches", body: "New pieces — Zen, Nomad, Alma — each introduced with its own story." },
      { title: "Always-on content", body: "A consistent system that carries the brand across launches and seasons." },
    ],
    results: {
      summary: "A calm, consistent feed that sells the feeling of a room, not only the piece in it.",
    },
    content: [
      { type: "hero", eyebrow: "Content", title: "A gentle presence and natural elegance." },
      {
        type: "posts",
        title: "Product storytelling",
        items: [
          atHome.media("post-01", "New Zen sofa — material, look, feel"),
          atHome.media("post-02", "The new Nomad sofa, made for comfort"),
          atHome.media("post-03", "Home and community — living room set"),
          atHome.media("post-04", "Zen sofa — your multi-moment spot"),
          atHome.media("post-05", "All in Alma sofa — a gentle presence"),
          atHome.media("post-06", "Yoga chair — designed to stand out"),
        ],
      },
    ],
  },
  {
    id: "13",
    slug: "eea",
    title: "Egypt's Entrepreneur Awards",
    category: "Awards · Campaign",
    market: "Egypt",
    description: "A campaign system built around one sculptural trophy and editorial type.",
    intro:
      "The campaign system for Egypt’s Entrepreneur Awards — category announcements, teasers and ceremony countdowns — built around a single sculptural trophy and editorial typography.",
    client: "Egypt's Entrepreneur Awards",
    services: ["Branding", "Digital Campaigns", "Social Media Management", "Production"],
    deliverables: ["Campaign identity", "Category announcements", "Ceremony countdown", "Content production"],
    tags: ["Awards", "Campaign", "Editorial"],
    color: "#141017",
    heroImage: eea.image("hero"),
    challenge: "An awards programme with many categories needed one recognisable identity — and a campaign that built anticipation all the way to the ceremony.",
    approach: [
      { title: "Campaign identity", body: "A system built around one sculptural trophy and editorial typography." },
      { title: "Category announcements", body: "Each award introduced with its own post inside the same system." },
      { title: "Teasers and countdown", body: "A build-up campaign that ran all the way to ceremony night." },
    ],
    results: {
      summary: "One identity that holds every category together, and a campaign that turned an announcement calendar into an event.",
    },
    content: [
      { type: "hero", eyebrow: "Campaign", title: "People of now." },
      {
        type: "posts",
        title: "Category system",
        items: [
          eea.media("post-01", "The Content Innovation Award"),
          eea.media("post-02", "Big things are coming — teaser"),
          eea.media("post-03", "Product Design Innovation — form & function"),
          eea.media("post-04", "Environmental sustainability — significant contributions in eco-friendly practices"),
          eea.media("post-05", "Quick serve restaurant champion — excellence in a fast-paced world"),
          eea.media("post-06", "It all starts on August 11th"),
        ],
        shape: "square",
      },
    ],
  },
  {
    id: "14",
    slug: "moishi",
    title: "Moishi",
    category: "App Design",
    market: "UAE",
    description: "An ordering app for a mochi and ice cream brand, built for the small, frequent basket.",
    intro:
      "An ordering app for a mochi and ice cream brand: flavours, best sellers and reorder within a couple of taps, designed to make a small basket feel effortless.",
    client: "Moishi",
    services: ["Website & App Development", "Branding"],
    deliverables: ["App UI/UX", "Ordering journey", "Reorder & favourites"],
    tags: ["App", "UI/UX", "Food"],
    color: "#1a1220",
    heroImage: moishi.image("hero"),
    challenge: "Small, frequent orders are won or lost on friction. The app had to make a single mochi feel worth ordering — and the second order effortless.",
    approach: [
      { title: "Flavours lead", body: "The menu opens on mochi flavours, with best sellers one scroll down." },
      { title: "Reorder, always there", body: "Reorder and favourites live in a permanent tab, because the second order matters more than the first." },
      { title: "A short ordering journey", body: "From craving to checkout in a couple of taps." },
    ],
    results: {
      summary: "An ordering journey designed around the small basket — fast to use, and easy to come back to.",
      stats: [
        { value: 2, label: "Taps from craving to checkout" },
      ],
    },
    content: [
      { type: "hero", eyebrow: "Product", title: "Two taps from craving to checkout." },
      {
        type: "text",
        eyebrow: "UI/UX",
        title: "Designed for the small, frequent basket",
        body: "Mochi flavours lead, best sellers sit one scroll down, and reorder is a permanent tab — because the second order matters more than the first.",
      },
    ],
  },
];

export function getPortfolioProject(slug: string) {
  return portfolio.find((project) => project.slug === slug);
}

/** Wraps around so the last project links back to the first. */
export function getAdjacentPortfolio(slug: string) {
  const index = portfolio.findIndex((project) => project.slug === slug);
  const total = portfolio.length;
  return {
    previous: portfolio[(index - 1 + total) % total],
    next: portfolio[(index + 1) % total],
  };
}

export const portfolioHref = (slug: string) => `/portfolio/${slug}`;
