"use client";

import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type FilterOption = { value: string | null; label: string; count: number };

type SingleProps = { multiple?: false; value: string | null; onChange: (value: string | null) => void };
type MultipleProps = { multiple: true; value: string[]; onChange: (value: string[]) => void };

/**
 * One facet of a filter bar: a glass pill that names the facet and shows the
 * current choice ("Service · Branding"), opening a panel of options with live
 * counts. Options with no results are disabled, so a combination can never
 * empty the grid. The pill turns sky while a choice is active.
 *
 * With `multiple`, options toggle on and off and the panel stays open; the
 * `null` option ("All") clears the facet, and the pill reads "Branding +2".
 *
 * The panel anchors to the nearest positioned ancestor: the whole bar on
 * phones (full width), the pill itself from `sm` up.
 */
export function FilterMenu({ label, options, ...props }: { label: string; options: FilterOption[] } & (SingleProps | MultipleProps)) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const chosen = props.multiple ? props.value : props.value === null ? [] : [props.value];
  const active = chosen.length > 0;
  const first = options.find((option) => option.value === chosen[0]);
  const summary = !first ? options[0].label : chosen.length > 1 ? `${first.label} +${chosen.length - 1}` : first.label;

  const choose = (value: string | null) => {
    if (!props.multiple) {
      props.onChange(value);
      setOpen(false);
    } else if (value === null) {
      props.onChange([]);
    } else {
      props.onChange(chosen.includes(value) ? chosen.filter((item) => item !== value) : [...chosen, value]);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="sm:relative"
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => setOpen((state) => !state)}
        className={cn(
          "relative flex min-h-11 items-center gap-2 rounded-full px-5 text-sm transition-colors duration-500",
          active ? "bg-sky text-ink-900" : "glass text-fg hover:border-line-strong",
        )}
      >
        <span className={active ? "text-ink-900/60" : "text-subtle"}>{label}</span>
        <span className="max-w-[9rem] truncate sm:max-w-none">{summary}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-500", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: ease.expo }}
            className="absolute inset-x-0 top-full z-20 pt-2 sm:inset-x-auto sm:start-0 sm:w-80"
          >
            <ul aria-label={label} className="rounded-3xl border border-line-strong bg-ink-900/95 p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl">
              {options.map((option) => {
                const selected = option.value === null ? !active : chosen.includes(option.value);
                const empty = option.count === 0 && !selected;
                return (
                  <li key={option.value ?? "all"}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={empty}
                      onClick={() => choose(option.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-start text-sm transition-colors duration-300",
                        empty ? "cursor-not-allowed text-subtle/60" : "hover:bg-paper/10 focus-visible:bg-paper/10",
                        selected ? "text-sky" : !empty && "text-fg",
                      )}
                    >
                      {props.multiple && option.value !== null ? (
                        <span className={cn("grid size-4 place-items-center rounded border transition-colors duration-300", selected ? "border-sky bg-sky text-ink-900" : "border-line-strong")}>
                          {selected ? <Check aria-hidden className="size-3" strokeWidth={3} /> : null}
                        </span>
                      ) : (
                        <span className="grid size-4 place-items-center">{selected ? <Check aria-hidden className="size-4" /> : null}</span>
                      )}
                      <span className="flex-1">{option.label}</span>
                      <span className="text-xs tabular-nums text-subtle">{option.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
