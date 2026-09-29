/**
 * Content for the /careers page.
 *
 * Roles are a starting list — edit, add or remove entries here and the page
 * updates. Applications go to the studio inbox with the role in the subject
 * line until an ATS is connected.
 */

import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export type Role = {
  id: string;
  title: string;
  /** Filter key, e.g. "Design" — translated per locale, so any string. */
  department: string;
  /** e.g. "Alexandria / Remote". */
  location: string;
  /** e.g. "Full-time", "Contract", "Internship". */
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

export const roles: Role[] = [
  {
    id: "senior-art-director",
    title: "Senior Art Director",
    department: "Design",
    location: "Alexandria",
    type: "Full-time",
    summary: "Lead campaign and brand visuals for QSR, healthcare and real-estate clients across sixteen markets.",
    responsibilities: [
      "Own the visual direction of campaigns from key visual to always-on social",
      "Direct photography, film and motion with the in-house production team",
      "Mentor designers and review work before it reaches the client",
    ],
    requirements: ["6+ years in an agency or studio", "A portfolio of bilingual brand and campaign work", "Fluent in Figma and the Adobe suite"],
  },
  {
    id: "product-designer",
    title: "Product Designer (UI/UX)",
    department: "Design",
    location: "Alexandria / Remote",
    type: "Full-time",
    summary: "Design ordering apps, loyalty programmes and e-commerce journeys that run in more than one language.",
    responsibilities: [
      "Turn research and business goals into flows, wireframes and high-fidelity UI",
      "Build and maintain design systems that scale across markets",
      "Work daily with engineers from hand-off to release",
    ],
    requirements: ["4+ years designing shipped digital products", "Experience with RTL and bilingual interfaces", "Comfortable prototyping and testing with users"],
  },
  {
    id: "motion-designer",
    title: "Motion Designer",
    department: "Motion",
    location: "Alexandria",
    type: "Full-time",
    summary: "Bring brands to life in 2D and 3D for social, broadcast and product films.",
    responsibilities: [
      "Animate campaign assets, logo reveals and product stories",
      "Collaborate with art directors on storyboards and style frames",
      "Deliver for every format, from stories to TVC",
    ],
    requirements: ["3+ years in motion design", "After Effects and Cinema 4D or Blender", "A reel that shows range in timing and typography"],
  },
  {
    id: "frontend-engineer",
    title: "Front-end Engineer",
    department: "Development",
    location: "Alexandria / Remote",
    type: "Full-time",
    summary: "Build the websites, ordering platforms and kiosks our design team dreams up, with motion that feels like the brand.",
    responsibilities: [
      "Ship React and Next.js applications with attention to performance and accessibility",
      "Implement animation and interaction with care for every device",
      "Pair with designers and back-end engineers throughout the build",
    ],
    requirements: ["4+ years with React and TypeScript", "Experience with animation libraries and performance budgets", "Comfortable with CI, testing and code review"],
  },
  {
    id: "performance-marketing-manager",
    title: "Performance Marketing Manager",
    department: "Performance",
    location: "Dubai / Remote",
    type: "Full-time",
    summary: "Plan, buy and optimise paid media for regional brands, measured against real numbers.",
    responsibilities: [
      "Own media plans across Meta, Google, TikTok and Snap",
      "Run continuous testing and report on return, not impressions",
      "Work with creatives to turn insights into better performing assets",
    ],
    requirements: ["4+ years running paid media in MENA", "Platform certifications and a strong grasp of tracking", "Fluent in English; Arabic is a plus"],
  },
  {
    id: "senior-copywriter",
    title: "Senior Copywriter (Arabic / English)",
    department: "Content",
    location: "Alexandria",
    type: "Full-time",
    summary: "Write brand voices, campaigns and social content that read naturally in both languages.",
    responsibilities: [
      "Develop verbal identities and campaign concepts",
      "Write and adapt copy for social, web, film and retail",
      "Guide junior writers and keep tone consistent across markets",
    ],
    requirements: ["5+ years in advertising or branding", "Native-level Arabic and English", "A portfolio that proves ideas, not just words"],
  },
  {
    id: "account-manager",
    title: "Account Manager",
    department: "Strategy",
    location: "Dubai",
    type: "Full-time",
    summary: "Be the day-to-day partner for regional clients and the bridge to every team in the studio.",
    responsibilities: [
      "Lead client relationships, briefs and timelines",
      "Translate business goals into clear work for strategy, creative and performance",
      "Keep projects on scope, on time and on brand",
    ],
    requirements: ["3+ years in an agency account role", "Experience with QSR, retail or real-estate clients", "Calm under pressure and precise in writing"],
  },
  {
    id: "design-internship",
    title: "Design Internship",
    department: "Design",
    location: "Alexandria",
    type: "Internship",
    summary: "Three months inside a working studio, on real briefs, with a mentor from the creative team.",
    responsibilities: ["Support art directors on campaign and brand projects", "Prepare assets and layouts for review", "Join critiques, shoots and client presentations"],
    requirements: ["A final-year student or recent graduate", "A portfolio of personal or academic work", "Curiosity and a willingness to ask questions"],
  },
];

export const departments = Array.from(new Set(roles.map((role) => role.department)));

export const careersPage = {
  hero: {
    label: "Careers",
    title: ["Join the", "connected", "flow"],
    intro:
      "80+ strategists, designers, engineers, writers and producers in Alexandria and Dubai. We hire people who want to see an idea through, from the first sketch to the numbers it moves.",
    meta: `${roles.length} open roles · ${siteConfig.location}`,
  },
  statement: {
    label: "Life at PSdigital",
    action: "See open roles",
    text: "We are a studio, not a factory. Every discipline sits in the same room, every project is seen through to the end, and the work goes out with your name on it.",
  },
  values: {
    label: "What we believe",
    title: ["Good work", "comes from", "good rooms"],
    items: [
      { title: "Craft over volume", body: "Fewer projects, done properly. We would rather ship one system that runs in sixteen markets than sixteen versions of the same thing." },
      { title: "Everyone in the room", body: "Strategy, design, motion, content, development and performance share the brief, the timeline and the credit." },
      { title: "Measured, not guessed", body: "Ideas are tested against real numbers. That is how a campaign reaches 10x return, and how we learn." },
      { title: "Growth is the job", body: "Mentorship, reviews and time to learn are part of the week, not a perk we mention in interviews." },
    ],
    perks: ["Hybrid and remote roles", "Learning budget", "Health insurance", "Paid time to recharge", "Alexandria and Dubai studios", "Awards-winning team"],
  },
  roles: {
    label: "Open roles",
    title: ["Where you", "could fit"],
    empty: "No roles match this filter right now. Send an open application and we will keep you in mind.",
    apply: "Apply for this role",
    allTeams: "All teams",
    filterLabel: "Filter by team",
    youWill: "You will",
    youBring: "You bring",
  },
  process: {
    label: "How we hire",
    title: ["Four steps,", "no surprises"],
    steps: [
      { title: "Apply", body: "Send your portfolio or CV and a few lines about the work you are proudest of. We reply to everyone." },
      { title: "Meet the team", body: "A conversation with the lead of your discipline about how you work, not a quiz." },
      { title: "Work together", body: "A short, paid exercise on a real brief, followed by a review with the team you would join." },
      { title: "Offer", body: "A clear offer with role, salary and start date, usually within two weeks of the first call." },
    ],
  },
  cta: {
    label: "No role fits yet?",
    title: ["Send an", "open", "application"],
    button: "Introduce yourself",
    subject: "Open application — PSdigital",
  },
  /** Composed application email; {role} and {location} are filled in. */
  application: {
    subject: "Application — {role}",
    body: "Hi PSdigital,\n\nI'd like to apply for the {role} role ({location}).\n\nPortfolio / CV:\n\nA few lines about me:\n",
  },
} as const;

export type CareersPage = Localized<typeof careersPage>;

const fill = (template: string, role: Role) => template.replaceAll("{role}", role.title).replaceAll("{location}", role.location);

export const applyHref = (role: Role, application: CareersPage["application"] = careersPage.application) =>
  `mailto:${siteConfig.email}?subject=${encodeURIComponent(fill(application.subject, role))}&body=${encodeURIComponent(fill(application.body, role))}`;
