"use client";

import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type Props = {
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  defaultValue?: readonly string[];
  optionalLabel?: string;
  error?: string;
  className?: string;
  /** Called whenever the selection changes (e.g. to clear an error). */
  onChange?: () => void;
};

/**
 * Dropdown with checkable options, in the underline style of the other fields.
 * Submits one `name` entry per chosen option (read with `FormData.getAll`).
 */
export function MultiSelect({ name, label, placeholder, options, defaultValue = [], optionalLabel, error, className, onChange }: Props) {
  const locale = useLocale();
  const id = useId();
  const [values, setValues] = useState<string[]>(() => options.filter((option) => defaultValue.includes(option)));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    requestAnimationFrame(() => list.current?.focus());
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const toggle = (option: string) => {
    setValues((current) => (current.includes(option) ? current.filter((value) => value !== option) : options.filter((o) => o === option || current.includes(o))));
    onChange?.();
  };

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(options[active]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      close();
    }
  };

  return (
    <div ref={root} className={cn("group relative flex flex-col", className)}>
      <label htmlFor={id} className="text-label mb-1 flex items-center gap-2 text-muted">
        {label}
        {optionalLabel ? <span className="normal-case tracking-normal text-subtle">({optionalLabel})</span> : null}
      </label>

      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        data-invalid={error ? "" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 border-0 border-b border-line-strong bg-transparent px-0 pb-3 pt-2 text-start text-lg transition-colors duration-500 focus:border-sky focus:outline-none data-[invalid]:border-danger"
      >
        <span className={cn("min-w-0 flex-1 truncate", values.length ? "text-fg" : "text-subtle")}>{values.length ? values.join(locale === "ar" ? "، " : ", ") : placeholder}</span>
        {values.length > 1 ? <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky text-xs font-medium tabular-nums text-ink-900">{values.length}</span> : null}
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-subtle transition-transform duration-300", open && "rotate-180")} />
      </button>
      <span aria-hidden className="pointer-events-none absolute bottom-0 start-0 h-px w-full origin-left scale-x-0 bg-sky transition-transform duration-700 ease-expo group-focus-within:scale-x-100 rtl:origin-right" />

      {values.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {open ? (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-multiselectable
          aria-label={label}
          tabIndex={-1}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
          data-lenis-prevent
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-card border border-line-strong bg-ink-900 py-1 shadow-2xl focus:outline-none"
        >
          {options.map((option, index) => {
            const selected = values.includes(option);
            return (
              <li
                key={option}
                id={`${id}-${index}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(index)}
                onClick={() => toggle(option)}
                className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors", index === active ? "bg-paper/10 text-fg" : "text-muted", selected && "text-sky")}
              >
                <span aria-hidden className={cn("grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors", selected ? "border-sky bg-sky text-ink-900" : "border-line-strong")}>
                  {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{option}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
