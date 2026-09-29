# Team page — motion system

The `/team` page (`/ar/team` in Arabic) tells the studio's story as seven scroll-driven scenes. The motion reference was [agencefoudre.com](https://www.agencefoudre.com/). We took its principles and none of its design or content.

## 1. What we took from the reference

The reference is built on Locomotive Scroll v5 (Lenis underneath, with `data-scroll`, `data-scroll-css-progress` and `data-scroll-call` hooks), modularJS components and Barba page transitions. What makes it feel alive:

| Principle | On the reference | On our Team page |
| --- | --- | --- |
| Opening as a performance | Hero cards fan in after a branded loader | Preloader, then the headline rises word by word and three photo cards are dealt into a fan |
| Each section is a scene | Sections enter with their own choreography, not a shared fade | Every scene has its own timeline (below) |
| Type is an actor | Manifesto text and shapes move with scroll progress | Pinned manifesto: slide, tilt, letter-spacing collapse, image pills opening inside the text |
| Playful touch | Cards, audio players, hover states | Tilt cards, a cursor-following preview, magnetic buttons, rolling labels |
| Scroll *progress*, not scroll *events* | CSS progress variables drive animation | GSAP ScrollTrigger `scrub` ties motion to position, so reversing the scroll reverses the scene |

## 2. Motion tokens

Use these everywhere. The GSAP defaults are registered in `src/lib/gsap.ts`, and the Framer Motion equivalents live in `src/lib/motion.ts`.

| Token | Value | Use |
| --- | --- | --- |
| Ease: entrance | `expo.out` / `cubic-bezier(0.19, 1, 0.22, 1)` (`--ease-expo`) | Anything arriving: text, cards, fades |
| Ease: travel | `expo.inOut` | Wipes and rules that go from one state to another (clip-path, `scaleX`) |
| Ease: scrub | `none` | Every scroll-linked tween. Lenis already provides the smoothing |
| Ease: pop | `back.out(1.6)` | Only for small floating shapes |
| Duration | 1.2–1.8 s for entrances, 0.5–0.7 s for hovers | Slow in, never snappy |
| Stagger | words 0.07 · chars 0.03 · cards 0.12 · rows by trigger | Rhythm, not a queue |
| Scrub lag | `scrub: true`, 0.6–1 for big scenes | Higher values mean heavier, more cinematic motion |
| Springs | `springs.soft` (tilt), `springs.magnetic`, `springs.cursor` | Pointer-driven motion only |

**Rules**

1. Motion carries meaning: things arrive from where they belong, and scrubbed scenes reverse when the user scrolls back.
2. Animate `transform`, `opacity` and `clip-path` only. The one deliberate exception is the letter-spacing on a single pinned line in the manifesto.
3. One owner per element. GSAP, Framer Motion and CSS transitions never animate the same element. Nest wrappers instead: *parallax wrapper → GSAP entrance → Framer tilt*.
4. Tailwind v4 `scale-*`, `rotate-*` and `translate-*` classes set separate CSS properties that stack with GSAP's `transform`. Don't put them on elements GSAP animates.
5. Right-to-left: multiply every horizontal value by `useDirectionSign()`. Arabic is never split into characters (`SplitReveal` falls back to words).

## 3. Scene timelines

Times are seconds from the trigger. "Scrub" means the value follows scroll position between the given start and end.

### Scene 1 — Opening · `TeamHero.tsx`

Plays when `introDone` becomes true (preloader gone and page transition finished).

| t | Element | Motion |
| --- | --- | --- |
| 0.10 → 1.6 | Headline words | Rise out of word masks: `yPercent 118 → 0`, `rotate 8° → 0`, stagger 0.07 |
| 0.20 → 2.6 | Flow line | Draws itself (`strokeDashoffset`) |
| 0.45 → 2.25 | Three photo cards | Dealt from below into a fan (`x −34/0/34 %`, `rotate −9/2/11°`), stagger 0.12 |
| 0.90 → 2.1 | Floating shapes | Scale in from 0, `back.out`, random order |
| 1.00 → 2.3 | Label, meta, intro, button | Rise 30 px and fade in |
| loop | Card inner wrappers | Sine float ±10 px, ±1.2°, 3.2–4.4 s yoyo |
| loop | Backdrop | Gradient drift 28/34/40 s, dashed lines flowing, shapes floating |
| hover | Card stack | Fan spreads to 1.45× and tilts toward the pointer. Shapes follow the pointer in parallax by depth |
| scrub `top top → bottom top` | Exit | Headline sinks 18 % and scales to 0.94. Cards fly up at −40/−80/−55 % and rotate apart. Shapes rise by depth |

