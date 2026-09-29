import { stripLocale } from "@/i18n/config";

export const siteConfig = {
  name: "PSdigital",
  shortName: "PSdigital",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.psdigital.me",
  tagline: "Connected flow, infinite possibilities",
  description:
    "PSdigital is a full-service digital agency built for MENA and beyond — branding, websites and apps, production, digital campaigns, social media and SEO, all in-house.",
  email: "info@psdigital.me",
  website: "www.psdigital.me",
  location: "Alexandria — Dubai",
  timeZone: "Africa/Cairo",
  offices: [
    { city: "Alexandria", address: "8 Al Amir Gamil Street, Zezenia, Alexandria, Egypt" },
    { city: "Dubai", address: "Dubai Design District, Building 3, Dubai, UAE" },
  ],
  /** Primary navigation — the studio header shows the first three, menus show all. */
  nav: [
    { label: "Services", href: "/services" },
    { label: "Case studies", href: "/case-studies" },
    { label: "Agency", href: "/about" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  /** Secondary destinations listed in the menu and footer after the primary nav. */
  moreNav: [
    { label: "Work", href: "/projects" },
    { label: "Portfolio", href: "/portfolio" },
  ],
  /** Routes rendered inside the immersive studio shell (own header, preloader and footer). */
  studioRoutes: ["/", "/services", "/case-studies", "/team", "/careers", "/contact"],
  /** Add the real handles here — the profile deck lists only the website and email. */
  socials: [] as { label: string; href: string }[],
  services: [
    {
      title: "Branding",
      description: "Positioning, identity and bilingual brand systems that travel across markets.",
    },
    {
      title: "Website & App Development",
      description: "E-commerce, loyalty, kiosks and ordering apps — designed and engineered in-house.",
    },
    {
      title: "Production",
      description: "Photography, film and motion produced by our own studio team.",
    },
    {
      title: "Digital Campaigns",
      description: "Always-on paid media tested against real numbers, not impressions.",
    },
    {
      title: "Social Media Management",
      description: "Strategy, content and community for brands that publish every day.",
    },
    {
      title: "SEO",
      description: "Technical and content SEO that compounds long after a campaign ends.",
    },
  ],
  /** Logos cropped from the company profile — file lives in /public/images/clients. */
  clients: [
    { name: "Texas Chicken", file: "texas-chicken" },
    { name: "Burger King", file: "burger-king" },
    { name: "Toyota", file: "toyota" },
    { name: "P&G", file: "pg" },
    { name: "Hilton Alexandria King's Ranch", file: "hilton-alexandria" },
    { name: "Little Caesars", file: "little-caesars" },
    { name: "Church's Texas Chicken", file: "churchs-texas-chicken" },
    { name: "Madinaty New Cairo", file: "madinaty" },
    { name: "Nour Eldin Elsherif", file: "nour-eldin-elsherif" },
    { name: "Ithra Dubai", file: "ithra-dubai" },
    { name: "Egypt's Entrepreneur Awards", file: "eea" },
    { name: "Pharco Pharmaceuticals", file: "pharco" },
    { name: "TMG", file: "tmg" },
    { name: "Jetour", file: "jetour" },
    { name: "ASTK", file: "astk" },
    { name: "Shark Tank Egypt", file: "shark-tank-egypt" },
    { name: "Innovative Media Productions", file: "imp" },
    { name: "Ministry of Energy & Infrastructure", file: "moei-uae" },
    { name: "Mansi Eyewear", file: "mansi-eyewear" },
    { name: "Zee", file: "zee" },
  ],
  /** Headline facts from the company profile. */
  stats: [
    { value: "80+", label: "In-house specialists across strategy, design, motion, content, development, UI/UX & performance." },
    { value: "6", label: "Core disciplines delivered end to end, without subcontracting." },
    { value: "2023", label: "Digital Agency of the Year, Corporate LiveWire Innovation & Excellence Awards." },
  ],
  team: {
    lead: { name: "Seif El Sawaf", role: "Chief Executive Officer", image: "/images/site/ceo.webp" },
    members: [
      { name: "Pery Khalil", role: "Associate Creative Director" },
      { name: "Mirna Magdy", role: "Art Director" },
      { name: "Mostafa Askary", role: "Motion Team Lead" },
      { name: "Nouran Ayman", role: "Copy Team Lead" },
      { name: "Hesham Zahran", role: "Performance Lead" },
    ],
  },
  /** The four-step process from the company profile. */
  process: [
    {
      title: "Discover",
      body: "Audience and competitive audits: the groundwork that showed Texas Chicken needed one bilingual brand system, not 16 separate ones.",
    },
    {
      title: "Strategize",
      body: "A point of view before a plan: reframing Sinclair's science as a MENA credibility benchmark, not a product catalog.",
    },
    {
      title: "Create & build",
      body: "Design, motion, copy and development, entirely in-house — from Shark Tank Egypt's accounts built from zero to full UI/UX builds.",
    },
    {
      title: "Launch & optimize",
      body: "Paid media and continuous testing against real numbers: the discipline behind Physiowell's up to 10x ROAS.",
    },
  ],
  /** Why clients stay — four reasons from the company profile. */
  reasons: [
    {
      title: "Everything in-house",
      body: "Strategy, brand, web development, UI/UX, motion, content and performance sit under one roof, with nothing outsourced and nothing lost between vendors.",
    },
    {
      title: "Strategy before execution",
      body: "We reframe brands before we design for them: we positioned Texas Chicken as “a global brand that speaks Egyptian,” not the reverse.",
    },
    {
      title: "Proven at both ends of the market",
      body: "From P&G, Burger King, Toyota and Sinclair to fast-growing regional brands like Shark Tank Egypt and ASTK.",
    },
    {
      title: "Recognized for it",
      body: "2023 Digital Agency of the Year (Corporate LiveWire) and CEO of the Year (Middle East Prestige Awards).",
    },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];

/** True for paths that render inside the studio shell, including nested routes such as /case-studies/[slug]. Locale prefixes are ignored. */
export function isStudioRoute(path: string) {
  const { pathname } = stripLocale(path);
  return siteConfig.studioRoutes.some((route) => (route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`)));
}
