"use client";

import { fill } from "@/versions/main/copy";
import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { submitEnquiry, type EnquiryField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/versions/main/ui/Button";
import { Chip, Honeypot, SelectField, TextArea, TextField } from "@/versions/main/ui/Field";
import { Asterisk, Label } from "@/versions/main/ui/Label";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initial: FormState<EnquiryField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LAST = 4;

type StepError = "needs" | "description" | "budget" | "name" | "email";

/** Which step each server-side error belongs to, so it sends the visitor back there. */
const stepOf: Record<EnquiryField, number> = { message: 1, name: 3, email: 3 };

/**
 * Start a project: a five-step brief (what you need → the project → budget &
 * timing → your details → review). Each step is checked before moving on and
 * the server checks again; delivery is the same as the contact enquiry.
 * /start?service=branding preselects a discipline.
 */
export function BriefForm() {
  const { copy, site, industries } = useCopy();
  const locale = useLocale();
  const t = copy.start;
  const params = useSearchParams();
  const preselect = copy.services.list.find((service) => service.slug === params.get("service"))?.title;
  const [state, dispatch, pending] = useActionState(submitEnquiry, initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<StepError, true>>>({});
  const [review, setReview] = useState<{ term: string; value: string }[]>([]);
  const [last, setLast] = useState<FormData | null>(null);
  const [dismissed, setDismissed] = useState<FormState<EnquiryField> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const serverErrors = state.status === "invalid" && dismissed !== state ? state.errors : {};
  const serverStep = Math.min(...Object.keys(serverErrors).map((key) => stepOf[key as EnquiryField]));
  const current = Number.isFinite(serverStep) && serverStep < step ? serverStep : step;
  const has = (field: StepError) => Boolean(errors[field] || (field === "description" ? serverErrors.message : field === "name" || field === "email" ? serverErrors[field] : false));
  const message = (field: StepError) => (has(field) ? t.errors[field] : undefined);
  const clear = (field: StepError) => () => setErrors((e) => ({ ...e, [field]: undefined }));

  const read = () => {
    const data = new FormData(form.current ?? undefined);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const all = (key: string) => data.getAll(key).map(String);
    return { data, get, all };
  };

  const checkStep = (index: number) => {
    const { get, all } = read();
    const found: Partial<Record<StepError, true>> = {};
    if (index === 0 && !all("needs").length) found.needs = true;
    if (index === 1 && get("message").length < 20) found.description = true;
    if (index === 2 && (!get("budget") || !get("timing"))) found.budget = true;
    if (index === 3) {
      if (!get("name")) found.name = true;
      if (!EMAIL.test(get("email"))) found.email = true;
    }
    setErrors(found);
    setDismissed(state);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], fieldset:not([hidden]) input, fieldset:not([hidden]) textarea')?.focus());
      return false;
    }
    return true;
  };

  /** Every answer as label/value pairs, for the review step and the fallback email. */
  const summary = (data: FormData) => {
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const all = (key: string) => data.getAll(key).map(String);
    const e = t.email;
    return [
      { term: e.needs, value: all("needs").join(", ") },
      { term: e.industry, value: get("industry") },
      { term: e.markets, value: all("markets").join(", ") },
      { term: e.description, value: get("message") },
      { term: e.budget, value: get("budget") },
      { term: e.timing, value: get("timing") },
      { term: e.name, value: get("name") },
      { term: e.company, value: get("company") },
      { term: e.email, value: get("email") },
      { term: e.phone, value: get("phone") },
      { term: e.role, value: get("role") },
    ];
  };

  const next = () => {
    if (!checkStep(current)) return;
    if (current === LAST - 1) setReview(summary(read().data));
    setStep(Math.min(current + 1, LAST));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (current < LAST) {
      next();
      return;
    }
    if (!form.current) return;
    const data = new FormData(form.current);
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
  const buttonLabel = pending ? t.sending : current === LAST ? t.submit : current === LAST - 1 ? t.toReview : t.continue;

  return (
    <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]" aria-labelledby="brief-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Label as="h2" className="mb-6">
            <span id="brief-title">{t.label}</span>
          </Label>

          {!done ? (
            <ol className="mt-10 flex flex-col gap-3" aria-label={t.label}>
              {t.steps.map((label, index) => (
                <li key={label} aria-current={index === current ? "step" : undefined} className={cn("flex items-center gap-4 transition-colors duration-500", index <= current ? "text-fg" : "text-subtle")}>
                  <span className={cn("grid size-9 place-items-center rounded-full border text-xs tabular-nums transition-all duration-500", index < current ? "border-sky bg-sky text-ink-900" : index === current ? "border-sky text-sky" : "border-line-strong")}>
                    {index < current ? <Check aria-hidden className="size-4" /> : String(index + 1).padStart(2, "0")}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-14">
            <p className="text-label mb-6 text-subtle">{t.next.label}</p>
            <ol className="flex flex-col gap-6">
              {t.next.steps.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="text-label pt-1 tabular-nums text-sky">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="glass relative overflow-hidden rounded-frame p-6 md:col-span-8 md:p-12">
          <motion.span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left bg-sky rtl:origin-right" initial={false} animate={{ scaleX: done ? 1 : (current + 1) / (LAST + 1) }} transition={{ duration: 0.9, ease: ease.expo }} />

          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" role="status" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: ease.expo }} className="flex min-h-96 flex-col items-start justify-center gap-6">
                <span className="grid size-14 place-items-center rounded-full bg-sky text-ink-900">
                  {state.status === "success" ? <Check aria-hidden className="size-6" /> : <Asterisk className="size-6" />}
                </span>
                <p className="text-title font-medium">{state.status === "success" ? t.success.title : t.fallback.title}</p>
                <p className="max-w-lg text-muted">{state.status === "success" ? t.success.body : t.fallback.body}</p>
                {state.status === "fallback" ? (
                  <a href={mailto()} className="sheen inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] px-6 font-medium text-ink-900">
                    {t.fallback.action}
                  </a>
                ) : null}
              </motion.div>
            ) : (
              <motion.form key="form" ref={form} onSubmit={onSubmit} noValidate exit={{ opacity: 0, filter: "blur(8px)" }} className="relative flex flex-col gap-10">
                <Honeypot />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="source" value="brief" />

                {/* Step 1 — What you need */}
                <fieldset hidden={current !== 0} className="grid gap-6">
                  <legend className="text-title mb-2 font-medium">{t.needs.title}</legend>
                  <p className="-mt-2 text-sm text-muted">{t.needs.hint}</p>
                  <div className="flex flex-wrap gap-2">
                    {[...copy.services.list.map((service) => service.title), t.needs.unsure].map((option) => (
                      <Chip key={option} name="needs" value={option} label={option} defaultChecked={option === preselect} onChange={clear("needs")} />
                    ))}
                  </div>
                  {has("needs") ? (
                    <p role="alert" className="text-sm text-[#f0a3a3]">
                      {t.errors.needs}
                    </p>
                  ) : null}
                </fieldset>

                {/* Step 2 — The project */}
                <fieldset hidden={current !== 1} className="grid gap-8 md:grid-cols-2">
                  <legend className="text-title mb-8 font-medium">{t.project.title}</legend>
                  <SelectField name="industry" label={t.project.industry.label} defaultValue="">
                    <option value="">{t.project.industry.placeholder}</option>
                    {industries.map((industry) => (
                      <option key={industry.slug} value={industry.title}>
                        {industry.title}
                      </option>
                    ))}
                    <option value={t.project.industry.other}>{t.project.industry.other}</option>
                  </SelectField>
                  <div>
                    <p className="text-label mb-3 text-muted">
                      {t.project.markets.label} <span className="normal-case tracking-normal text-subtle">({copy.ui.optional})</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t.project.markets.options.map((option) => (
                        <Chip key={option} name="markets" value={option} label={option} />
                      ))}
                    </div>
                  </div>
                  <TextArea
                    name="message"
                    label={t.project.description.label}
                    placeholder={t.project.description.placeholder}
                    hint={t.project.description.hint}
                    error={message("description")}
                    onInput={clear("description")}
                    maxLength={5000}
                    className="md:col-span-2"
                  />
                </fieldset>

                {/* Step 3 — Budget & timing */}
                <fieldset hidden={current !== 2} className="grid gap-8">
                  <legend className="text-title mb-2 font-medium">{t.budget.title}</legend>
                  <div>
                    <p className="text-label mb-3 text-muted">{t.budget.budget.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.budget.budget.options.map((option) => (
                        <Chip key={option} type="radio" name="budget" value={option} label={option} onChange={clear("budget")} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-label mb-3 text-muted">{t.budget.timing.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.budget.timing.options.map((option) => (
                        <Chip key={option} type="radio" name="timing" value={option} label={option} onChange={clear("budget")} />
                      ))}
                    </div>
                  </div>
                  {has("budget") ? (
                    <p role="alert" className="text-sm text-[#f0a3a3]">
                      {t.errors.budget}
                    </p>
                  ) : null}
                </fieldset>

                {/* Step 4 — Your details */}
                <fieldset hidden={current !== 3} className="grid gap-8 md:grid-cols-2">
                  <legend className="text-title mb-8 font-medium">{t.details.title}</legend>
                  <TextField name="name" label={t.details.name.label} placeholder={t.details.name.placeholder} autoComplete="name" error={message("name")} onInput={clear("name")} />
                  <TextField name="company" label={t.details.company.label} placeholder={t.details.company.placeholder} autoComplete="organization" optionalLabel={copy.ui.optional} />
                  <TextField name="email" type="email" label={t.details.email.label} placeholder={t.details.email.placeholder} autoComplete="email" error={message("email")} onInput={clear("email")} />
                  <TextField name="phone" type="tel" label={t.details.phone.label} placeholder={t.details.phone.placeholder} autoComplete="tel" optionalLabel={copy.ui.optional} />
                  <TextField name="role" label={t.details.role.label} placeholder={t.details.role.placeholder} autoComplete="organization-title" optionalLabel={copy.ui.optional} className="md:col-span-2" />
                </fieldset>

                {/* Step 5 — Review */}
                <fieldset hidden={current !== LAST} className="grid gap-8">
                  <legend className="text-title mb-2 font-medium">{t.review.title}</legend>
                  <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                    {review.map((item) => (
                      <div key={item.term} className={cn("bg-ink-900/80 p-5", item.term === t.email.description && "sm:col-span-2")}>
                        <dt className="text-label text-subtle">{item.term}</dt>
                        <dd className={cn("mt-2", item.term === t.email.description ? "whitespace-pre-line" : "truncate", !item.value && "text-subtle")}>{item.value || t.review.empty}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-subtle">{t.privacy}</p>
                </fieldset>

                {state.status === "error" ? (
                  <p role="alert" className="text-sm text-[#f0a3a3]">
                    {t.errors.server}{" "}
                    <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                      {site.email}
                    </a>
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
                  <button type="button" onClick={() => setStep(Math.max(0, current - 1))} className={cn("text-sm text-muted transition-colors hover:text-fg", current === 0 && "invisible")}>
                    <span aria-hidden className="inline-block rtl:-scale-x-100">←</span> {t.back}
                  </button>
                  <Button type="submit" disabled={pending}>
                    {buttonLabel}
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
