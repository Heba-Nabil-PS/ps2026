# PSdigital — Website

The PSdigital website, built from `PS_Website_Direction_Final.pptx`: **futuristic, minimal, premium**. Dark navy to black, stretched display type, reeded glass, one sculptural 3D form, and black-and-white imagery that turns to colour when the work is "lit".

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, GSAP (ScrollTrigger), Framer Motion, Lenis and React Three Fiber. English at `/`, Arabic (RTL) at `/ar`.

**Read first:** [`docs/website-direction.md`](docs/website-direction.md) covers the strategy, design principles, sitemap, section purposes, motion system and component map. [`docs/design-versions.md`](docs/design-versions.md) explains how the site runs more than one design (the current one, and the previous one as **Home Option 2** at `/option-2`), and how to add another.

## Run

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Real domain for canonical URLs, Open Graph and the sitemap (e.g. `https://www.psdigital.me`) |
| `FORMS_WEBHOOK_URL` | Where careers applications and project enquiries are posted (`multipart/form-data`, with a `form` field of `application` or `enquiry`; applications include the PDF). Without it, forms validate and then open a pre-filled email. |

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Hero (floating discs that the scroll gathers into the logo) → positioning → selected work → services index → industries → clients → process → insights → call to action |
| `/work`, `/work/[slug]` | 14 case studies, filterable by discipline (`?category=branding`) and industry (`?industry=restaurants`); case-study pages |
| `/services`, `/services/[slug]` | The deck's six disciplines as stacking cards (`/services#branding` deep-links); a page per discipline with deliverables, work, industries and FAQ |
| `/industries`, `/industries/[slug]` | Five sectors, each with the problems we solve, how we help and its case studies |
| `/about` | Story, numbers, principles, process, studios |
| `/insights`, `/insights/[slug]` | Articles written from the work, filterable by topic |
| `/careers`, `/careers/[slug]` | Roles plus a three-step application (`?role=motion-designer` preselects); a page per role, and `/careers/open-application` |
| `/contact` | Enquiry form (`?service=branding` preselects), direct lines, link to the brief, studios |
| `/start` | Start a project: a single-form brief (`?service=branding` preselects) |
| `/team` | Leadership, discipline leads, crafts (linked from the footer) |

Old URLs (`/case-studies`, `/portfolio`, `/projects`, `/home-opt2`) redirect permanently to `/work` or `/` (see `next.config.ts`).

**Home Option 2** (`/option-2`, `/ar/option-2`) is the previous design, running as a complete standalone site: home, services, case studies, team, careers, contact, about, projects and portfolio. Reach it from the **Home** dropdown; inside it, the corner pill switches back. It is `noindex`.

## Editing

| What | Where |
| --- | --- |
| Words (both languages) | `src/versions/main/content/en.ts` and `ar.ts`, which have the same shape; TypeScript flags any missing key |
| Company facts: offices, clients, team, process, stats | `src/lib/site.ts` (+ `site.ar.ts`) |
| Case studies | `src/data/portfolio.ts` (+ `portfolio.ar.ts`); media in `public/images/projects/<slug>/` |
| Which cases appear on the home page | `featuredSlugs` in `src/versions/main/data/work.ts` |
| Open roles | `src/data/careers.ts` (+ `careers.ar.ts`) |
| Industries (and which cases belong to each) | `src/data/industries.ts` (+ `industries.ar.ts`) |
| Insights (articles) | `src/data/insights.ts` (+ `insights.ar.ts`) |
| Colours, type scale, glass, grain | `src/versions/main/styles.css` (`@theme` tokens at the top) |
| Motion tokens | `src/lib/motion.ts`; GSAP is registered in `src/lib/gsap.ts` |

## Brand notes

- **Display face** (banner titles and section headings): **Anybody** (a variable font with a width axis); headlines animate along that axis.
- **Text face:** Helvetica Neue where installed, Inter Tight otherwise. **Arabic:** IBM Plex Sans Arabic.
- **Client logos** are PNGs on opaque white. The wall inverts and screen-blends them into white silhouettes, and they show in colour on hover.

## Accessibility and performance

- Reduced motion switches off smooth scrolling, 3D motion (a single still frame is rendered), blur and stretch reveals, and parallax. Content still appears.
- The home page's WebGL background is lazy-loaded, stops drawing while the tab is hidden, lowers its resolution if frames run long, and falls back to a sliced SVG logo without WebGL.
- Fine-pointer-only effects: cursor lens, magnetic buttons.
- Forms: labelled fields, inline errors announced with `role="alert"`, focus moved to the first error, a honeypot, and server-side validation.

## Previous site

The previous design is live as **Home Option 2**. Its code lives in `src/versions/option-2/`, and its routes are in `src/app/[lang]/(option-2)/option-2/`. `archive/previous-site/` is the untouched snapshot it was restored from, kept for reference and excluded from the build.

Housekeeping: `src/components/` is now a set of empty folders. They were left behind because the running dev server held them open during the move, so delete them once the dev server is stopped.
