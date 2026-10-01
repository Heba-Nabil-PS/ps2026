import type { Role } from "@/data/careers";
import { roleHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

/** A role as one glass card: the whole card opens the role's own page. */
export function JobCard({ role }: { role: Pick<Role, "id" | "title" | "department" | "location" | "type" | "summary"> }) {
  return (
    <AppLink
      href={roleHref(role.id)}
      transitionLabel={role.title}
      className="glass group flex h-full min-h-72 flex-col rounded-card p-7 transition-[border-color,transform] duration-700 ease-expo hover:-translate-y-1 hover:border-sky/60 md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-label text-sky">{role.department}</span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100">
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </div>
      <h3 className="text-title mt-10 font-medium">{role.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{role.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-8 text-xs text-muted">
        <li className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
          <MapPin aria-hidden className="size-3.5 text-sky" />
          {role.location}
        </li>
        <li className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
          <Clock aria-hidden className="size-3.5 text-sky" />
          {role.type}
        </li>
      </ul>
    </AppLink>
  );
}
