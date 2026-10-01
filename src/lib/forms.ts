"use server";

/**
 * Form submissions (careers applications, project briefs and contact messages).
 *
 * Delivery: set FORMS_WEBHOOK_URL to any endpoint that accepts
 * multipart/form-data (Zapier, Make, Formspree, an ATS…). Every submission is
 * posted there with a `form` field ("application" | "enquiry" | "contact"); applications
 * include the uploaded PDF. Without the variable, the action validates and
 * returns "fallback", and the client opens a pre-filled email instead — we
 * never tell a visitor their message was sent when it was not.
 */

export type FormStatus = "idle" | "invalid" | "success" | "fallback" | "error";
export type FormState<Field extends string> = { status: FormStatus; errors: Partial<Record<Field, true>> };

export type ApplicationField = "name" | "email" | "work" | "url" | "file" | "consent";
export type EnquiryField = "name" | "email" | "message";
export type ContactField = "name" | "email" | "phone" | "message";

const MAX_FILE = 8 * 1024 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

const text = (data: FormData, key: string, max = 2000) => String(data.get(key) ?? "").trim().slice(0, max);

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function deliver(form: "application" | "enquiry" | "contact", data: FormData): Promise<"success" | "fallback" | "error"> {
  const endpoint = process.env.FORMS_WEBHOOK_URL;
  if (!endpoint) return "fallback";
  const body = new FormData();
  body.set("form", form);
  body.set("submittedAt", new Date().toISOString());
  for (const [key, value] of data.entries()) {
    if (key.startsWith("$ACTION") || key === "website") continue;
    if (value instanceof File && value.size === 0) continue;
    body.append(key, value);
  }
  try {
    const response = await fetch(endpoint, { method: "POST", body, signal: AbortSignal.timeout(15_000) });
    return response.ok ? "success" : "error";
  } catch {
    return "error";
  }
}

export async function submitApplication(_previous: FormState<ApplicationField>, data: FormData): Promise<FormState<ApplicationField>> {
  // Honeypot: bots fill every field; people never see this one.
  if (text(data, "website")) return { status: "success", errors: {} };

  const errors: FormState<ApplicationField>["errors"] = {};
  const portfolio = text(data, "portfolio", 500);
  const file = data.get("file");
  const hasFile = file instanceof File && file.size > 0;

  if (!text(data, "name", 120)) errors.name = true;
  if (!EMAIL.test(text(data, "email", 200))) errors.email = true;
  if (!portfolio && !hasFile) errors.work = true;
  if (portfolio && !isHttpUrl(portfolio)) errors.url = true;
  if (hasFile && (file.type !== "application/pdf" || file.size > MAX_FILE)) errors.file = true;
  if (data.get("consent") !== "on") errors.consent = true;

  if (Object.keys(errors).length) return { status: "invalid", errors };
  return { status: await deliver("application", data), errors: {} };
}

export async function submitEnquiry(_previous: FormState<EnquiryField>, data: FormData): Promise<FormState<EnquiryField>> {
  if (text(data, "website")) return { status: "success", errors: {} };

  const errors: FormState<EnquiryField>["errors"] = {};
  if (!text(data, "name", 120)) errors.name = true;
  if (!EMAIL.test(text(data, "email", 200))) errors.email = true;
  if (text(data, "message", 5000).length < 10) errors.message = true;

  if (Object.keys(errors).length) return { status: "invalid", errors };
  return { status: await deliver("enquiry", data), errors: {} };
}

/** Contact page: a question or a problem. Phone is optional, but must look like a number when given. */
export async function submitContact(_previous: FormState<ContactField>, data: FormData): Promise<FormState<ContactField>> {
  if (text(data, "website")) return { status: "success", errors: {} };

  const errors: FormState<ContactField>["errors"] = {};
  const phone = text(data, "phone", 40);
  if (!text(data, "name", 120)) errors.name = true;
  if (!EMAIL.test(text(data, "email", 200))) errors.email = true;
  if (phone && !PHONE.test(phone)) errors.phone = true;
  if (text(data, "message", 5000).length < 10) errors.message = true;

  if (Object.keys(errors).length) return { status: "invalid", errors };
  return { status: await deliver("contact", data), errors: {} };
}
