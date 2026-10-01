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
  /** "About the role" on the role's own page, one entry per paragraph. */
  description: string[];
  responsibilities: string[];
  requirements: string[];
};

export const roles: Role[] = [
  {
    id: "senior-motion-designer",
    title: "Senior Motion Designer",
    department: "Motion",
    location: "Alexandria",
    type: "Full-time · On-site",
    summary: "Lead motion, animation, editing and AI-powered video across digital platforms and campaigns.",
    description: [
      "PSdigital is looking for a Senior Motion Designer to lead the visual execution of creative ideas through motion, animation, video editing, and visual storytelling across digital platforms and campaigns, combining traditional craft with AI-powered video production.",
    ],
    responsibilities: [
      "Lead motion design and video editing for digital content and campaigns.",
      "Translate creative concepts into impactful motion and video edited pieces.",
      "Develop visual styles, storyboards, and motion treatments.",
      "Lead AI video generation workflows, from prompt development to integrating AI-generated footage into final productions.",
      "Explore and evaluate new AI video tools and techniques, and guide the team on best practices.",
      "Collaborate with creative, design, and content teams.",
      "Guide motion and video editing projects from concept to final delivery.",
      "Ensure quality and consistency across all outputs.",
    ],
    requirements: [
      "4+ years of experience in motion design.",
      "Strong portfolio showcasing motion, animation, and edited video work.",
      "Advanced proficiency in After Effects and Adobe Creative Suite.",
      "Proven experience with AI video generation tools (e.g. Higgsfield, Flow, etc.) and advanced prompt writing.",
      "Strong understanding of animation, editing, typography, and visual storytelling.",
      "Strong creative direction and problem-solving skills.",
      "Excellent attention to detail and ability to meet deadlines.",
    ],
  },
  {
    id: "mid-level-motion-designer",
    title: "Mid-level Motion Designer",
    department: "Motion",
    location: "Alexandria",
    type: "Full-time · On-site",
    summary: "Bring ideas to life through motion, animation and video editing, with traditional and AI-powered workflows.",
    description: [
      "PSdigital is looking for a Mid-level Motion Designer to bring creative ideas to life through motion, animation, video editing, and visual storytelling across social media, campaigns, and digital content, using both traditional and AI-powered production workflows.",
    ],
    responsibilities: [
      "Create motion graphics and animations for digital content.",
      "Turn creative concepts and static designs into motion.",
      "Edit video content, including cutting, pacing, sound, and colour correction/grading.",
      "Generate and refine video content using AI video tools, and integrate AI-generated footage into final edits.",
      "Develop storyboards and visual treatments.",
      "Collaborate with design and content teams.",
      "Adapt motion content across platforms and formats.",
    ],
    requirements: [
      "2–4 years of experience in motion design.",
      "Strong portfolio showing motion design and edited video work.",
      "Proficiency in After Effects and Adobe Creative Suite.",
      "Good experience with AI video generation tools (e.g. Higgsfield, Flow, etc.) and prompt writing.",
      "Strong understanding of animation, editing, typography, and visual storytelling.",
      "Creative, detail-oriented, and able to meet deadlines.",
    ],
  },
  {
    id: "senior-content-creator",
    title: "Senior Content Creator",
    department: "Content",
    location: "Alexandria",
    type: "Full-time",
    summary: "Lead social media content across brands, from ideas and calendars to scripts and shoots.",
    description: [
      "PSdigital is looking for a Senior Content Creator to lead social media content across brands and campaigns. You will turn objectives into clear ideas, content calendars, scripts, and shoots, ensuring quality from brief to final delivery.",
    ],
    responsibilities: [
      "Lead campaign ideas, content calendars, captions, scripts, hooks, and CTAs.",
      "Develop engaging short-form video, Reel, and social content ideas.",
      "Lead content shoots, including moodboards, shot lists, on-ground direction, and final content review.",
      "Use audience, performance, competitor, and trend insights to strengthen content.",
      "Ensure all content reflects the brand tone, campaign objective, and audience needs.",
      "Collaborate with design, motion, account management, and performance teams.",
      "Review junior content creators’ work and provide clear creative feedback.",
      "Use AI tools for research and ideation while maintaining originality and quality.",
    ],
    requirements: [
      "4–6 years of experience in social media content creation or a related role.",
      "Proven experience leading content shoots and developing short-form video content.",
      "Strong Arabic and English writing skills.",
      "Strong understanding of social media platforms, trends, and content formats.",
      "Experience in campaign ideation, social copywriting, and video scripting.",
      "Ability to lead, present ideas, and manage multiple brands and deadlines.",
      "Portfolio demonstrating strong social content, campaign thinking, shoots, and writing.",
    ],
  },
  {
    id: "junior-community-manager",
    title: "Junior Community Manager",
    department: "Content",
    location: "Alexandria",
    type: "Full-time",
    summary: "Help manage and grow online communities, and turn conversations into insights for our brands.",
    description: [
      "PSdigital is looking for a Junior Community Manager to help manage and grow online communities across social media and digital platforms. You’ll engage with audiences, respond to their questions, and help turn conversations into insights that make our brands stronger.",
    ],
    responsibilities: [
      "Support the management of online communities across social media and digital platforms.",
      "Monitor community channels and respond to comments, questions, and customer inquiries in a timely and professional manner.",
      "Assist in developing and executing community engagement activities and campaigns.",
      "Monitor community sentiment and identify recurring questions, concerns, and opportunities.",
      "Assist in tracking engagement metrics and preparing basic performance reports.",
      "Stay up to date with social media trends, new platforms, and community management practices.",
      "Learn and utilize new community management, social listening, AI, and analytics tools.",
    ],
    requirements: [
      "Bachelor's degree in Business, Marketing, Communications, or a related field.",
      "0–2 years of experience in community management, social media, customer service, or a related field.",
      "Strong written and verbal communication skills.",
      "Basic understanding of social media platforms and community engagement practices.",
      "Strong interpersonal skills and a customer-focused mindset.",
      "Eagerness to learn and develop within the community management field.",
      "Ability to work collaboratively within a team.",
      "Good organizational and time management skills.",
      "Basic knowledge of social media management and analytics tools.",
      "Willingness to learn and adopt new tools, platforms, and industry trends.",
    ],
  },
  {
    id: "senior-account-manager",
    title: "Senior Account Manager",
    department: "Client Service",
    location: "Alexandria",
    type: "Full-time",
    summary: "Lead client relationships and drive digital projects from brief to delivery.",
    description: [
      "PSdigital is looking for a Senior Account Manager to lead client relationships, drive digital projects, and keep teams and deliverables moving forward.",
    ],
    responsibilities: [
      "Manage client accounts and build strong, long-term relationships.",
      "Lead digital projects from brief to delivery.",
      "Develop digital strategies aligned with client goals.",
      "Identify opportunities to drive growth and improve client results.",
      "Coordinate with creative, content, media, and development teams.",
      "Manage multiple projects, timelines, and priorities.",
      "Prepare and present recommendations, reports, and campaign results.",
      "Monitor and analyze digital campaigns and social media performance.",
    ],
    requirements: [
      "2+ years of relevant account management experience.",
      "Experience in digital or creative agencies.",
      "Strong client communication and relationship management skills.",
      "Good understanding of digital marketing and social media.",
      "Ability to manage multiple accounts.",
      "Strong analytical and problem-solving skills.",
    ],
  },
  {
    id: "mid-level-account-manager",
    title: "Mid-level Account Manager",
    department: "Client Service",
    location: "Alexandria",
    type: "Full-time",
    summary: "Manage client relationships and turn client needs into clear, effective work across teams.",
    description: [
      "PSdigital is looking for a Mid-level Account Manager to manage client relationships, coordinate digital projects, and turn client needs into clear, effective work across teams.",
    ],
    responsibilities: [
      "Manage client accounts and build strong relationships.",
      "Coordinate projects from brief to delivery.",
      "Communicate client needs and feedback with internal teams.",
      "Support digital strategies and campaign planning.",
      "Manage timelines, priorities, and deliverables.",
      "Prepare client updates, reports, and presentations.",
    ],
    requirements: [
      "2–4 years of experience in account management.",
      "Experience in a digital or creative agency.",
      "Strong client communication and relationship management skills.",
      "Good understanding of digital marketing and social media.",
      "Strong organization and project management skills.",
      "Ability to manage multiple accounts and priorities.",
    ],
  },
  {
    id: "finance-specialist",
    title: "Finance Specialist",
    department: "Finance",
    location: "Alexandria",
    type: "Full-time · On-site",
    summary: "Support financial operations, reporting and analysis, and keep our finances accurate and organized.",
    description: [
      "PSdigital is looking for a Finance Specialist to support financial operations, reporting, and analysis across the business. You’ll help keep our finances accurate, organized, and aligned with business needs.",
    ],
    responsibilities: [
      "Prepare regular financial reports and analysis.",
      "Support budgeting and cash flow management.",
      "Monitor financial records and transactions.",
      "Assist with financial planning and forecasting.",
      "Coordinate with internal teams on financial matters.",
      "Handle tax-related processes and e-portal submissions.",
      "Support management with financial insights and reports.",
    ],
    requirements: [
      "Bachelor’s degree in Finance, Accounting, or a related field.",
      "1–3 years of relevant finance experience.",
      "Strong Excel, financial analysis, and reporting skills.",
      "Familiarity with ERP and financial software.",
      "Experience with the Egyptian tax e-portal.",
      "Strong organization and attention to detail.",
    ],
  },
  {
    id: "hr-specialist",
    title: "HR Specialist",
    department: "People",
    location: "Alexandria",
    type: "Full-time · On-site",
    summary: "Help build the team, culture and processes, from recruitment to engagement.",
    description: [
      "PSdigital is looking for an HR Specialist to help build the team, culture, and processes that keep us moving forward. From recruitment to engagement, you’ll play a key role in bringing great people together.",
    ],
    responsibilities: [
      "Support HR plans and initiatives.",
      "Manage the full recruitment cycle.",
      "Coordinate employee onboarding and offboarding.",
      "Maintain employee records and HRIS data.",
      "Support performance reviews and development plans.",
      "Organize employee engagement and wellness activities.",
      "Handle employee HR inquiries.",
      "Ensure HR and labor law compliance.",
      "Prepare HR reports and analytics.",
    ],
    requirements: [
      "Bachelor’s degree in HR, Business, or a related field.",
      "1–3 years of relevant HR experience.",
      "Recruitment and HR operations experience.",
      "Understanding of agency workflows.",
      "Strong communication and interpersonal skills.",
      "Familiarity with HRIS and reporting.",
      "Interest in culture and employee experience.",
    ],
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
