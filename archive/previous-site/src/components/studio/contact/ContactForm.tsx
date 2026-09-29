"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { PillButton } from "@/components/studio/PillButton";
import type { Enquiry } from "@/data/contact";
import { useContent } from "@/i18n/LocaleProvider";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";

const empty: Enquiry = { name: "", email: "", company: "", interests: [], budget: null, message: "" };

/**
 * Enquiry form in the studio's hairline style. Chips toggle with a sliding
 * ink fill; submitting composes an email with every field and swaps the form
 * for a confirmation. Replace `buildEnquiryHref` with a request when a
 * backend exists.
 */
export function ContactForm() {
  const [enquiry, setEnquiry] = useState<Enquiry>(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const { play } = useSound();
  const { contactPage, site: siteConfig, enquiryHref } = useContent();
  const { form } = contactPage;

  const update = <K extends keyof Enquiry>(key: K, value: Enquiry[K]) => setEnquiry((current) => ({ ...current, [key]: value }));

  const toggleInterest = (interest: string) =>
    update("interests", enquiry.interests.includes(interest) ? enquiry.interests.filter((item) => item !== interest) : [...enquiry.interests, interest]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "idle") return;
    play("click");
    setStatus("sending");
    window.location.href = enquiryHref(enquiry);
    window.setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: ease.expo }}
            className="rounded-[2rem] bg-[#0b0c0e] p-8 text-[#f2f3f5] md:p-12"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#88bbd8] text-[#0b0c0e]">
              <Check aria-hidden className="size-5" />
            </span>
            <p className="mt-8 text-2xl font-medium tracking-[-0.03em] md:text-3xl">{form.success.title}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 md:text-base">{form.success.body}</p>
            <a href={`mailto:${siteConfig.email}`} className="mt-8 inline-block text-lg underline decoration-white/25 underline-offset-8 transition-colors hover:decoration-[#88bbd8]">
              {siteConfig.email}
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4, ease: ease.quart } }}
            className="flex flex-col gap-10"
            noValidate={false}
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
              <Field id="name" label={form.fields.name.label}>
                <input id="name" name="name" type="text" required autoComplete="name" placeholder={form.fields.name.placeholder} className="studio-field" value={enquiry.name} onChange={(event) => update("name", event.target.value)} />
              </Field>
              <Field id="email" label={form.fields.email.label}>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder={form.fields.email.placeholder} className="studio-field" value={enquiry.email} onChange={(event) => update("email", event.target.value)} />
              </Field>
              <Field id="company" label={form.fields.company.label} className="md:col-span-2">
                <input id="company" name="company" type="text" autoComplete="organization" placeholder={form.fields.company.placeholder} className="studio-field" value={enquiry.company} onChange={(event) => update("company", event.target.value)} />
              </Field>
            </div>

            <fieldset>
              <legend className="text-label mb-4 text-black/45">{form.interests.label}</legend>
              <div className="flex flex-wrap gap-2">
                {form.interests.options.map((option) => (
                  <Chip key={option} active={enquiry.interests.includes(option)} onClick={() => toggleInterest(option)}>
                    {option}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-label mb-4 text-black/45">{form.budgets.label}</legend>
              <div className="flex flex-wrap gap-2">
                {form.budgets.options.map((option) => (
                  <Chip key={option} active={enquiry.budget === option} onClick={() => update("budget", enquiry.budget === option ? null : option)}>
                    {option}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <Field id="message" label={form.fields.message.label}>
              <textarea id="message" name="message" required rows={4} placeholder={form.fields.message.placeholder} className="studio-field resize-none" value={enquiry.message} onChange={(event) => update("message", event.target.value)} />
            </Field>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <PillButton type="submit" disabled={status === "sending"}>
                {status === "sending" ? form.sending : form.submit}
              </PillButton>
              <p className="text-xs text-black/45">{form.privacy}</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ id, label, className, children }: { id: string; label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("group/field", className)}>
      <label htmlFor={id} className="text-label block text-black/45 transition-colors group-focus-within/field:text-[#0b0c0e]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  const { play } = useSound();
  return (
    <button
      type="button"
      aria-pressed={active}
      onPointerEnter={() => play("hover")}
      onClick={() => {
        play("click");
        onClick();
      }}
      className={cn(
        "relative isolate h-10 overflow-hidden rounded-full border px-4 text-sm font-medium transition-[color,border-color] duration-500",
        active ? "border-[#0b0c0e] text-[#f2f3f5]" : "border-black/12 text-black/60 hover:border-black/40 hover:text-[#0b0c0e]",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0 -z-10 origin-bottom bg-[#0b0c0e] transition-transform duration-500 ease-[var(--ease-expo)]", active ? "scale-y-100" : "scale-y-0")}
      />
      {children}
    </button>
  );
}