### Scene 2 — Manifesto · `TeamManifesto.tsx`

On desktop the section pins for 180 % of the viewport with `scrub: 1`. On phones the same timeline scrubs through the section without pinning.

| Progress | Element | Motion |
| --- | --- | --- |
| 0 → 1 | "One room." | `xPercent −45 → 0`, `rotate −7° → 0`, `scale 1.15 → 1` |
| 0.1 → 1.1 | "Every discipline." | `letter-spacing 0.32em → −0.03em`, opacity 0.12 → 1 (centered, so it gathers inward) |
| 0.2 → 1.2 | "No hand-offs." | `xPercent 45 → 0`, `rotate 6° → 0` |
| 0.35 → 1.6 | Image pills | Clip-path opens from the center, image settles from 1.7× |
| end | — | 0.35 hold so the finished statement can be read before the pin releases |

### Scene 3 — The lead · `TeamLead.tsx`

| Trigger | Element | Motion |
| --- | --- | --- |
| scrub `top 95% → center 55%` | Portrait frame | `clip-path` from a rounded window (`inset(22% 16%)` round 999px) to the full card |
| scrub full passage | Portrait image | Zoom 1.4 → 1 and parallax −8 % → 8 % |
| scrub full passage | Quote mark | Rotates −30° → 20° and drifts upward |
| `top 88%` once | Name | Characters rise and rotate in (SplitText chars) |
| `top 85%` once | Rule | `scaleX 0 → 1`, `expo.inOut` |
| `top 88%` once | Quote | Lines rise from masks |

### Scene 4 — The crew · `TeamCrew.tsx`

| Trigger | Element | Motion |
| --- | --- | --- |
| Each grid cell `top 88%` (batched) | Card | Arrives with depth. Start column: from the start edge, tilted −6°. Middle: from below with `rotationX 35°`. End column: from the end edge, +6°. `scale 0.86 → 1`, 1.6 s, stagger 0.12 |
| same, +0.1 | Card media | Clip-path wipe up, `expo.inOut` |
| scrub (desktop) | Middle column | Drifts `yPercent 12 → −12` against the scroll for a staggered grid |
| hover (Framer) | Card | Tilts ±12° toward the pointer, image moves −28 px the other way, glare follows the cursor, scale 1.025 with ±1° rotation, grayscale lifts, custom cursor shows "Say hi" |
| hover | "and 80+ more" card | Navy fill rises, magnetic arrow turns 45° |

### Scene 5 — Disciplines · `TeamDisciplines.tsx`

| Trigger | Element | Motion |
| --- | --- | --- |
| scrub `top bottom → top top` | Sheet | Top corners flatten from 4 rem to 0 as it docks over the page |
| row `top 90%` once | Rule → title → copy | Rule draws (`scaleX`), title rises from its mask (+0.25 s), number and copy fade up (+0.4 s) |
| hover | Row | Accent rule draws, title shifts 1.5 rem and turns blue |
| hover (fine pointers) | Floating preview | Follows the cursor on a spring, leans ±14° with horizontal velocity, the new image wipes up over the old one (`AnimatePresence`) |

### Scene 6 — Studio life · `TeamLife.tsx`

Desktop pins for the track's overflow width, and vertical scroll drives the horizontal track. Phones get a native swipe strip.

| Trigger | Element | Motion |
| --- | --- | --- |
| pinned scrub | Track | `x 0 → −overflow` |
| pinned scrub | Title | Slides 25 % the opposite way |
| pinned scrub | Progress rule | `scaleX 0 → 1` |
| each frame, from entering to centered (`containerAnimation`) | Frame | Settles from ±35 % height, ±7° tilt, 0.8 scale, alternating per frame |
| each frame, full crossing | Image | Pans −10 % → 10 % inside the frame |

### Scene 7 — Join us · `ContactCTA` (shared)

The shader blob sits behind the giant type, the characters reveal, and the round button is magnetic. It links to `/careers`.

