"use client";

import { fill } from "@/versions/main/copy";
import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { submitEnquiry, type EnquiryField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { Button } from "@/versions/main/ui/Button";
import { Chip, Honeypot, TextArea, TextField } from "@/versions/main/ui/Field";
import { Asterisk } from "@/versions/main/ui/Label";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initial: FormState<EnquiryField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Project enquiry. One screen, few fields: who you are, what you need
 * (the deck's six disciplines as chips), budget, and the project.
 * /contact?service=branding preselects a discipline.
 */
export function ContactForm() {
  const { copy, site } = useCopy();
  const locale = useLocale();
  const t = copy.contact.form;
  const params = useSearchParams();
  const preselect = params.get("service");
  const [state, dispatch, pending] = useActionState(submitEnquiry, initial);
  const [clientErrors, setClientErrors] = useState<FormState<EnquiryField>["errors"]>({});
  const [checked, setChecked] = useState<FormState<EnquiryField> | null>(null);
  const [last, setLast] = useState<FormData | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const errors = { ...(state.status === "invalid" && checked !== state ? state.errors : {}), ...clientErrors };
  const message = (field: EnquiryField) => (errors[field] ? t.errors[field] : undefined);
  const clear = (field: EnquiryField) => () => setClientErrors((e) => ({ ...e, [field]: undefined }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current) return;
    const data = new FormData(form.current);
    const found: FormState<EnquiryField>["errors"] = {};
    if (!String(data.get("name") ?? "").trim()) found.name = true;
    if (!EMAIL.test(String(data.get("email") ?? "").trim())) found.email = true;
    if (String(data.get("message") ?? "").trim().length < 10) found.message = true;
    setClientErrors(found);
    setChecked(state);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setLast(data);
    startTransition(() => dispatch(data));
  };

  const mailto = () => {
    const get = (key: string) => String(last?.get(key) ?? "");
    const e = t.email;
    const lines = [
      `${e.name}: ${get("name")}`,
      `${e.email}: ${get("email")}`,
      `${e.company}: ${get("company") || "—"}`,
      `${e.interests}: ${(last?.getAll("interests") ?? []).join(", ") || "—"}`,
      `${e.budget}: ${get("budget") || "—"}`,
      "",
      `${e.message}:`,
      get("message"),
    ];
    return `mailto:${site.email}?subject=${encodeURIComponent(fill(e.subject, { company: get("company") || get("name") }))}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const done = state.status === "success" || state.status === "fallback";

  return (
    <div className="glass relative overflow-hidden rounded-frame p-6 md:p-12">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" role="status" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: ease.expo }} className="flex min-h-96 flex-col items-start justify-center gap-6">
            <span className="grid size-14 place-items-center rounded-full bg-sky text-ink-900">{state.status === "success" ? <Check aria-hidden className="size-6" /> : <Asterisk className="size-6" />}</span>
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
            <div className="grid gap-8 md:grid-cols-2">
              <TextField name="name" label={t.fields.name.label} placeholder={t.fields.name.placeholder} autoComplete="name" error={message("name")} onInput={clear("name")} />
              <TextField name="email" type="email" label={t.fields.email.label} placeholder={t.fields.email.placeholder} autoComplete="email" error={message("email")} onInput={clear("email")} />
              <TextField name="company" label={t.fields.company.label} placeholder={t.fields.company.placeholder} autoComplete="organization" optionalLabel={copy.ui.optional} className="md:col-span-2" />
            </div>

            <fieldset>
              <legend className="text-label mb-4 text-muted">{t.interests}</legend>
              <div className="flex flex-wrap gap-2">
                {copy.services.list.map((service) => (
                  <Chip key={service.slug} name="interests" value={service.title} label={service.title} defaultChecked={preselect === service.slug} />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-label mb-4 text-muted">
                {t.budget.label} <span className="normal-case tracking-normal text-subtle">({copy.ui.optional})</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {t.budget.options.map((option) => (
                  <Chip key={option} type="radio" name="budget" value={option} label={option} />
                ))}
              </div>
            </fieldset>

            <TextArea name="message" label={t.fields.message.label} placeholder={t.fields.message.placeholder} error={message("message")} onInput={clear("message")} maxLength={5000} />

            {state.status === "error" ? (
              <p role="alert" className="text-sm text-[#f0a3a3]">
                {t.errors.server}{" "}
                <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                  {site.email}
                </a>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
              <p className="max-w-xs text-xs text-subtle">{t.privacy}</p>
              <Button type="submit" disabled={pending}>
                {pending ? t.sending : t.submit}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
