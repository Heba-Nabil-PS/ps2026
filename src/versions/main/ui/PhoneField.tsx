"use client";

import { countries, defaultCountry, type Country } from "@/data/countries";
import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

type Copy = { label: string; placeholder: string; country: string; search: string; empty: string };

/** Flag images from flagcdn (emoji flags do not render on Windows). */
function Flag({ iso }: { iso: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://flagcdn.com/${iso.toLowerCase()}.svg`} alt="" width={20} height={15} loading="lazy" className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover" />;
}

/**
 * Phone number with a searchable country picker (flag, name, ISO code, dial code).
 * Submits `phone` as "+<dial> <number>" (empty when no number is typed) and `phoneCountry` as the ISO code.
 */
export function PhoneField({ copy, optionalLabel, name = "phone", error, onInput, defaultIso = defaultCountry }: { copy: Copy; optionalLabel?: string; name?: string; error?: string; onInput?: () => void; defaultIso?: string }) {
  const locale = useLocale();
  const id = useId();
  const [iso, setIso] = useState(defaultIso);
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const named = useMemo(() => {
    let display: Intl.DisplayNames | null = null;
    try {
      display = new Intl.DisplayNames([locale], { type: "region" });
    } catch {}
    const nameOf = (code: string) => {
      try {
        return display?.of(code) ?? code;
      } catch {
        return code;
      }
    };
    return countries.map((c) => ({ ...c, name: nameOf(c.iso) })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  const selected: Country = countries.find((c) => c.iso === iso) ?? countries[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return named;
    return named.filter((c) => c.name.toLowerCase().includes(q) || c.iso.toLowerCase().startsWith(q) || c.dial.slice(1).startsWith(q));
  }, [named, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    requestAnimationFrame(() => {
      search.current?.focus({ preventScroll: true });
      // Scroll only the list (scrollIntoView would also move the page) so the chosen country sits in the middle.
      const ul = list.current;
      const item = ul?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (ul && item) ul.scrollTop = item.offsetTop - ul.clientHeight / 2 + item.offsetHeight / 2;
    });
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    const ul = list.current;
    const item = ul?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!ul || !item) return;
    if (item.offsetTop < ul.scrollTop) ul.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > ul.scrollTop + ul.clientHeight) ul.scrollTop = item.offsetTop + item.offsetHeight - ul.clientHeight;
  }, [active]);

  const choose = (code: string) => {
    setIso(code);
    setOpen(false);
    setQuery("");
    requestAnimationFrame(() => input.current?.focus());
  };

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active].iso);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const trimmed = number.trim();

  return (
    <div ref={root} className="group relative flex flex-col">
      <label htmlFor={id} className="text-label mb-1 flex items-center gap-2 text-muted">
        {copy.label}
        {optionalLabel ? <span className="normal-case tracking-normal text-subtle">({optionalLabel})</span> : null}
      </label>

      <div dir="ltr" className="relative flex items-end border-b border-line-strong transition-colors duration-500 focus-within:border-sky">
        <button
          type="button"
          aria-label={`${copy.country}: ${selected.iso} ${selected.dial}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            setActive(Math.max(0, named.findIndex((c) => c.iso === iso)));
            setOpen((v) => !v);
          }}
          className="me-3 flex shrink-0 items-center gap-2 pb-3 pt-2 text-lg text-fg transition-colors hover:text-sky focus:outline-none focus-visible:text-sky"
        >
          <Flag iso={selected.iso} />
          <span className="text-sm text-muted">{selected.iso}</span>
          <span className="tabular-nums">{selected.dial}</span>
          <ChevronDown aria-hidden className={cn("size-4 text-subtle transition-transform duration-300", open && "rotate-180")} />
        </button>
        <input
          ref={input}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={number}
          onChange={(event) => {
            setNumber(event.target.value);
            onInput?.();
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={copy.placeholder}
          className="w-full min-w-0 flex-1 border-0 bg-transparent px-0 pb-3 pt-2 text-lg text-fg placeholder:text-subtle focus:outline-none"
        />
        <span aria-hidden className="pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-sky transition-transform duration-700 ease-expo group-focus-within:scale-x-100" />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <input type="hidden" name={name} value={trimmed ? `${selected.dial} ${trimmed}` : ""} />
      <input type="hidden" name={`${name}Country`} value={selected.iso} />

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-line-strong bg-ink-900 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search aria-hidden className="size-4 shrink-0 text-subtle" />
            <input
              ref={search}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKey}
              placeholder={copy.search}
              aria-label={copy.search}
              aria-controls={`${id}-list`}
              aria-activedescendant={filtered[active] ? `${id}-${filtered[active].iso}` : undefined}
              className="w-full bg-transparent py-3 text-sm text-fg placeholder:text-subtle focus:outline-none"
            />
          </div>
          <ul ref={list} id={`${id}-list`} role="listbox" aria-label={copy.country} data-lenis-prevent className="relative max-h-72 overflow-y-auto overscroll-contain py-1 [scrollbar-color:var(--color-line-strong)_transparent] [scrollbar-width:thin]">
            {filtered.length ? (
              filtered.map((c, index) => (
                <li
                  key={c.iso}
                  id={`${id}-${c.iso}`}
                  data-index={index}
                  role="option"
                  aria-selected={c.iso === iso}
                  onPointerEnter={() => setActive(index)}
                  onClick={() => choose(c.iso)}
                  className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors", index === active ? "bg-paper/10 text-fg" : "text-muted", c.iso === iso && "text-sky")}
                >
                  <Flag iso={c.iso} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-subtle">{c.iso}</span>
                  <span dir="ltr" className="w-14 text-end tabular-nums">
                    {c.dial}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-subtle">{copy.empty}</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
