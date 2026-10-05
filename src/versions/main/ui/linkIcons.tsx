import type { ProjectLinkKind } from "@/data/portfolio";
import { Globe, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

/** Brand marks lucide no longer ships; simple single-colour glyphs. */
const brand = (path: string) => (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
    <path d={path} />
  </svg>
);

/** One small icon per outbound link kind — sites, app stores and social accounts (case studies, footer, contact). */
export const linkIcons: Record<ProjectLinkKind, ReactNode> = {
  website: <Globe aria-hidden className="size-4" />,
  app: <Smartphone aria-hidden className="size-4" />,
  appStore: brand("M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.1zM14 5.3c.7-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4z"),
  googlePlay: brand("M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1zm11 8.5 2.6-2.6L5.2 1.3zm0 2.4-9.4 9.5 12-6.9zm4-3.5 2.8 1.6c.8.5.8 1.3 0 1.8l-2.8 1.6-2.8-2.7z"),
  instagram: (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  facebook: brand("M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z"),
  linkedin: brand("M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2 9h4v12H2zM9 9h4v1.7C13.6 9.7 14.9 9 16.5 9 20 9 22 11 22 14.8V21h-4v-5.6c0-1.7-.7-2.7-2.1-2.7-1.5 0-2.9 1-2.9 3V21H9z"),
  tiktok: brand("M16.5 3c.4 2.3 1.9 3.8 4.5 4v3.6c-1.6 0-3.1-.5-4.5-1.3V16a6 6 0 1 1-6-6h.6v3.7a2.4 2.4 0 1 0 1.8 2.3V3z"),
  youtube: brand("M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9L15.5 12z"),
  x: brand("M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"),
  behance: brand("M8.2 11.3c1-.5 1.6-1.2 1.6-2.4C9.8 6.5 8 6 6 6H0v12h6.2c2.3 0 4.5-1.1 4.5-3.7 0-1.6-.8-2.8-2.5-3zM2.7 8h2.6c1 0 1.9.3 1.9 1.4 0 1.1-.7 1.5-1.7 1.5H2.7zm2.9 7.9H2.7v-3.3h3c1.2 0 2 .5 2 1.8 0 1.2-.9 1.5-2.1 1.5zM18 9c-3.2 0-5.3 2.3-5.3 5.2 0 3.1 2 5.2 5.3 5.2 2.5 0 4.1-1.1 4.9-3.5h-2.5c-.3.9-1.4 1.4-2.3 1.4-1.7 0-2.6-1-2.6-2.7h7.5C23.1 11.4 21.4 9 18 9zm-2.5 4.2c.1-1.4 1-2.2 2.4-2.2 1.4 0 2.2.8 2.3 2.2zM15.5 6.5h5.3v1.3h-5.3z"),
};
