"use client";

import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

/**
 * Questions and answers as rows that open in place, with the same plus-to-
 * cross button and height animation as the open roles on /careers.
 * The first answer starts open.
 */
export function Faq({ items }: { items: readonly { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <ul className="border-b border-line">
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${id}-${index}`;
        return (
          <li key={item.question} className="border-t border-line">
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="group flex w-full items-center justify-between gap-6 py-7 text-start"
              >
                <span className="text-title font-medium transition-colors duration-500 group-hover:text-sky">{item.question}</span>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-500", expanded && "rotate-45 border-sky bg-sky text-ink-900")}>
                  <Plus aria-hidden className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={panelId}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: ease.expo }}
                  className="overflow-hidden"
                >
                  <p className="text-lead max-w-2xl pb-8 text-muted">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
