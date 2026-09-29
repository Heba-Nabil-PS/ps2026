"use client";

import { cn } from "@/lib/utils";
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const control =
  "peer w-full border-0 border-b border-line-strong bg-transparent px-0 pb-3 pt-2 text-lg text-fg placeholder:text-subtle transition-colors duration-500 focus:border-sky focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#f0a3a3]";

type Shared = { label: string; hint?: string; error?: string; optionalLabel?: string; className?: string };

function Frame({ id, label, hint, error, optionalLabel, className, children }: Shared & { id: string; children: ReactNode }) {
  return (
    <div className={cn("group relative flex flex-col", className)}>
      <label htmlFor={id} className="text-label mb-1 flex items-center gap-2 text-muted">
        {label}
        {optionalLabel ? <span className="normal-case tracking-normal text-subtle">({optionalLabel})</span> : null}
      </label>
      {children}
      <span aria-hidden className="pointer-events-none absolute bottom-0 start-0 h-px w-full origin-left scale-x-0 bg-sky transition-transform duration-700 ease-expo group-focus-within:scale-x-100 rtl:origin-right" />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#f0a3a3]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, hint?: string, error?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ label, hint, error, optionalLabel, className, ...input }: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Frame id={id} label={label} hint={hint} error={error} optionalLabel={optionalLabel} className={className}>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={control} {...input} />
    </Frame>
  );
}

export function TextArea({ label, hint, error, optionalLabel, className, ...input }: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Frame id={id} label={label} hint={hint} error={error} optionalLabel={optionalLabel} className={className}>
      <textarea id={id} rows={4} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(control, "resize-none")} {...input} />
    </Frame>
  );
}

export function SelectField({ label, hint, error, optionalLabel, className, children, ...select }: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Frame id={id} label={label} hint={hint} error={error} optionalLabel={optionalLabel} className={className}>
      <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} className={cn(control, "cursor-pointer appearance-none [&>option]:bg-ink-900")} {...select}>
        {children}
      </select>
    </Frame>
  );
}

/** Toggle chip for multi-select groups (a styled checkbox). */
export function Chip({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative cursor-pointer">
      <input type="checkbox" className="peer sr-only" {...input} />
      <span className="glass inline-flex rounded-full px-4 py-2.5 text-sm text-muted transition-colors duration-500 peer-checked:border-sky peer-checked:bg-sky peer-checked:text-ink-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-sky hover:text-fg peer-checked:hover:text-ink-900">
        {label}
      </span>
    </label>
  );
}

/** Invisible field bots fill in and people never see. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -start-[9999px] size-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
