"use client";

import type { Role } from "@/data/careers";
import { fill } from "@/versions/main/copy";
import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ApplicationForm } from "./ApplicationForm";
import { roleHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight, Plus } from "lucide-react";

/**
 * Open roles and the application, sharing one state: "Apply for this role"
 * preselects the role and brings the form into view at step one, so a
 * candidate goes from reading a role to sending their work in a few clicks.
 */
export function CareersBoard() {
  const { copy, roles, departments } = useCopy();
  const labels = copy.careers.roles;
  const params = useSearchParams();
  const lenis = useLenis();
  const formRef = useRef<HTMLDivElement>(null);

  const [department, setDepartment] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const initialRole = params.get("role");
  const [role, setRole] = useState<string>(roles.some((r) => r.id === initialRole) ? (initialRole as string) : "");

  const visible = department ? roles.filter((r) => r.department === department) : roles;
  // Filter tabs for the main teams only; roles in other teams still list under "All teams".
  const tabs = departments.slice(0, 4);

  const apply = (item: Role) => {
    setRole(item.id);
    const target = formRef.current;
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -110 });
    else target.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => target.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true }), 900);
  };

  return (
    <>
      <section className="gutter section-y" aria-labelledby="roles-title">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-label mb-6 text-muted">{labels.label}</p>
            <h2 id="roles-title" className="stretch text-headline">
              {labels.title.map((line) => (
                <span key={line} data-line className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
          <LayoutGroup>
            <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2 md:col-span-5 md:justify-end">
              {[null, ...tabs].map((item) => {
                const active = department === item;
                return (
                  <button
                    key={item ?? "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDepartment(item)}
                    className={cn("glass relative cursor-pointer rounded-full px-4 py-2 text-sm transition-colors", active ? "text-ink-900" : "text-muted hover:text-fg")}
                  >
                    {active ? <motion.span layoutId="dept-chip" className="absolute inset-0 rounded-full bg-sky" transition={{ type: "spring", stiffness: 380, damping: 34 }} /> : null}
                    <span className="relative">{item ?? labels.allTeams}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <ul className="mt-14 border-b border-line md:mt-20">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((item) => {
              const expanded = open === item.id;
              const panelId = `role-${item.id}`;
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: ease.expo }}
                  className="border-t border-line"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpen(expanded ? null : item.id)}
                      className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 py-7 text-start md:grid-cols-12 md:gap-8"
                    >
                      <span className="text-title font-medium transition-colors duration-500 group-hover:text-sky md:col-span-6">{item.title}</span>
                      <span className="hidden text-sm text-muted md:col-span-2 md:block">{item.department}</span>
                      <span className="hidden text-sm text-muted md:col-span-2 md:block">{item.location}</span>
                      <span className="flex items-center justify-end gap-4 md:col-span-2">
                        <span className="hidden text-sm text-subtle lg:inline">{item.type}</span>
                        <span className={cn("grid size-10 place-items-center rounded-full border border-line-strong transition-all duration-500", expanded && "rotate-45 border-sky bg-sky text-ink-900")}>
                          <Plus aria-hidden className="size-4" />
                        </span>
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
                        <div className="grid gap-10 pb-10 md:grid-cols-12 md:gap-8">
                          <p className="text-lead text-muted md:col-span-5">{item.summary}</p>
                          <div className="md:col-span-3 md:col-start-7">
                            <p className="text-label mb-4 text-subtle">{labels.youWill}</p>
                            <ul className="space-y-2 text-sm">
                              {item.responsibilities.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="md:col-span-3">
                            <p className="text-label mb-4 text-subtle">{labels.youBring}</p>
                            <ul className="space-y-2 text-sm">
                              {item.requirements.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-wrap items-center gap-6 md:col-span-12">
                            <button
                              type="button"
                              onClick={() => apply(item)}
                              className="sheen inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] px-6 text-[0.95rem] font-medium text-[#07121f]"
                            >
                              {labels.apply}
                            </button>
                            <AppLink
                              href={roleHref(item.id)}
                              transitionLabel={item.title}
                              className="group inline-flex items-center gap-3 text-sm text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky"
                            >
                              {copy.careers.role.view}
                              <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
                            </AppLink>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {visible.length === 0 ? <p className="mt-8 text-muted">{labels.empty}</p> : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <p className="text-title font-medium">{copy.careers.role.open.prompt}</p>
          <AppLink
            href={roleHref(copy.careers.role.open.id)}
            transitionLabel={copy.careers.role.open.title}
            className="group inline-flex items-center gap-3 text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky"
          >
            {copy.careers.role.open.cta}
            <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
          </AppLink>
        </div>
      </section>

      <div ref={formRef} id="apply" className="scroll-mt-28">
        <ApplicationForm role={role} onRoleChange={setRole} subjectFor={(title) => fill(copy.careers.apply.email.subject, { role: title })} />
      </div>
    </>
  );
}
