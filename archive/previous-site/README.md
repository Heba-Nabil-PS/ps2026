# PSdigital — Agency Site

The PSdigital website: a full-service digital agency for MENA and beyond. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, GSAP ScrollTrigger and Lenis.

Content, artwork and identity come from the source files kept in the repo root:

- `Psdigital Portfolio.pdf` — the company profile (clients, case studies, team, process)
- `New Identity Presentation.pdf` + `Psdigital Logo-01.svg` — palette, typography and the master logo

It contains two project experiences:

| Route | Experience |
| --- | --- |
| `/projects`, `/projects/[slug]` | "Work" — six flagship partnerships, long-form (Framer Motion) |
| `/portfolio`, `/portfolio/[slug]` | The full index — 14 case studies with cinematic cards, card → case-study morph transitions and block-based storytelling (GSAP + View Transitions) |

Every page also exists in Arabic, right-to-left, under `/ar` (`/ar/services`, `/ar/case-studies/texas-chicken`…). See [Arabic version](#arabic-version).

## Run

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.psdigital.me`) in production so canonical URLs, Open Graph images and the sitemap use the real domain.

## Customise

| What | Where |
| --- | --- |
| Colours, fonts, easing, type scale, view-transition timing | `src/app/globals.css` + `src/app/[lang]/layout.tsx` (fonts) |
| Agency name, email, offices, navigation, services, clients, team, process | `src/lib/site.ts` |
| `/projects` content | `src/data/projects.ts` |
| `/portfolio` content | `src/data/portfolio.ts` |
| Motion timing and springs (Framer Motion) | `src/lib/motion.ts` |
| Sound files and volumes | `src/lib/sound.ts` |
| Arabic copy | the `*.ar.ts` file next to each of the above, plus `src/i18n/dictionary.ts` for interface labels |

### Adding a portfolio project

1. Add media to `public/images/projects/<slug>/` (and optionally `public/videos/projects/<slug>/`).
2. Append an object to `portfolio` in `src/data/portfolio.ts`.

The card, case study, metadata, sitemap and next/previous links update automatically. Asset paths are resolved by the `assets(slug)` helper at the top of that file.

Case studies are composed from content blocks. Each `type` maps to a component in `src/components/portfolio/blocks/`:

`hero` · `image` · `fullWidthImage` · `video` · `gallery` · `posts` · `twoColumn` · `text` · `quote` · `stats` · `3d` · `interactive`

`posts` is the campaign grid: social posts, screens and key visuals shown whole, never cropped into the artwork. Its `shape` picks the frame (`portrait` · `square` · `story` · `phone` · `screen` · `wide`); `screen` fits whole-page captures inside the frame.

## Arabic version

English keeps its unprefixed URLs; Arabic lives under `/ar`. All routes sit in `src/app/[lang]`, and `src/proxy.ts` rewrites unprefixed requests to `/en/…` internally (an explicit `/en/…` URL redirects to the clean one). The root layout sets `<html lang dir>`, loads the Arabic fonts (IBM Plex Sans Arabic, with Noto Naskh Arabic for the accent lines) and emits canonical + hreflang links; the sitemap lists both languages.

- **Content** — every data file has an Arabic twin: `src/lib/site.ar.ts`, `src/data/*.ar.ts`. `src/i18n/content.ts` picks the right set per locale; components read it with `useContent()` (client) or `getServerContent()` (server). When you add or edit a project, role or service, update both files — the Arabic ones keep the same slugs, order and media.
- **Service titles** in `site.ar.ts` are also the Arabic filter keys used by portfolio `services` arrays and the contact form, so they must match exactly.
- **Interface labels** (buttons, aria text, page metadata) are in `src/i18n/dictionary.ts`.
- **Links** — `TransitionLink` adds the locale prefix to internal paths automatically; plain `next/link` needs `useLocalizeHref()`. The language switch (header and navbar) is `components/navigation/LanguageSwitch.tsx`.
- **RTL** — layout classes are logical (`ps-`, `ms-`, `start-`, `text-end`), so they mirror automatically. Arabic text is never split into characters (it breaks letter joining): `SplitReveal`/`RevealText` fall back to words, and `globals.css` removes letter-spacing, italics and the tight display leading for `lang="ar"`. Horizontal scroll motion (marquee, pinned gallery) reverses direction via `useDirectionSign()`.

## Brand and assets

- **Palette** (`src/app/globals.css`): navy `#122443`, soft blues `#88bbd8` / `#abcddd`, on a deeper navy page. `theme-light` flips a section to the deck's white pages (used by the client wall).
- **Type**: Helvetica Neue is the brand face and is used wherever it is installed; **Inter Tight** is the loaded web fallback, and **Poppins** carries the identity's italic accent. To serve Helvetica Neue everywhere, drop licensed `woff2` files in `public/fonts` and switch `src/app/layout.tsx` to `next/font/local`.
- **Logo**: `src/components/brand/Logo.tsx` (paths from `Psdigital Logo-01.svg`, kept in `logo-paths.ts`; `variant="mark"` drops the wordmark). The favicon is `src/app/icon.svg`. The loader and page transition draw it with `DrawableLogo`, which masks each ribbon with a stroke along its centre line; if the artwork changes, regenerate those centre lines with `node scripts/logo-centerlines.mjs --check`.
- **Motion signature**: `src/components/brand/FlowField.tsx` draws the identity's "connected flow" lines behind the home and portfolio heroes.
- **Imagery**: `public/images/projects/<slug>/`, `public/images/clients/` and `public/images/site/` were extracted from the company profile PDF. Heroes for campaign-only projects are composites in the deck's own layout (post trio over the slide background).
- `public/audio/*.wav`: synthesised UI sounds and ambient loop (`node scripts/generate-sounds.mjs`).

### Copy to review

The company profile repeats one placeholder paragraph (the Physiowell text) on most case-study slides. Those descriptions were rewritten from the work shown on each slide, so the wording — and any market or client name that was not stated in the deck — is worth a review before launch. Metrics are only used where the profile states them (Texas Chicken's 16 markets, Sinclair's 3 sub-brands, Physiowell's up to 10x ROAS, and Shark Tank Egypt's show numbers, which are labelled as the show's own).

Social links are intentionally empty in `src/lib/site.ts`: the profile lists only the website and email, so the footer and menu show the offices instead. Add the real handles there when you have them.

## Architecture notes

- **Portfolio transitions** (`components/portfolio/PortfolioTransition.tsx`): clicking a card navigates with the `pf-open` transition type. React `<ViewTransition>` pairs the card media and title with the case-study hero (shared names), and the list exits via CSS in `globals.css`. Browsers without the View Transitions API get a GSAP fallback where a clone of the card flies to full screen. Reduced motion navigates directly.
- **Intro loader — not mounted** (`components/animations/BrandLoader.tsx`): an optional logo loader. When mounted, on every full page load the PSdigital line draws itself, the wordmark and tagline rise, then the bowl of the logo opens into a window onto the site and the camera flies through it. The build-up is CSS (the "Brand loader" block in `globals.css`, with the timeline) so it starts at first paint; GSAP runs the exit once the page has loaded, capped at 4.5s after navigation. Full length once per session, faster afterwards; reduced motion gets the static logo and a fade. It is not mounted because it would cover the existing intros (the studio counter preloader, and the portfolio intro and case-study hero, which play on mount); mounting it means choosing it over the counter preloader and making those intros wait for it.
- **Site transitions** (`components/animations/PageTransition.tsx`): link-driven overlay used by `TransitionLink` across the rest of the site.
- **GSAP** is registered once in `src/lib/gsap.ts`. Every animation lives in `useGSAP` scopes, so ScrollTriggers are reverted on unmount. `PortfolioShell` keeps ScrollTrigger in sync with Lenis.
- **Hover distortion** (`components/portfolio/fx/distortion.ts`): one shared, dependency-free WebGL canvas attached only to the hovered card, DPR ≤ 1.5, removed when idle. Cards with a `hoverVideo` play the video instead.
- **3D** (`blocks/Project3D.tsx`): three.js is dynamically imported only for `3d` blocks near the viewport on desktop with WebGL. Touch devices and reduced motion get the poster image. All GPU resources are disposed on unmount.
- **Sound** (`src/audio/SoundManager.ts`): `playHover`, `playClick`, `playTransition`, `toggle`, `setVolume`, `startAmbient`/`stopAmbient`. Off by default, the preference persists in `localStorage`, files load only after opting in, ambient waits for a user gesture, and missing files fail silently.
- **Reduced motion** disables Lenis smoothing, parallax, the custom cursor, magnetic and distortion effects, 3D and cinematic transitions; content falls back to short fades.
- **Custom cursor and magnetic effects** only run on fine pointers (`hover: hover` and `pointer: fine`).