## 4. Libraries

Everything was already in `package.json`, so no new dependencies were added.

| Library | Version | Role |
| --- | --- | --- |
| `gsap` + `@gsap/react` | 3.15 | Timelines, ScrollTrigger (pin, scrub, batch, `containerAnimation`), SplitText, `matchMedia`, `quickTo` |
| `framer-motion` | 13.2 | Component-level interaction: card tilt springs, cursor preview, `AnimatePresence` image swaps, custom cursor |
| `lenis` | 1.3 | Global smooth scroll (`SmoothScroll.tsx`), kept in sync with ScrollTrigger by `StudioProvider` |
| `next/image` | Next 16 | Responsive AVIF/WebP. Hero cards use `loading="eager"` (`priority` is deprecated in 16) |

## 5. Implementation map

```
src/app/[lang]/(studio)/team/page.tsx      page: metadata + scene order
src/data/team.ts, team.ar.ts               copy and imagery (EN / AR)
src/components/studio/team/
  TeamBackdrop.tsx                         gradient field, flow lines, floating shapes
  TeamHero.tsx                             scene 1
  TeamManifesto.tsx                        scene 2
  TeamLead.tsx                             scene 3
  TeamCrew.tsx                             scene 4 (+ MemberCard, MoreCard)
  TeamDisciplines.tsx                      scene 5 (+ Preview portal)
  TeamLife.tsx                             scene 6
src/app/globals.css                        .link-underline, team-* keyframes
```

These existing primitives are reused: `SplitReveal`, `PillButton` (magnetic, rolling label, liquid fill), `Magnetic`, `CustomCursor` (`data-cursor="view"` with `data-cursor-label`), `TransitionLink` (page transitions), `useSectionTheme` (header colours) and `ContactCTA`.

`/team` is registered in `siteConfig.nav`, `siteConfig.studioRoutes`, the sitemap and `t.meta.team`.

## 6. Performance and accessibility

**Staying at 60 fps**

- Only compositor-friendly properties animate. The one layout-affecting tween (the manifesto's letter-spacing) runs on a single pinned line.
- The backdrop uses radial gradients rather than `filter: blur()`, and loops only `transform` and `stroke-dashoffset`. An `IntersectionObserver` pauses every loop (`data-paused`) while the section is off screen.
- Pointer work goes through `gsap.quickTo` and Framer springs (no React re-render per move). Card bounds are measured once on pointer enter, not on every move.
- `will-change` is set only on elements that actually move.
- ScrollTrigger timelines live inside `useGSAP` scopes and `gsap.matchMedia`, so they are reverted on unmount, on breakpoint change and on language switch.
- `autoSplit` re-splits text after fonts load and on resize, and the hero only replays its entrance if it hasn't played yet.

**Mobile**

- No pinning on phones except where it's cheap: the manifesto scrubs unpinned, and studio life becomes a native scroll-snap strip (`data-lenis-prevent-horizontal`).
- Lenis leaves native touch momentum alone (`syncTouch: false`).
- Tilt, the cursor preview, magnetic pull and pointer parallax are unmounted on touch devices (`useRichInteractions`).
- Images declare `sizes` per breakpoint. Only the hero cards load eagerly.

**Reduced motion (`prefers-reduced-motion: reduce`)**

- All GSAP work is registered under `(prefers-reduced-motion: no-preference)`. With reduced motion, content renders in its final state.
- The global CSS rule freezes the backdrop loops, and Lenis smoothing is disabled.
- The custom cursor, tilt, magnetic effects and cursor preview are disabled.
- Text is never hidden: `.split-reveal` is visible under reduced motion and when scripts are off.

**Further recommendations**

1. Replace the placeholder crew images (`teamPage.crew.images`) with real 4:5 portraits, ideally around 1200 px WebP. Keep the backgrounds consistent so the tilt glare reads well.
2. Test on a mid-range Android phone with Chrome DevTools' performance panel. If the hero drops frames, set `shapes={false}` on the backdrop for `max-width: 767px`.
3. Run Lighthouse on `/team`. The hero's centre card is the LCP element and is fetched with `fetchPriority="high"`.
4. Keep new scenes to one pinned section at a time, and call `ScrollTrigger.refresh()` after any content that changes height loads late.
