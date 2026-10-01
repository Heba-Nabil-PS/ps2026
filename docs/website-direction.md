# PSdigital website — direction to build

How `PS_Website_Direction_Final.pptx` becomes the site. It is written for the people who design, build and review the website. Read it before changing a page, so the change stays on-strategy.

## 1. The strategy, in our words

**Objective (deck, slide 3).** A modern, high-impact platform that positions PSdigital as a *forward-thinking creative partner*: strategy, creativity and innovation that drive growth. The look is bold and futuristic, and it must stay effortless to explore the work, understand what we do, and get in touch.

**Who it is for**

| Audience | What they came for | What the site must do |
| --- | --- | --- |
| Marketing leads and founders in MENA (QSR, healthcare, real estate, entertainment) | Proof that we can carry a brand across markets | Put the work first, with big and browsable cases, clients and results |
| Procurement and partners | What we do and how we work | A clear, numbered service index, the process, and offices |
| Talent (designers, motion, dev, copy, performance) | Whether this is a place to do their best work | Team, culture, open roles, and applying in a few steps |

**Three business goals, as the deck ranks them**
1. **Portfolio & client engagement.** Work is prominent and easy to reach from anywhere. Case studies are visually rich and invite deeper browsing.
2. **User experience.** Simple navigation, a minimum of clicks to any page, and the same layout logic on every device.
3. **Careers submission.** Candidates submit their work in a few steps.

**Personality:** futuristic, minimal, premium. Confident, not loud: headlines shout and body copy is calm (deck slide 5: "A loud headline, a clear read").

**The feeling we want:** entering a dark, quiet space where light moves through glass. It is calm and precise, and slightly cinematic. The work is lit up inside it.

## 2. Design principles taken from the moodboard

The moodboard is 12 tiles plus 12 site references. What they share matters more than any single image:

| # | Principle | Evidence in the moodboard | How the site applies it |
| --- | --- | --- | --- |
| P1 | **Light through reeded glass** | Tiles 1, 8 (hand), process ref 09, `cover.webp` | Fluted-glass panels (`FlutedGlass`) over imagery and 3D. Page transitions are glass flutes. |
| P2 | **Depth from one sculptural 3D form** | Blue disc spiral (tile 3), Styleport ring, DNA (Garri Zmudze) | One WebGL object in the hero: a spiral of glass discs that twists with scroll and leans toward the pointer. No decorative 3D anywhere else. |
| P3 | **Movement as motion blur** | Walking figures (tiles 4, 7), techredux streaks | Images enter with a horizontal motion-blur that resolves to sharp (`MotionBlurReveal`). |
| P4 | **Stretched, heavy type as image** | Gero Bold, "ENDLESS POSSIBILITIES", techredux | Display type (banner titles and section headings) is a variable, extended grotesk (Anybody). Headlines animate along the *width* axis: they stretch into place. |
| P5 | **Human, in black and white** | Tiles 2, 9, 10 | People and studio photos are graded navy-monochrome. Client work stays monochrome until hover or focus, then turns to colour: the work "comes alive". |
| P6 | **Metallic calm** | Elevator doors (tiles 10, 11), phone still life | Brushed-metal sheen on primary buttons, and the steel `#A9BACB` as the secondary text colour. |
| P7 | **Dark navy to black, one bold accent** | Deck palette | 90% ink/navy, sky `#8CC4E6` for accent only, and one full sky block per page at most (the "Endless possibilities" footer). |
| P8 | **Quiet, numbered structure** | Oddlymade index, Agentura "Selected Work.³", Moonsworth nav | Numbered indices (01–06), counts in superscript, hairline rules, pill navigation. |
| P9 | **✳ as a signature mark** | "STUDIO✳", process cards | The asterisk marks section labels and list bullets. It spins slowly on hover. |

**What we do not do:** gradients as decoration, random floating shapes, bounce easing, colour for its own sake, more than one 3D scene per page.

## 3. Sitemap

The information architecture follows the PSdigital website prototype: work, services and industries first, each with its own detail pages, and one way in to a new project. Everything is at most **two clicks from anywhere**.

