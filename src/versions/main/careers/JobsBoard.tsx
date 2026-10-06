"use client";

import { ease } from "@/lib/motion";
import { roleHref } from "@/versions/main/data/routes";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Label } from "@/versions/main/ui/Label";
import { useCopy } from "@/versions/main/use-copy";
import { fill } from "@/versions/main/copy";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Building2, Check, ChevronDown, MapPin, Search, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { JobCard } from "./JobCard";

const unique = (values: string[]) => Array.from(new Set(values));

/**
 * One labelled multi-select in the filter bar: a trigger resting on a hairline
 * that opens a checklist. An empty selection means "all".
 */
function FilterSelect({ icon: Icon, label, allLabel, value, options, onChange }: { icon: LucideIcon; label: string; allLabel: string; value: string[]; options: readonly string[]; onChange: (value: string[]) => void }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  const summary = value.length === 0 ? allLabel : value.length === 1 ? value[0] : `${value[0]} +${value.length - 1}`;

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-4 border-b pb-3 text-start transition-colors duration-500 focus:outline-none ${open ? "border-sky" : "border-line-strong hover:border-fg/40 focus-visible:border-sky"}`}
      >
        <Icon aria-hidden className="size-5 shrink-0 text-sky" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-label text-subtle">{label}</span>
          <span className={`truncate pt-0.5 font-medium ${value.length ? "text-fg" : "text-muted"}`}>{summary}</span>
        </span>
        <ChevronDown aria-hidden className={`size-4 shrink-0 text-muted transition-transform duration-500 ease-expo ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            role="group"
            aria-label={label}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: ease.expo }}
            className="absolute inset-x-0 top-full z-30 mt-2 min-w-56 rounded-card border border-line bg-ink-900 p-2 shadow-2xl"
          >
            {options.map((option) => {
              const checked = value.includes(option);
              return (
                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-fg/5 hover:text-fg has-focus-visible:bg-fg/5">
                  <input type="checkbox" checked={checked} onChange={() => toggle(option)} className="sr-only" />
                  <span aria-hidden className={`grid size-4 shrink-0 place-items-center rounded-sm border transition-colors ${checked ? "border-sky bg-sky text-ink-900" : "border-line-strong"}`}>
                    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span className={checked ? "text-fg" : undefined}>{option}</span>
                </label>
              );
            })}
            {value.length ? (
              <button type="button" onClick={() => onChange([])} className="mt-1 w-full border-t border-line px-3 pt-2.5 pb-1.5 text-start text-xs text-subtle transition-colors hover:text-fg">
                {allLabel}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Open roles as a searchable grid. Each card opens the role's own page, where
 * the description, responsibilities, requirements and application form live.
 */
export function JobsBoard() {
  const { copy, roles, departments } = useCopy();
  const labels = copy.careers.roles;
  const open = copy.careers.role.open;

  const locations = unique(roles.map((role) => role.location));
  const types = unique(roles.map((role) => role.type));

  const [department, setDepartment] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  /** Phones keep the three filters behind one button (their panel open or not). */
  const [showFilters, setShowFilters] = useState(false);
  const active = department.length + location.length + type.length;

  const needle = query.trim().toLowerCase();
  const visible = roles.filter((role) => {
    if (department.length && !department.includes(role.department)) return false;
    if (location.length && !location.includes(role.location)) return false;
    if (type.length && !type.includes(role.type)) return false;
    if (!needle) return true;
    return [role.title, role.department, role.location, role.type, role.summary, ...role.requirements].some((text) => text.toLowerCase().includes(needle));
  });
  const filtered = Boolean(department.length || location.length || type.length || needle);
  const reset = () => {
    setDepartment([]);
    setLocation([]);
    setType([]);
    setQuery("");
  };
  const [before, after = ""] = fill(labels.showing, { total: String(roles.length) }).split("{shown}");

  return (
    <section id="roles" className="gutter section-y scroll-mt-24" aria-labelledby="roles-title">
      <div>
        <Label className="mb-6">{labels.label}</Label>
        <div id="roles-title">
          <StretchHeading lines={labels.title} className="text-headline" />
        </div>
      </div>

      <div role="search" aria-label={labels.filterLabel} className="mt-10 grid gap-x-10 gap-y-6 md:mt-14 md:gap-y-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Phones: the search and a filters button share a row; from md up the row dissolves into the grid. */}
        <div className="flex items-end gap-3 md:contents">
        <label className="flex min-w-0 flex-1 cursor-text items-center gap-4 border-b border-line-strong pb-3 transition-colors duration-500 hover:border-fg/40 focus-within:border-sky md:col-span-2 lg:col-span-1">
          <Search aria-hidden className="size-5 shrink-0 text-sky" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-label text-subtle">{labels.filters.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search.placeholder}
              aria-label={labels.search.label}
              className="w-full bg-transparent pt-0.5 text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </span>
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label={labels.clear} className="-my-1.5 -me-1.5 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-fg">
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
        </label>
          <button
            type="button"
            aria-expanded={showFilters}
            aria-controls="role-filters"
            onClick={() => setShowFilters((current) => !current)}
            className={cn(
              "flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-500 md:hidden",
              showFilters || active ? "border-sky text-fg" : "border-line-strong text-muted",
            )}
          >
            <SlidersHorizontal aria-hidden className="size-4 text-sky" />
            {labels.filters.toggle}
            {active ? <span className="grid size-5 place-items-center rounded-full bg-sky text-[0.7rem] font-semibold tabular-nums text-ink-900">{active}</span> : null}
          </button>
        </div>

        <div id="role-filters" className={cn("grid gap-y-6 md:contents", !showFilters && "max-md:hidden")}>
        <FilterSelect icon={Building2} label={labels.filters.department} allLabel={labels.filters.allDepartments} value={department} options={departments} onChange={setDepartment} />
        <FilterSelect icon={MapPin} label={labels.filters.location} allLabel={labels.filters.allLocations} value={location} options={locations} onChange={setLocation} />
        <FilterSelect icon={SlidersHorizontal} label={labels.filters.type} allLabel={labels.filters.allTypes} value={type} options={types} onChange={setType} />
        </div>
      </div>

      {/* The count, with the way back to every role beside it while anything narrows the list. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="text-sm text-muted">
          {before}
          <strong className="font-semibold tabular-nums text-fg">{visible.length}</strong>
          {after}
        </p>
        {filtered ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted underline decoration-line-strong underline-offset-8 transition-colors hover:text-fg hover:decoration-sky">
            <X aria-hidden className="size-3.5" />
            {labels.clear}
          </button>
        ) : null}
      </div>

      <ul className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((role) => (
            <motion.li
              key={role.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: ease.expo }}
            >
              <JobCard role={role} />
            </motion.li>
          ))}

          {/* Always last: the way in when no listed role fits. */}
          <motion.li key={open.id} layout transition={{ duration: 0.5, ease: ease.expo }}>
            <AppLink
              href={roleHref(open.id)}
              transitionLabel={open.title}
              className="group flex h-full min-h-72 flex-col rounded-card border border-dashed border-line-strong p-7 transition-colors duration-700 ease-expo hover:border-sky md:p-8"
            >
              <span className="text-label text-subtle">{visible.length === 0 ? (needle ? labels.noMatch : labels.empty) : open.prompt}</span>
              <h3 className="text-title mt-10 font-medium">{open.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{open.summary}</p>
              <span className="mt-auto inline-flex items-center gap-3 pt-8 text-sm text-fg underline decoration-line-strong underline-offset-8 transition-colors group-hover:decoration-sky">
                {open.cta}
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
              </span>
            </AppLink>
          </motion.li>
        </AnimatePresence>
      </ul>

    </section>
  );
}
