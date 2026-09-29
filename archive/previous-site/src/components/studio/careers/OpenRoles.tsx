"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { PillButton } from "@/components/studio/PillButton";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import type { Role } from "@/data/careers";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Open roles as an editorial index: department filters with a sliding ink
 * pill, rows that rise in on scroll, and one role open at a time.
 */
export function OpenRoles() {
  const { careersPage, roles } = useContent();
  const copy = careersPage.roles;
  const departments = Array.from(new Set(roles.map((role) => role.department)));
  const section = useRef<HTMLElement>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const { play } = useSound();

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-role-row]", {
          yPercent: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.06,
          scrollTrigger: { trigger: "[data-role-list]", start: "top 80%", once: true },
        });
      });
    },
    { scope: section },
  );

  const visible = roles.filter((role) => department === null || role.department === department);
  const filters: { label: string; value: string | null }[] = [{ label: copy.allTeams, value: null }, ...departments.map((name) => ({ label: name, value: name }))];

  return (
    <section ref={section} id="roles" aria-labelledby="roles-title" className="relative bg-[#eceef2] px-4 py-28 text-[#0b0c0e] md:px-8 md:py-40">
      <header className="mb-14 grid grid-cols-1 items-end gap-8 md:mb-20 md:grid-cols-12">
        <SplitReveal as="h2" id="roles-title" type="chars" className="font-medium tracking-[-0.055em] text-[clamp(3rem,10vw,11rem)] md:col-span-8 leading-[0.86]">
          <span className="block">{copy.title[0]}</span>
          <span className="block ps-[0.8em] font-serif font-light italic">{copy.title[1]}</span>
        </SplitReveal>
        <p className="text-label text-black/50 md:col-span-4 md:pb-4 md:text-end" aria-live="polite">
          ({String(visible.length).padStart(2, "0")}) {copy.label}
        </p>
      </header>

      <LayoutGroup>
        <ul className="mb-10 flex flex-wrap gap-2" role="list" aria-label={copy.filterLabel}>
          {filters.map((item) => {
            const active = item.value === department;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  aria-pressed={active}
                  onPointerEnter={() => play("hover")}
                  onClick={() => {
                    play("click");
                    setDepartment(item.value);
                    setOpenId(null);
                  }}
                  className={cn(
                    "relative isolate h-10 rounded-full px-4 text-sm font-medium transition-colors duration-500",
                    active ? "text-[#f2f3f5]" : "text-black/60 hover:text-[#0b0c0e]",
                  )}
                >
                  {active ? (
                    <motion.span layoutId="role-filter" aria-hidden className="absolute inset-0 -z-10 rounded-full bg-[#0b0c0e]" transition={{ duration: 0.6, ease: ease.expo }} />
                  ) : (
                    <span aria-hidden className="absolute inset-0 -z-10 rounded-full border border-black/10" />
                  )}
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>

      <ul data-role-list className="border-t border-black/10">
        <AnimatePresence initial={false}>
          {visible.map((role) => (
            <motion.li
              key={role.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.6, ease: ease.expo }}
              className="border-b border-black/10"
            >
              <RoleRow role={role} open={openId === role.id} onToggle={() => setOpenId((current) => (current === role.id ? null : role.id))} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {visible.length === 0 ? <p className="mt-10 max-w-md text-black/60">{copy.empty}</p> : null}
    </section>
  );
}

function RoleRow({ role, open, onToggle }: { role: Role; open: boolean; onToggle: () => void }) {
  const { play } = useSound();
  const { careersPage, applyHref } = useContent();
  const copy = careersPage.roles;
  const panelId = `role-${role.id}`;

  return (
    <div data-role-row className="group relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onPointerEnter={() => play("hover")}
        onClick={() => {
          play("click");
          onToggle();
        }}
        className="relative z-10 grid w-full grid-cols-[1fr_auto] items-center gap-6 py-7 text-start md:grid-cols-[1fr_auto_auto] md:gap-10 md:py-9"
      >
        <span>
          <span className={cn("block text-2xl font-medium tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-expo)] md:text-4xl", !open && "group-hover:translate-x-3 rtl:group-hover:-translate-x-3")}>
            {role.title}
          </span>
          <span className="mt-2 block text-sm text-black/55 md:hidden">
            {role.department} · {role.location} · {role.type}
          </span>
        </span>
        <span className="text-label hidden gap-6 text-black/50 md:flex">
          <span className="w-28">{role.department}</span>
          <span className="w-36">{role.location}</span>
          <span className="w-20">{role.type}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "grid size-11 place-items-center rounded-full border border-black/15 transition-[transform,background-color,color] duration-500 ease-[var(--ease-expo)]",
            open ? "rotate-45 bg-[#0b0c0e] text-[#f2f3f5]" : "group-hover:bg-[#0b0c0e] group-hover:text-[#f2f3f5]",
          )}
        >
          <Plus className="size-4" />
        </span>
      </button>
      <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-full origin-bottom scale-y-0 bg-black/[0.04] transition-transform duration-700 ease-[var(--ease-expo)]", !open && "group-hover:scale-y-100")} />

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.45, ease: ease.quart } }}
            transition={{ height: { duration: 0.8, ease: ease.expo }, opacity: { duration: 0.5, delay: 0.1 } }}
            className="relative z-10 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12 md:pb-16">
              <p className="text-lg leading-snug text-black/70 md:col-span-5 md:text-xl">{role.summary}</p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-7">
                <div>
                  <p className="text-label mb-4 text-black/45">{copy.youWill}</p>
                  <ul className="flex flex-col gap-2 text-sm leading-relaxed text-black/70 md:text-base">
                    {role.responsibilities.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#88bbd8]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-label mb-4 text-black/45">{copy.youBring}</p>
                  <ul className="flex flex-col gap-2 text-sm leading-relaxed text-black/70 md:text-base">
                    {role.requirements.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#88bbd8]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:col-span-12">
                <PillButton href={applyHref(role)} external>
                  {copy.apply}
                </PillButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