```
/                        Home: hero → positioning → selected work → services → industries → clients → process → insights → CTA
/work                    Work: filter by discipline (?category=) and industry (?industry=) + clients wall
/work/[slug]             Case study (14), with its industry and disciplines linked
/services                Services: 6 disciplines as stacking cards (#branding anchors)
/services/[slug]         Service: what you get, process, selected work, industries, FAQ
/industries              Industries: 5 sectors, each backed by case studies
/industries/[slug]       Industry: problems we solve, how we help (→ services), the work
/about                   About: story, numbers, principles, process, offices
/insights                Insights: articles, filter by topic (?topic=)
/insights/[slug]         Article, with the case study it draws on
/careers                 Careers: values, open roles, 3-step application (?role= preselects)
/careers/[slug]          Role page with the application preselected; /careers/open-application
/contact                 Contact: enquiry form, direct lines, link to the brief, offices
/start                   Start a project: 5-step brief (?service= preselects)
/team                    Team: leadership, leads, crafts (footer → Company)
/ar/…                    Arabic, right-to-left, for every page above
```

Old URLs (`/case-studies`, `/portfolio`, `/projects` and their slugs, `/home-opt2`) redirect permanently to `/work`, `/work/[slug]` or `/`.

**Global navigation:** logo · Home ▾ (design versions) · Work · Services ▾ · Industries ▾ · About · Insights · Careers · language · **Start a project** (the one filled button). Services and Industries open a menu of their pages. Below 1280px, a full-screen menu holds the same order plus Contact and Start a project.

**Footer:** Services (each discipline) · Industries (each sector) · Company (Work, About, Insights, Careers, Team, Contact, Start a project) · Studios.

Content: industries in `src/data/industries.ts` (+ `.ar.ts`), articles in `src/data/insights.ts` (+ `.ar.ts`), service-page copy (intro, FAQ) in `services.list` in `src/versions/main/content/en.ts` and `ar.ts`.

## 4. Page structure: each section and its purpose

### Home: "first scroll, first impression"
1. **Hero:** positioning in one line ("Endless possibilities") over the 3D glass spiral, plus a scroll cue. *Goal: first impression and positioning.*
2. **Positioning statement:** strategy · creativity · innovation, highlighted word by word as you scroll. *Goal: explain the partner idea.*
3. **Selected Work³:** 4 flagship cases in large cards whose frames flatten as they rise. *Goal: objective 01.*
4. **Services index:** numbered rows 01–06. Hovering a row opens an image. *Goal: understand capabilities fast.*
5. **Clients:** white brand marks adrift on three depth lanes, no cells or frames. *Goal: trust.*
6. **Process:** four ✳ glass cards over the fluted light. *Goal: show how we work.*
7. **Closing:** "Let's build your brand together" → Contact / Careers. *Goal: conversion.*

### Work
Filter bar (All + categories that actually have work) · a grid of large cards (monochrome, colour on hover, "View" cursor) · the floating client marks. Case study: stretched title, facts row (client, market, services, deliverables), content blocks, next case.

### Services
A hero, then six sticky-stacking glass cards with bold imagery (Peachweb ref), each with deliverables and a proof case. Then the process, then the CTA.

### About · Team · Careers · Contact
Same shell: stretched hero title, ✳ label, a short intro, then content and one closing CTA. Careers ends in the 3-step application: **You → Your work → Send**.

## 5. Component structure

```
src/versions/main/          (the main design; see docs/design-versions.md for versions)
  shell/      SiteHeader · MobileMenu · SiteFooter · Providers · RouteTransition · Cursor · LanguageSwitch · LocalTime
  motion/     StretchHeading · MotionBlurReveal · FrameRise · Reveal · ScrollHighlight · Magnetic · Counter
  ui/         AppLink · Button/ButtonLink · Label/Asterisk · FlutedGlass · PageHero · SectionHead · ClosingCta · Field
  three/      GlassSpiral (R3F, lazy-loaded, pauses off-screen, still frame for reduced motion)
  sections/   WorkCard · ClientLogoSection · ProcessCards · Offices   (shared by several pages)
  home/       Hero · Positioning · SelectedWork · ServicesIndex
  work/       WorkIndex · CaseBlocks · CompareSlider · NextCase
  services/   ServiceStack
  careers/    CareersBoard · ApplicationForm
  contact/    ContactForm
```

