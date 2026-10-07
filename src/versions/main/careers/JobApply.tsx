"use client";

import { useLocale } from "@/i18n/locale-context";
import { submitApplication, type ApplicationField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { fill } from "@/versions/main/copy-helpers";
import { Button } from "@/versions/main/ui/Button";
import { Honeypot, TextArea, TextField } from "@/versions/main/ui/Field";
import { PhoneField } from "@/versions/main/ui/PhoneField";
import { useCopy } from "@/versions/main/use-copy";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, UploadCloud, Mail } from "lucide-react";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initial: FormState<ApplicationField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FILE = 8 * 1024 * 1024;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * The application on a role's own page: one panel beside the brief, no steps.
 * The role is fixed, so the candidate only fills in their own details. Everything
 * is checked on send; the server checks it all again. PDF only, up to 8 MB.
 */
export function JobApply({ role }: { role: string }) {
  const { copy, roles, site } = useCopy();
  const locale = useLocale();
  const t = copy.careers.apply;
  const [state, dispatch, pending] = useActionState(submitApplication, initial);
  const [clientErrors, setClientErrors] = useState<FormState<ApplicationField>["errors"]>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<FormData | null>(null);
  const [dismissed, setDismissed] = useState<FormState<ApplicationField> | null>(null);
  const form = useRef<HTMLFormElement>(null);

  // Server errors apply until the candidate sends again; client errors come from the check on send.
  const serverErrors = state.status === "invalid" && dismissed !== state ? state.errors : {};
  const errors = { ...serverErrors, ...clientErrors };
  const message = (field: ApplicationField) => (errors[field] ? t.errors[field] : undefined);
  const clear = (...fields: ApplicationField[]) => setClientErrors((e) => ({ ...e, ...Object.fromEntries(fields.map((f) => [f, undefined])) }));
  const roleTitle = roles.find((r) => r.id === role)?.title ?? t.fields.openApplication;

  const check = (data: FormData): boolean => {
    const found: FormState<ApplicationField>["errors"] = {};
    if (!String(data.get("name") ?? "").trim()) found.name = true;
    if (!EMAIL.test(String(data.get("email") ?? "").trim())) found.email = true;
    const portfolio = String(data.get("portfolio") ?? "").trim();
    const file = data.get("file");
    const hasFile = file instanceof File && file.size > 0;
    if (!portfolio && !hasFile) found.work = true;
    if (portfolio && !isHttpUrl(portfolio)) found.url = true;
    if (hasFile && (file.type !== "application/pdf" || file.size > MAX_FILE)) found.file = true;
    if (data.get("consent") !== "on") found.consent = true;
    setClientErrors(found);
    setDismissed(state);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return false;
    }
    return true;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current) return;
    const data = new FormData(form.current);
    if (!check(data)) return;
    data.set("roleTitle", roleTitle);
    setLastSubmission(data);
    // Dispatched manually (not via the action prop) so fields — and the chosen file — are not reset on a validation error.
    startTransition(() => dispatch(data));
  };

  const mailto = () => {
    const get = (key: string) => String(lastSubmission?.get(key) ?? "");
    const e = t.email;
    const lines = [`${e.role}: ${roleTitle}`, `${e.name}: ${get("name")}`, `${e.email}: ${get("email")}`, `${e.phone}: ${get("phone") || "—"}`, `${e.portfolio}: ${get("portfolio") || "—"}`, "", `${e.note}:`, get("note")];
    return `mailto:${site.email}?subject=${encodeURIComponent(fill(t.email.subject, { role: roleTitle }))}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const done = state.status === "success" || state.status === "fallback";

  return (
    <div id="apply" className="glass scroll-mt-28 rounded-card p-7 md:p-8">
      <h2 className="text-label text-subtle">{copy.careers.role.apply.label}</h2>
      <p className="text-title mt-3 font-medium text-sky">{roleTitle}</p>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" role="status" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: ease.expo }} className="mt-8 flex flex-col items-start gap-5">
            <span className="grid size-12 place-items-center rounded-full bg-sky text-ink-900">
              {state.status === "success" ? <Check aria-hidden className="size-5" /> : <Mail aria-hidden className="size-5" />}
            </span>
            <p className="text-title font-medium">{state.status === "success" ? t.success.title : t.fallback.title}</p>
            <p className="text-sm text-muted">{state.status === "success" ? t.success.body : t.fallback.body}</p>
            {state.status === "fallback" ? (
              <a href={mailto()} className="sheen inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] px-6 font-medium text-[#07121f]">
                {t.fallback.action}
              </a>
            ) : null}
          </motion.div>
        ) : (
          <motion.form key="form" ref={form} onSubmit={onSubmit} noValidate exit={{ opacity: 0, filter: "blur(8px)" }} className="mt-8 grid gap-7" encType="multipart/form-data">
            <Honeypot />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="role" value={role} />

            <TextField name="name" label={t.fields.name.label} placeholder={t.fields.name.placeholder} autoComplete="name" error={message("name")} onInput={() => clear("name")} />
            <TextField name="email" type="email" label={t.fields.email.label} placeholder={t.fields.email.placeholder} autoComplete="email" error={message("email")} onInput={() => clear("email")} />
            <PhoneField copy={t.fields.phone} optionalLabel={copy.ui.optional} />
            <TextField
              name="portfolio"
              type="url"
              inputMode="url"
              label={t.fields.portfolio.label}
              placeholder={t.fields.portfolio.placeholder}
              error={message("url") ?? message("work")}
              onInput={() => clear("url", "work")}
            />

            <div>
              <p className="text-label mb-3 text-muted">{t.fields.file.label}</p>
              <label
                className={cn(
                  "group flex cursor-pointer items-center gap-4 rounded-card border border-dashed p-5 transition-colors duration-500 focus-within:border-sky hover:border-sky",
                  errors.file ? "border-danger" : "border-line-strong",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper/5 text-sky">
                  {fileName ? <FileText aria-hidden className="size-4" /> : <UploadCloud aria-hidden className="size-4" />}
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
                    clear("file", "work");
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

            <div>
              <label className="flex cursor-pointer items-start gap-4 text-sm text-muted">
                <input
                  type="checkbox"
                  name="consent"
                  aria-invalid={errors.consent ? true : undefined}
                  onChange={() => clear("consent")}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#8cc4e6]"
                />
                {t.fields.consent}
              </label>
              {errors.consent ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {t.errors.consent}
                </p>
              ) : null}
            </div>

            {state.status === "error" ? (
              <p role="alert" className="text-sm text-danger">
                {t.errors.server}{" "}
                <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                  {site.email}
                </a>
              </p>
            ) : null}

            <div className="border-t border-line pt-7">
              <Button type="submit" disabled={pending}>
                {pending ? t.sending : t.submit}
              </Button>
              <p className="mt-5 text-xs text-subtle">{copy.careers.role.reply}</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
