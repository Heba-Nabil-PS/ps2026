"use client";

import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { submitApplication, type ApplicationField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Button } from "@/versions/main/ui/Button";
import { Honeypot, SelectField, TextArea, TextField } from "@/versions/main/ui/Field";
import { Label } from "@/versions/main/ui/Label";
import { PhoneField } from "@/versions/main/ui/PhoneField";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, UploadCloud, Mail } from "lucide-react";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initial: FormState<ApplicationField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FILE = 8 * 1024 * 1024;

/** Which fields each step owns, so errors send the candidate back to the right step. */
const stepOf: Record<ApplicationField, number> = { name: 0, email: 0, work: 1, url: 1, file: 1, consent: 2 };

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Objective 03 — "candidates can submit their work in minimal steps".
 * Three steps: You → Your work → Send. Each step is checked before moving on;
 * the server checks everything again. Uploads are PDF only, up to 8 MB.
 */
export function ApplicationForm({
  role,
  onRoleChange,
  subjectFor,
  heading,
  lockRole = false,
}: {
  role: string;
  onRoleChange: (id: string) => void;
  subjectFor: (title: string) => string;
  /** Replaces the default "Three steps" title, e.g. on a role's own page. */
  heading?: readonly string[];
  /** On a role's own page the role is fixed: it is named beside the form instead of chosen in it. */
  lockRole?: boolean;
}) {
  const { copy, roles, site } = useCopy();
  const locale = useLocale();
  const t = copy.careers.apply;
  const [state, dispatch, pending] = useActionState(submitApplication, initial);
  const [step, setStep] = useState(0);
  const [clientErrors, setClientErrors] = useState<FormState<ApplicationField>["errors"]>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [review, setReview] = useState<Record<string, string>>({});
  const [lastSubmission, setLastSubmission] = useState<FormData | null>(null);
  const [dismissed, setDismissed] = useState<FormState<ApplicationField> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  // Server errors apply until the candidate edits again; client errors come from step checks.
  const serverErrors = state.status === "invalid" && dismissed !== state ? state.errors : {};
  const errors = { ...serverErrors, ...clientErrors };
  const message = (field: ApplicationField) => (errors[field] ? t.errors[field] : undefined);
  const roleTitle = roles.find((r) => r.id === role)?.title ?? t.fields.openApplication;

  // A server-side error on an earlier step sends the candidate back there.
  const serverStep = Math.min(...Object.keys(serverErrors).map((key) => stepOf[key as ApplicationField]));
  const current = Number.isFinite(serverStep) && serverStep < step ? serverStep : step;

  const checkStep = (index: number): boolean => {
    const data = new FormData(form.current ?? undefined);
    const found: FormState<ApplicationField>["errors"] = {};
    if (index === 0) {
      if (!String(data.get("name") ?? "").trim()) found.name = true;
      if (!EMAIL.test(String(data.get("email") ?? "").trim())) found.email = true;
    }
    if (index === 1) {
      const portfolio = String(data.get("portfolio") ?? "").trim();
      const file = data.get("file");
      const hasFile = file instanceof File && file.size > 0;
      if (!portfolio && !hasFile) found.work = true;
      if (portfolio && !isHttpUrl(portfolio)) found.url = true;
      if (hasFile && (file.type !== "application/pdf" || file.size > MAX_FILE)) found.file = true;
    }
    if (index === 2 && data.get("consent") !== "on") found.consent = true;
    setClientErrors(found);
    setDismissed(state);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[aria-invalid="true"], [name="${first}"]`)?.focus());
      return false;
    }
    return true;
  };

  const next = () => {
    if (!checkStep(current)) return;
    if (current === 1 && form.current) {
      const data = new FormData(form.current);
      const file = data.get("file");
      setReview({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        portfolio: String(data.get("portfolio") ?? "") || (file instanceof File && file.size ? file.name : ""),
      });
    }
    setStep(Math.min(current + 1, 2));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (current < 2) {
      next();
      return;
    }
    if (!checkStep(2) || !form.current) return;
    const data = new FormData(form.current);
    data.set("roleTitle", roleTitle);
    setLastSubmission(data);
    // Dispatched manually (not via the action prop) so fields — and the chosen file — are not reset on a validation error.
    startTransition(() => dispatch(data));
  };

  const mailto = () => {
    const data = lastSubmission;
    const get = (key: string) => String(data?.get(key) ?? "");
    const e = t.email;
    const lines = [`${e.role}: ${roleTitle}`, `${e.name}: ${get("name")}`, `${e.email}: ${get("email")}`, `${e.phone}: ${get("phone") || "—"}`, `${e.portfolio}: ${get("portfolio") || "—"}`, "", `${e.note}:`, get("note")];
    return `mailto:${site.email}?subject=${encodeURIComponent(subjectFor(roleTitle))}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const done = state.status === "success" || state.status === "fallback";

  return (
    <section className="gutter section-y" aria-labelledby="apply-title">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Label className="mb-6">{t.label}</Label>
          <div id="apply-title">
            <StretchHeading lines={heading ?? t.title} className="text-headline" />
          </div>
          {lockRole ? <p className="text-title mt-6 font-medium text-sky">{roleTitle}</p> : null}
          <p className={cn("max-w-sm text-muted", lockRole ? "mt-4" : "mt-8")}>{t.intro}</p>

          {!done ? (
            <ol className="mt-12 flex flex-col gap-3" aria-label={t.label}>
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
        </div>

        <div className="glass relative overflow-hidden rounded-frame p-6 md:col-span-8 md:p-12">
          {/* Progress along the top edge */}
          <motion.span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left bg-sky rtl:origin-right" initial={false} animate={{ scaleX: done ? 1 : (current + 1) / 3 }} transition={{ duration: 0.9, ease: ease.expo }} />

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
              <motion.form key="form" ref={form} onSubmit={onSubmit} noValidate exit={{ opacity: 0, filter: "blur(8px)" }} className="relative flex flex-col gap-10" encType="multipart/form-data">
                <Honeypot />
                <input type="hidden" name="locale" value={locale} />

                {/* Step 1 — You */}
                <fieldset hidden={current !== 0} className="grid gap-8 md:grid-cols-2">
                  <legend className="sr-only">{t.steps[0]}</legend>
                  <TextField name="name" label={t.fields.name.label} placeholder={t.fields.name.placeholder} autoComplete="name" error={message("name")} onInput={() => setClientErrors((e) => ({ ...e, name: undefined }))} />
                  <TextField name="email" type="email" label={t.fields.email.label} placeholder={t.fields.email.placeholder} autoComplete="email" error={message("email")} onInput={() => setClientErrors((e) => ({ ...e, email: undefined }))} />
                  <PhoneField copy={t.fields.phone} optionalLabel={copy.ui.optional} />
                  {lockRole ? (
                    <input type="hidden" name="role" value={role} />
                  ) : (
                    <SelectField name="role" label={t.fields.role.label} value={role} onChange={(event) => onRoleChange(event.target.value)}>
                      <option value="">{t.fields.openApplication}</option>
                      {roles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} — {item.location}
                        </option>
                      ))}
                    </SelectField>
                  )}
                </fieldset>

                {/* Step 2 — Your work */}
                <fieldset hidden={current !== 1} className="grid gap-8">
                  <legend className="sr-only">{t.steps[1]}</legend>
                  <TextField
                    name="portfolio"
                    type="url"
                    inputMode="url"
                    label={t.fields.portfolio.label}
                    placeholder={t.fields.portfolio.placeholder}
                    error={message("url") ?? message("work")}
                    onInput={() => setClientErrors((e) => ({ ...e, url: undefined, work: undefined }))}
                  />
                  <div>
                    <p className="text-label mb-3 text-muted">{t.fields.file.label}</p>
                    <label
                      className={cn(
                        "group flex cursor-pointer items-center gap-5 rounded-card border border-dashed p-6 transition-colors duration-500 focus-within:border-sky hover:border-sky",
                        errors.file ? "border-danger" : "border-line-strong",
                      )}
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/5 text-sky">
                        {fileName ? <FileText aria-hidden className="size-5" /> : <UploadCloud aria-hidden className="size-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-fg">{fileName ?? t.fields.file.choose}</span>
                        <span className="text-xs text-subtle">{t.fields.file.hint}</span>
                      </span>
                      {fileName ? <span className="text-sm text-muted underline underline-offset-4">{t.fields.file.replace}</span> : null}
                      <input
                        type="file"
                        name="file"
                        accept="application/pdf"
                        className="sr-only"
                        aria-invalid={errors.file ? true : undefined}
                        onChange={(event) => {
                          setFileName(event.target.files?.[0]?.name ?? null);
                          setClientErrors((e) => ({ ...e, file: undefined, work: undefined }));
                        }}
                      />
                    </label>
                    {errors.file ? (
                      <p role="alert" className="mt-2 text-sm text-danger">
                        {t.errors.file}
                      </p>
                    ) : null}
                  </div>
                  <TextArea name="note" label={t.fields.note.label} placeholder={t.fields.note.placeholder} optionalLabel={copy.ui.optional} maxLength={2000} />
                </fieldset>

                {/* Step 3 — Send */}
                <fieldset hidden={current !== 2} className="grid gap-8">
                  <legend className="sr-only">{t.steps[2]}</legend>
                  <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                    {[
                      { term: t.fields.role.label, value: roleTitle },
                      { term: t.fields.name.label, value: review.name },
                      { term: t.fields.email.label, value: review.email },
                      { term: t.fields.portfolio.label, value: review.portfolio },
                    ].map((item) => (
                      <div key={item.term} className="bg-ink-900/80 p-5">
                        <dt className="text-label text-subtle">{item.term}</dt>
                        <dd className="mt-2 truncate">{item.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  <label className="flex cursor-pointer items-start gap-4 text-sm text-muted">
                    <input
                      type="checkbox"
                      name="consent"
                      aria-invalid={errors.consent ? true : undefined}
                      onChange={() => setClientErrors((e) => ({ ...e, consent: undefined }))}
                      className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#8cc4e6]"
                    />
                    {t.fields.consent}
                  </label>
                  {errors.consent ? (
                    <p role="alert" className="-mt-4 text-sm text-danger">
                      {t.errors.consent}
                    </p>
                  ) : null}
                </fieldset>

                {state.status === "error" ? (
                  <p role="alert" className="text-sm text-danger">
                    {t.errors.server}{" "}
                    <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                      {site.email}
                    </a>
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
                  <button
                    type="button"
                    onClick={() => setStep(Math.max(0, current - 1))}
                    className={cn("text-sm text-muted transition-colors hover:text-fg", current === 0 && "invisible")}
                  >
                    <span aria-hidden className="inline-block rtl:-scale-x-100">←</span> {t.back}
                  </button>
                  <Button type="submit" disabled={pending}>
                    {pending ? t.sending : current === 2 ? t.submit : current === 1 ? t.review : t.continue}
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