- **Copy:** `src/versions/main/content/en.ts` and its Arabic twin `ar.ts` (same shape, checked by TypeScript). `src/versions/main/copy.ts` picks the locale. Use `getServerCopy()` (`versions/main/server.ts`) on the server and `useCopy()` (`versions/main/use-copy.ts`) on the client.
- **Data:** company facts in `src/lib/site.ts`, case studies in `src/data/portfolio.ts`, roles in `src/data/careers.ts`. `src/versions/main/data/work.ts` maps case studies onto the deck's six disciplines.
- **Forms:** Server Actions in `src/lib/forms.ts`.
- **Pages:** `src/app/[lang]/(main)/…`.

## 6. Motion system

**One sentence:** light moves through glass. Things *resolve* (blur → sharp, condensed → stretched, dark → lit). They do not bounce or fly.

| Token | Value | Used for |
| --- | --- | --- |
| `ease.expo` | `cubic-bezier(.19,1,.22,1)` | Every entrance |
| `ease.glass` | `cubic-bezier(.65,0,.35,1)` | Wipes, flutes, frame changes |
| Entrance | 1.1–1.6 s, stagger 0.06 (words) / 0.12 (cards) | Slow in, calm |
| Hover | 0.45–0.6 s | Rows, cards, buttons |
| Scroll | `scrub: 0.8` | Frames, the 3D twist, parallax |

| Motion | Where | Carries meaning |
| --- | --- | --- |
| Smooth scroll (Lenis) | Everywhere | The premium, weighted feel |
| **Stretch-in** headings (width axis 60 → 125, rise from a mask) | Every page title and section heading | P4: type as image |
| **Motion-blur reveal** (SVG directional blur 40 → 0) | Images, first time in view | P3: movement |
| **Frame rise** (perspective, rounded frame flattens on scroll) | Selected Work, case heroes | Work "arrives" |
| **Glass flutes** page transition (Framer Motion) | Route changes | P1 |
| 3D spiral twist + pointer lean | Home hero | P2 |
| Scroll-highlighted statement | Home, About | Reading pace |
| **Floating client marks** (blur-in one by one, depth lanes drifting in opposite directions, scroll parallax, glow + shimmer on hover) | Clients on Home, Work, Industries | Trust, without a logo grid |
| Monochrome → colour, magnetic buttons, sliding nav pill, ✳ spin, metallic sheen | Micro-interactions | P5, P6, P8, P9 |

**Ownership:** GSAP owns scroll-linked and timeline motion. Framer Motion owns UI state (nav, menu, filters, forms, page transitions). The two never animate the same element.

**Reduced motion:** Lenis smoothing, 3D, blur, stretch and parallax are off, and content fades in for 0.3 s. Touch devices get no cursor and no magnetic effect.

## 7. Implementation plan

1. Archive the previous site (`/archive`) so nothing is lost, then set the new tokens, fonts, globals and shell.
2. Motion and UI primitives.
3. Home, then Work and case studies (goal 01), then Services, About, Team, Careers with its form (goal 03), and Contact.
4. Arabic content for every page.
5. SEO (metadata, OG, sitemap, JSON-LD, redirects), accessibility pass, then `next build`.
6. Browser QA at 1440, 1024, 768 and 390, in both languages.

## 8. Open items for the team

- **Fonts**: banner titles and section headings use Anybody (extended 125, weight 800–900). **Helvetica Neue** (text) is used where installed; Inter Tight is the web fallback.
- **Form delivery**: set `FORMS_WEBHOOK_URL` (any endpoint that accepts `multipart/form-data`: Zapier, Make, Formspree, an ATS). Without it, the forms fall back to a pre-filled email.
- **Video**: the hero and case studies accept a `backgroundVideo`, but no footage exists yet.
- **Team portraits**: the leads grid uses typographic cards until real black-and-white portraits are shot.
