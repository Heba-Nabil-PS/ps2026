"use client";

import { fill } from "@/versions/main/copy-helpers";
import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { submitEnquiry, type EnquiryField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { Button } from "@/versions/main/ui/Button";
import { Honeypot, TextArea, TextField } from "@/versions/main/ui/Field";
import { MultiSelect } from "@/versions/main/ui/MultiSelect";
import { PhoneField } from "@/versions/main/ui/PhoneField";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { startTransition, useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";

const initial: FormState<EnquiryField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type BriefError = "name" | "email" | "needs" | "description";

/**
 * Start a project: one form (your details → what you need + the project).
 * Checked on submit and again on the server; delivery is the same as the
 * contact enquiry. /start?service=branding preselects a discipline, and
 * /start?industry=restaurants a sector (the industry pages link this way).
 * `aside` sits in the side column under the label (the process steps).
 */
export function BriefForm({ aside }: { aside?: ReactNode }) {
  const { copy, site, industries } = useCopy();
  const locale = useLocale();
  const t = copy.start;
  const params = useSearchParams();
  const preselect = copy.services.list.find((service) => service.slug === params.get("service"))?.title;
  const preselectIndustry = industries.find((industry) => industry.slug === params.get("industry"))?.title;
  const [state, dispatch, pending] = useActionState(submitEnquiry, initial);
  const [errors, setErrors] = useState<Partial<Record<BriefError, true>>>({});
  const [last, setLast] = useState<FormData | null>(null);
  const [dismissed, setDismissed] = useState<FormState<EnquiryField> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const serverErrors = state.status === "invalid" && dismissed !== state ? state.errors : {};
  const has = (field: BriefError) => Boolean(errors[field] || (field === "description" ? serverErrors.message : field === "name" || field === "email" ? serverErrors[field] : false));
  const message = (field: BriefError) => (has(field) ? t.errors[field] : undefined);
  const clear = (field: BriefError) => () => setErrors((e) => ({ ...e, [field]: undefined }));

  /** Every answer as label/value pairs, for the fallback email. */
  const summary = (data: FormData) => {
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const e = t.email;
    return [
      { term: e.name, value: get("name") },
      { term: e.company, value: get("company") },
      { term: e.email, value: get("email") },
      { term: e.phone, value: get("phone") },
      { term: e.role, value: get("role") },
      { term: e.needs, value: data.getAll("needs").map(String).join(", ") },
      { term: e.industry, value: data.getAll("industry").map(String).join(", ") },
      { term: e.description, value: get("message") },
    ];
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current) return;
    const data = new FormData(form.current);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const found: Partial<Record<BriefError, true>> = {};
    if (!get("name")) found.name = true;
    if (!EMAIL.test(get("email"))) found.email = true;
    if (!data.getAll("needs").length) found.needs = true;
    if (get("message").length < 20) found.description = true;
    setErrors(found);
    setDismissed(state);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid]')?.focus());
      return;
    }
    data.set("interests", data.getAll("needs").join(", "));
    setLast(data);
    // Dispatched manually so the answers are kept if the server sends the visitor back.
    startTransition(() => dispatch(data));
  };

  const mailto = () => {
    const get = (key: string) => String(last?.get(key) ?? "");
    const lines = (last ? summary(last) : []).map((item) => `${item.term}: ${item.value || "—"}`);
    return `mailto:${site.email}?subject=${encodeURIComponent(fill(t.email.subject, { company: get("company") || get("name") }))}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const done = state.status === "success" || state.status === "fallback";

  return (
    <section className="gutter pb-[clamp(5.5rem,12vw,11rem)] pt-[clamp(3.5rem,8vw,7rem)]" aria-labelledby="brief-title">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <h2 id="brief-title" className="mb-8 text-2xl font-medium">
              {t.process}
            </h2>
            {aside}
          </div>
        </div>

        <div className="glass relative rounded-frame p-6 md:col-span-8 md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" role="status" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: ease.expo }} className="flex min-h-96 flex-col items-start justify-center gap-6">
                <span className="grid size-14 place-items-center rounded-full bg-sky text-ink-900">
                  {state.status === "success" ? <Check aria-hidden className="size-6" /> : <Mail aria-hidden className="size-6" />}
                </span>
                <p className="text-title font-medium">{state.status === "success" ? t.success.title : t.fallback.title}</p>
                <p className="max-w-lg text-muted">{state.status === "success" ? t.success.body : t.fallback.body}</p>
                {state.status === "fallback" ? (
                  <a href={mailto()} className="sheen inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] px-6 font-medium text-[#07121f]">
                    {t.fallback.action}
                  </a>
                ) : null}
              </motion.div>
            ) : (
              <motion.form key="form" ref={form} onSubmit={onSubmit} noValidate exit={{ opacity: 0, filter: "blur(8px)" }} className="relative flex flex-col gap-12">
                <Honeypot />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="source" value="brief" />

                {/* Your details */}
                <fieldset className="grid gap-8 md:grid-cols-2">
                  <legend className="mb-6 w-full text-2xl font-medium">{t.details.title}</legend>
                  <TextField name="name" label={t.details.name.label} placeholder={t.details.name.placeholder} autoComplete="name" error={message("name")} onInput={clear("name")} />
                  <TextField name="company" label={t.details.company.label} placeholder={t.details.company.placeholder} autoComplete="organization" optionalLabel={copy.ui.optional} />
                  <TextField name="email" type="email" label={t.details.email.label} placeholder={t.details.email.placeholder} autoComplete="email" error={message("email")} onInput={clear("email")} />
                  <PhoneField copy={t.details.phone} optionalLabel={copy.ui.optional} defaultIso="AE" />
                  <TextField name="role" label={t.details.role.label} placeholder={t.details.role.placeholder} autoComplete="organization-title" optionalLabel={copy.ui.optional} className="md:col-span-2" />
                </fieldset>

                {/* What you need */}
                <fieldset className="grid gap-8 md:grid-cols-2">
                  <legend className="mb-6 w-full text-2xl font-medium">{t.needs.title}</legend>
                  <MultiSelect
                    name="needs"
                    label={t.needs.services.label}
                    placeholder={t.needs.services.placeholder}
                    options={[...copy.services.list.map((service) => service.title), t.needs.unsure]}
                    defaultValue={preselect ? [preselect] : []}
                    error={message("needs")}
                    onChange={clear("needs")}
                  />
                  <MultiSelect
                    name="industry"
                    label={t.needs.industry.label}
                    placeholder={t.needs.industry.placeholder}
                    options={[...industries.map((industry) => industry.title), t.needs.industry.other]}
                    defaultValue={preselectIndustry ? [preselectIndustry] : []}
                    optionalLabel={copy.ui.optional}
                  />
                  <TextArea
                    name="message"
                    label={t.needs.description.label}
                    placeholder={t.needs.description.placeholder}
                    hint={t.needs.description.hint}
                    error={message("description")}
                    onInput={clear("description")}
                    maxLength={5000}
                    className="md:col-span-2"
                  />
                </fieldset>

                {state.status === "error" ? (
                  <p role="alert" className="text-sm text-danger">
                    {t.errors.server}{" "}
                    <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                      {site.email}
                    </a>
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-subtle">{t.privacy}</p>
                  <Button type="submit" disabled={pending}>
                    {pending ? t.sending : t.submit}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
