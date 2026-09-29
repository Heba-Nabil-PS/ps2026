# Design versions

The site can run several complete designs side by side. Each one is a standalone website with its own layout, styles, fonts, components and motion, and all of them share the same content, data, languages and images.

| Version | URL | What it is | Indexed |
| --- | --- | --- | --- |
| `main` | `/`, `/ar` | The current design (docs/website-direction.md) | Yes |
| `option-2` | `/option-2`, `/ar/option-2` | The previous design, restored as "Home Option 2" | No (`noindex, follow`) |

Visitors switch versions from the **Home** dropdown in the main navigation (and the mobile menu). Inside Option 2, the **View the current design** pill in the corner switches back to the equivalent page: `/option-2/about` goes to `/about`.

## How it is built

```
src/
  versions/
    registry.ts            the list of versions (id, URL base, labels, indexed) + URL helpers
    VersionProvider.tsx    tells client code which version it is in
    main/                  current design: shell, ui, motion, three, sections, pages' parts, copy, styles.css
    option-2/              previous design: components, data, i18n (content + dictionary), audio, styles.css
  shared/                  used by both, and only what truly is: Logo, logo paths, SmoothScroll (Lenis)
  i18n/                    shared: locales, LocaleProvider, version-aware useLocalizeHref, alternatesFor
  lib/, data/              shared: site facts, case studies, roles, GSAP/motion setup, utilities, forms

  app/[lang]/
    (main)/layout.tsx      root layout of the main design (html, fonts, main styles.css, providers)
    (main)/…               main pages
    (option-2)/layout.tsx  root layout of Option 2 (its own html, fonts, styles.css, providers)
    (option-2)/option-2/…  Option 2 pages, in their original route groups: (studio), (site), portfolio
```

**Why separate root layouts?** Next.js does a full page load when you navigate between root layouts. So one design's CSS, fonts and providers (smooth scroll, page transitions, sound, cursor) can never leak into another. Each stylesheet also restricts Tailwind's scan (`@source`) to its own folder, the shared layer and the routes.

**Links stay inside their version.** `useLocalizeHref()` (and every link component built on it, such as `AppLink` in main and `TransitionLink` in Option 2) prefixes internal paths with the locale *and* the current version's base. A component written as `href="/services"` goes to `/option-2/services` inside Option 2. On the server, pass the version to `alternatesFor(path, locale, "option-2")` for canonical and hreflang URLs.

**Reading the current path.** `parseRoute(pathname)` returns `{ locale, version, pathname }` with both prefixes removed. Use it for active-link states and route checks.

## Adding a design (e.g. `option-3`)

1. **Register it.** Add an entry to `versions` in `src/versions/registry.ts` and extend the `VersionId` type. The Home dropdown and the mobile menu pick it up automatically.
2. **Code:** create `src/versions/option-3/` with its components and a `styles.css`. Start that file with:
   ```css
   @import "tailwindcss" source(none);
   @source "./";
   @source "../../shared";
   @source "../../app";
   @source "../../lib";
   ```
3. **Routes:** create `src/app/[lang]/(option-3)/layout.tsx`, a root layout that renders `<html>`, loads its fonts and stylesheet, and wraps children in `<LocaleProvider>` and `<VersionProvider version="option-3">`. Use `(option-2)/layout.tsx` as the template, including `robots: { index: getVersion(id).indexed }`.
4. **Pages:** add them under `src/app/[lang]/(option-3)/option-3/…`, plus a `not-found.tsx` and a `[...missing]/page.tsx` so unknown URLs get that design's 404.
5. **Switch back:** give the new design a way back to the main site. See `versions/option-2/components/navigation/VersionSwitch.tsx`: a plain `<a>` to `versionHref(pathname, "main", locale)`.
6. Reuse content from `src/data`, `src/lib/site.ts` and each version's own copy files, so the facts stay identical across designs.

## Notes

- **Routes render one component** (STACK-AND-STRUCTURE.md §3, enforced by ESLint). A `page.tsx`, `layout.tsx` or `not-found.tsx` under `src/app` only reads params, looks data up, calls `notFound()` and exports metadata, then renders one view from its version: `AboutView`, `CaseView`, `StudioShell` and so on, next to the parts they use in `src/versions/<id>/`. Each design's root layout keeps `<html>`/`<head>`/`<body>` and puts everything inside `<body>` in that version's `AppShell`.
- **Content that only Option 2 uses** (its page copy and dictionary) lives in `src/versions/option-2/data` and `src/versions/option-2/i18n`. Case studies (`src/data/portfolio.ts`), roles (`src/data/careers.ts`) and company facts (`src/lib/site.ts`) are shared. Editing them updates both designs.
- `siteConfig.nav`, `moreNav` and `studioRoutes` in `src/lib/site.ts` belong to Option 2's navigation. The main design's navigation is in `src/versions/main/content/en.ts`.
- The sitemap lists only indexed versions (the main site).
- `archive/previous-site/` is the untouched snapshot the Option 2 routes were restored from, and is reference only.
