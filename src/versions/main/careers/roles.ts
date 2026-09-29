import { roles } from "@/data/careers";
import type { Locale } from "@/i18n/config";
import { en } from "@/versions/main/content/en";
import { getCopy } from "@/versions/main/copy";

export const openApplicationId = en.careers.role.open.id;

/** Every role page, plus the open application. */
export const roleSlugs = () => [...roles.map((role) => role.id), openApplicationId];

/** A listed role, or the open application when the slug is "open-application". */
export function findRole(lang: Locale, slug: string) {
  const { copy, roles: list } = getCopy(lang);
  if (slug === openApplicationId) return { ...copy.careers.role.open, responsibilities: [] as readonly string[], requirements: [] as readonly string[], open: true };
  const role = list.find((item) => item.id === slug);
  return role ? { ...role, open: false } : null;
}

export type RoleDetail = NonNullable<ReturnType<typeof findRole>>;
