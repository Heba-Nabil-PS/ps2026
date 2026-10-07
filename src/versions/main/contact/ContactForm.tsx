"use client";

import { fill } from "@/versions/main/copy-helpers";
import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { submitContact, type ContactField, type FormState } from "@/lib/forms";
import { ease } from "@/lib/motion";
import { Button } from "@/versions/main/ui/Button";
import { Honeypot, TextArea, TextField } from "@/versions/main/ui/Field";
import { PhoneField } from "@/versions/main/ui/PhoneField";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";

const initial: FormState<ContactField> = { status: "idle", errors: {} };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

/**
 * Contact message: a question or a problem, not a project brief (that lives
 * on /start). Four fields only — name, email, optional phone, message.
 */
export function ContactForm() {
  const { copy, site } = useCopy();
  const locale = useLocale();
  const t = copy.contact.form;
  const [state, dispatch, pending] = useActionState(submitContact, initial);
  const [clientErrors, setClientErrors] = useState<FormState<ContactField>["errors"]>({});
  const [checked, setChecked] = useState<FormState<ContactField> | null>(null);
  const [last, setLast] = useState<FormData | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const errors = { ...(state.status === "invalid" && checked !== state ? state.errors : {}), ...clientErrors };
  const message = (field: ContactField) => (errors[field] ? t.errors[field] : undefined);
  const clear = (field: ContactField) => () => setClientErrors((e) => ({ ...e, [field]: undefined }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current) return;
    const data = new FormData(form.current);
    const found: FormState<ContactField>["errors"] = {};
    const phone = String(data.get("phone") ?? "").trim();
    if (!String(data.get("name") ?? "").trim()) found.name = true;
    if (!EMAIL.test(String(data.get("email") ?? "").trim())) found.email = true;
    if (phone && !PHONE.test(phone)) found.phone = true;
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
    const lines = [`${e.name}: ${get("name")}`, `${e.email}: ${get("email")}`, `${e.phone}: ${get("phone") || "—"}`, "", `${e.message}:`, get("message")];
    return `mailto:${site.email}?subject=${encodeURIComponent(fill(e.subject, { name: get("name") }))}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const done = state.status === "success" || state.status === "fallback";

  return (
    <div className="glass relative overflow-hidden rounded-frame p-6 md:p-12">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" role="status" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: ease.expo }} className="flex min-h-96 flex-col items-start justify-center gap-6">
            <span className="grid size-14 place-items-center rounded-full bg-sky text-ink-900">{state.status === "success" ? <Check aria-hidden className="size-6" /> : <Mail aria-hidden className="size-6" />}</span>
            <p className="text-title font-medium">{state.status === "success" ? t.success.title : t.fallback.title}</p>
            <p className="max-w-lg text-muted">{state.status === "success" ? t.success.body : t.fallback.body}</p>
            {state.status === "fallback" ? (
              <a href={mailto()} className="sheen inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] px-6 font-medium text-[#07121f]">
                {t.fallback.action}
              </a>
            ) : null}
          </motion.div>
        ) : (
          <motion.form key="form" ref={form} onSubmit={onSubmit} noValidate exit={{ opacity: 0, filter: "blur(8px)" }} className="relative flex flex-col gap-10">
            <Honeypot />
            <input type="hidden" name="locale" value={locale} />
            <div className="grid gap-8 md:grid-cols-2">
              <TextField name="name" label={t.fields.name.label} placeholder={t.fields.name.placeholder} autoComplete="name" error={message("name")} onInput={clear("name")} className="md:col-span-2" />
              <TextField name="email" type="email" label={t.fields.email.label} placeholder={t.fields.email.placeholder} autoComplete="email" error={message("email")} onInput={clear("email")} />
              <PhoneField copy={t.fields.phone} optionalLabel={copy.ui.optional} error={message("phone")} onInput={clear("phone")} />
            </div>

            <TextArea name="message" rows={6} label={t.fields.message.label} placeholder={t.fields.message.placeholder} error={message("message")} onInput={clear("message")} maxLength={5000} />

            {state.status === "error" ? (
              <p role="alert" className="text-sm text-danger">
                {t.errors.server}{" "}
                <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                  {site.email}
                </a>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-6">
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
