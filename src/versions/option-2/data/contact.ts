/**
 * Content for the /contact page.
 *
 * The form has no backend yet: submitting composes an email to the studio
 * inbox with every field in the body. Wire `buildEnquiryHref` to an API route
 * or form provider when one is available.
 */

import type { Localized } from "@/i18n/config";
import { siteConfig } from "@/lib/site";

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  interests: string[];
  budget: string | null;
  message: string;
};

export const contactPage = {
  hero: {
    label: "Contact",
    title: ["Let's talk", "about what's", "next"],
    intro:
      "Tell us about the brand, the launch or the problem you are working on. A strategist and a creative lead read every enquiry and reply within two working days.",
    meta: siteConfig.location,
  },
  form: {
    label: "Start a project",
    title: "Tell us what you are building",
    fields: {
      name: { label: "Your name", placeholder: "Full name" },
      email: { label: "Email", placeholder: "you@company.com" },
      company: { label: "Company", placeholder: "Brand or organisation" },
      message: { label: "The project", placeholder: "What are you trying to achieve, and by when?" },
    },
    interests: { label: "I'm interested in", options: siteConfig.services.map((service) => service.title) },
    budgets: { label: "Budget range", options: ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"] },
    submit: "Send enquiry",
    sending: "Opening your email…",
    success: { title: "Thanks — your enquiry is on its way.", body: "Your email app should have opened with the details filled in. If it did not, write to us directly." },
    privacy: "We only use your details to reply to this enquiry.",
  },
  details: {
    label: "Direct",
    nextSteps: {
      title: "What happens next",
      steps: [
        { title: "We read it", body: "A strategist and a creative lead review your brief within two working days." },
        { title: "We talk", body: "A 30-minute call to understand goals, markets and timing." },
        { title: "We propose", body: "A scoped plan with team, timeline and investment, usually within a week." },
      ],
    },
  },
  offices: {
    label: "Studios",
    title: ["Two cities,", "one team"],
    image: { src: "/images/site/contact.webp", alt: "The PSdigital studio" },
  },
  cta: {
    label: "Prefer to write?",
    title: ["Say", "hello"],
  },
  /** Labels used in the composed enquiry email. */
  email: {
    subject: "Project enquiry",
    name: "Name",
    email: "Email",
    company: "Company",
    interests: "Interested in",
    budget: "Budget",
    project: "The project",
    separator: ", ",
  },
} as const;

export type ContactPage = Localized<typeof contactPage>;

export function buildEnquiryHref(enquiry: Enquiry, labels: ContactPage["email"] = contactPage.email) {
  const subject = `${labels.subject} — ${enquiry.company || enquiry.name}`;
  const lines = [
    `${labels.name}: ${enquiry.name}`,
    `${labels.email}: ${enquiry.email}`,
    `${labels.company}: ${enquiry.company || "—"}`,
    `${labels.interests}: ${enquiry.interests.length ? enquiry.interests.join(labels.separator) : "—"}`,
    `${labels.budget}: ${enquiry.budget ?? "—"}`,
    "",
    `${labels.project}:`,
    enquiry.message,
  ];
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
