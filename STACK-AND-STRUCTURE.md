# Stack & Structure — project blueprint

**Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind 4**

|              |                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**  | What we build with, where code goes, how pages are composed, how the design system is defined, and how the session is held. Copy into a new repo and follow top to bottom. |
| **Audience** | Anyone starting, extending or reviewing a frontend in this organisation.                                                                                                |
| **Sources**  | `docs/decisions/38-tech-stack.md`, `docs/decisions/42-project-structure.md` (the argument), plus every generalisable rule from `FRONTEND-REVIEW.md` and `FRONTEND-CONFORMANCE-REVIEW.md` (the evidence — see [Appendix A](#appendix-a--where-these-rules-came-from)). |
| **Status**   | v3. Supersedes `STACK-AND-STRUCTURE.v1.md` (structure only).                                                                                                            |

---

## Contents

| | | |
| --- | --- | --- |
| [0. How to read this](#0-how-to-read-this) | **[7. Auth — who owns the cookie](#7-auth-and-session--who-owns-the-cookie)** | [14. Conventions](#14-conventions) |
| [1. Technologies](#1-technologies) | [8. Cookies — the full contract](#8-cookies--the-full-contract) | [15. Enforcement](#15-enforcement--in-place-from-commit-one) |
| [2. Folder architecture](#2-folder-architecture--app--features--shared) | [9. React 19 and the compiler](#9-react-19-and-the-react-compiler) | [16. Testing](#16-testing) |
| [3. Component-based pages and views](#3-component-based-pages-and-views) | [10. Forms, mutations, Server Actions](#10-forms-mutations-and-server-actions) | [17. Delivery order](#17-delivery-order--vertical-slices-never-horizontal-layers) |
| [4. The design system in `globals.css`](#4-the-design-system-in-globalscss) | [11. i18n and RTL](#11-i18n-and-rtl-m) | [18. Anti-patterns](#18-anti-patterns--do-not-reintroduce) |
| [5. Rendering and routing](#5-rendering-routing-and-next-16-behaviour) | [12. Security baseline](#12-security-baseline-m) | [19. Bootstrapping](#19-bootstrapping-a-new-project) |
| [6. The network layer](#6-the-network-layer) | [13. Accessibility baseline](#13-accessibility-baseline-s) | [20. Pre-merge checklist](#20-pre-merge-checklist) |

---

## 0. How to read this

| Marker  | Meaning                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| **[M]** | **Mandatory.** Two independent full-codebase reviews found a real defect — outage, security hole or user-visible dead end — every time this was missing. Deviating needs a written decision record, not a preference. |
| **[S]** | **Should.** Strong default. Deviate with a one-line comment at the site saying why.                        |

Two rules govern everything below:

- **No experimental features. [M]** No `experimental` flags in `next.config.ts`, no canary/alpha APIs, no pre-release pins. That includes `cacheComponents`, `ppr`, `dynamicIO`, `authInterrupts` and anything behind `unstable_` **except** `unstable_rethrow`, which is the documented escape hatch in §5.4. If the only way to enable something is an experimental flag, don't — propose the stable alternative and record what is lost.
- **Read the installed docs, not memory. [M]** `node_modules/next/dist/docs/` is authoritative for the exact installed version; the same goes for Tailwind's and next-intl's own docs. Every version-specific claim here (deprecations, renamed APIs, defaults, CSS at-rules) is checked there before it is acted on. Next 16 and Tailwind 4 both moved a lot; this document ages.

---

## 1. Technologies

### 1.1 The minimum — every project starts with exactly this

| Layer              | Choice                                                        | Package                                                                   |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Runtime            | Node 20.19+ / 22.12+                                          | `.nvmrc`                                                                  |
| Framework          | **Next.js 16 App Router** (Turbopack, React Compiler)         | `next`, `babel-plugin-react-compiler`                                     |
| UI runtime         | **React 19**                                                  | `react`, `react-dom`                                                      |
| Language           | **TypeScript 5**, `strict: true`, no `any`                    | `typescript`                                                              |
| Styling            | **Tailwind CSS 4**, CSS-first `@theme` — **no `tailwind.config`** (§4) | `tailwindcss`, `@tailwindcss/postcss`                            |
| UI primitives      | **shadcn/ui on Base UI** — or hand-authored (§4.8)            | `shadcn` (CLI), `@base-ui/react`                                          |
| Variants / classes | CVA + clsx + tailwind-merge (`cn()`)                          | `class-variance-authority`, `clsx`, `tailwind-merge`                      |
| Icons              | lucide                                                        | `lucide-react`                                                            |
| Forms              | **react-hook-form + Zod 4**                                   | `react-hook-form`, `zod`, `@hookform/resolvers`                           |
| i18n + routing     | **next-intl** (locale segment, RTL)                           | `next-intl`                                                               |
| Boundary guards    | **server-only / client-only**                                 | `server-only`, `client-only`                                              |
| Tests              | **Vitest + Testing Library**, colocated                       | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`  |
| Lint / format      | ESLint 9 flat config + Prettier                               | `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss` |

### 1.2 Add only when the feature exists

| Need                       | Package                 | Note                                                                                       |
| -------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| Toasts                     | `sonner`                |                                                                                            |
| Browser-side data (Tier 2) | `@tanstack/react-query` | Only if the browser genuinely talks to a backend (§7.1). Not by default.                   |
| Genuine client state       | `zustand`               | Two components need it **and** it is not server state.                                     |
| Theme switching            | `next-themes`           | Use `resolvedTheme`, never `theme`, for anything rendered — `theme` is `"system"` on the first client render and the markup flips. |

### 1.3 Scripts

```json
"dev": "next dev",  "build": "next build",  "start": "next start",
"lint": "eslint",   "typecheck": "tsc --noEmit",  "format": "prettier --check .",
"test": "vitest run",  "test:watch": "vitest",  "audit": "npm audit --audit-level=high"
```

**All four of `lint`, `typecheck`, `test`, `format` run in CI on every PR. [M]** A formatter that is configured but not enforced drifts within weeks — one review found `prettier --check` already failing on committed code.

### 1.4 Baseline config

| File                 | Requirements                                                                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfig.json`      | `strict: true`; `target: "ES2022"` **[M]** (Next 16 needs Node 20+; a lower target downlevels object spread, optional catch binding and async iteration into every client chunk for no gain); `moduleResolution: "bundler"`; `jsx: "react-jsx"`; alias `@/*` → `./src/*`; `include` lists **both** `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`. |
| `next.config.ts`     | Wrapped in `createNextIntlPlugin("./src/i18n/request.ts")`; `reactCompiler: true` and `turbopack.root = __dirname` **top-level**; `poweredByHeader: false`; `images.remotePatterns` as an explicit host allowlist (never `domains`); **no `eslint` key**; security headers imported from `shared/config/security-headers.ts`. With `output: "standalone"`, document the `public/` and `.next/static/` copy-in steps beside the flag. |
| `postcss.config.mjs` | Only `@tailwindcss/postcss`. No `tailwind.config.*` file exists (§4).                                                                                                                                                                                                                                        |
| `vitest.config.mts`  | `.mts` because the package is not `"type": "module"`; `jsdom`; `include: src/**/*.test.{ts,tsx}`; `@` alias mirrored from tsconfig; `server-only` aliased to a no-op entry. **The React plugin must run the compiler [M]:** `react({ babel: { plugins: ["babel-plugin-react-compiler"] } })` — otherwise tests exercise different code than the build ships. |
| `components.json`    | `rsc: true`, `rtl: true`, `cssVariables: true`, aliases pointing at `@/shared/*`. Only if shadcn is actually used (§4.8).                                                                                                                                                                                     |
| `instrumentation.ts` | `register()` imports `shared/config/env.ts`, so env validation fails at **startup**, not on the first request that happens to import it. `onRequestError` for server-side error reporting.                                                                                                                     |

---

## 2. Folder architecture — `app` | `features` | `shared`

### 2.1 Layer model

```
app/                    routing only
  ↓
features/<x>/           components · hooks · api · model · store
  ↓                       ↓
  ↓                     features/<x>/domain/    pure business logic
  ↓                       ↓
shared/api/             contracts · client · seams
  ↓
shared/                 ui · lib · config · kernel · hooks
```

Dependencies point one way only:

| Layer                  | May import                                                      | Never imports                                       |
| ---------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `app/`                 | features (public API), shared                                   | —                                                   |
| `features/<x>/`        | own `domain/`, `shared/api`, `shared`, allowlisted feature APIs | `app/`, another feature's internals                 |
| `features/<x>/domain/` | `shared/kernel` **only**                                        | React, Next, `fetch`, `shared/api/`, other features |
| `shared/api/`          | shared, kernel                                                  | features, app, domain                               |
| `shared/`              | nothing internal                                                | everything above                                    |

The rule worth protecting hardest: **`domain/` imports no framework.** Pure TypeScript in, pure TypeScript out. It is the only layer that can be tested without a renderer, and the reviews found it is the layer that actually stays correct.

### 2.2 Day one

Create only this. `features/` and `domain/` appear the day a promotion rule fires.

```
src/
  app/
    globals.css                 ← the design system (§4), imported once by the root layout
    global-error.tsx            ← §5.3, day one, not later
    not-found.tsx
    [locale]/(main)/{layout.tsx,page.tsx}
  i18n/{routing.ts,request.ts,navigation.tsx}
  shared/
    api/     client.ts · contracts/ · seams/
    ui/      primitives/ · layout/
    lib/     config/     kernel/
  proxy.ts                      ← Next 16's middleware: next-intl + per-request CSP nonce
  instrumentation.ts
```

### 2.3 End state

```
src/
  app/                            ROUTING ONLY — every file here renders ONE component (§3)
    globals.css                   the design system: tokens, base layer, custom utilities
    global-error.tsx              self-contained ("use client", own <html>/<body>) — the one exception
    not-found.tsx                 → <RootNotFound>   shared/ui/layout/
    [locale]/
      layout.tsx                  <html> / <body> / providers
      error.tsx                   → <ErrorView>      shared/ui/layout/
      not-found.tsx               → <NotFoundView>   shared/ui/layout/
      [...rest]/page.tsx          → notFound()
      (main)/
        layout.tsx                → <AppShell>       features/app-shell/components/
        error.tsx                 → <ErrorView>
        <route>/page.tsx          → <XView>          features/<x>/components/
        <route>/loading.tsx       → <XSkeleton>      features/<x>/components/
        <route>/error.tsx         → <ErrorView>
        @modal/(.)<route>/        parallel + intercepting routes
      (mobile-view)/              WebView pages — no providers, no analytics
    api/
      auth/                       ONLY when Next.js is the server (§7.1). With a backend: does not exist
      _interim/                   quarantined workarounds

  features/<x>/                   a USER-FACING CAPABILITY, not a technical grouping
    domain/                       pure logic, framework-free
    api/
      server.ts                   Tier 1 — Server Component fetchers, `import "server-only"`
      queries.ts                  Tier 2 — TanStack hooks, `import "client-only"`
      actions.ts                  Tier 4 — Server Actions, `"use server"` + `import "server-only"`
    components/
      <x>-view.tsx                the page-level view (§3)
      <x>-skeleton.tsx            the loading.tsx body
      …                           leaf components
    hooks/                        feature hooks
    model/                        domain types, zod schemas, DTO → model mapping
    store.ts                      Zustand slice — only if genuine client state exists
    index.ts                      public API — the only barrel

  shared/
    api/       client.ts (transport, deadlines, headers, envelope unwrapping)
               · contracts/ (backend DTOs) · seams/ (provisional decisions)
               · query/ (query client, keys, provider)
    ui/        primitives/ flat leaves — button · input · table · empty-state · page-header
               · layout/   page scaffolding — error-view · not-found-view · auth-page · section
               · vendor/   registry output, if any (§4.8)
    kernel/    cross-feature domain primitives (money, branded ids)
    lib/       framework-agnostic utilities
    config/    deployment-shaped config — env.ts · cookies.ts · security-headers.ts
    hooks/     genuinely generic hooks only
    tenant/    multi-tenant registry + isomorphic resolver
    fonts/     next/font declarations beside the font files
```

Every folder inside a feature is optional except `index.ts`. A feature with three components and one query is three files. **Create nothing preemptively.**

**There is no route-local component folder.** No `_components/`. Markup that no feature owns is the signal to name the feature — see §3.8.

### 2.4 Server / client tiers

| Tier | Path                       | Use for                                   | Lives in                                 |
| ---- | -------------------------- | ----------------------------------------- | ---------------------------------------- |
| 1    | Server Component → backend | initial page data, content, metadata      | `features/<x>/api/server.ts`             |
| 2    | Browser → backend          | cart, checkout, search, polling           | `features/<x>/api/queries.ts`            |
| 3    | Route handler              | credentials, downloads, per-keystroke GETs, measured interim workarounds | `app/api/**`      |
| 4    | Server Action              | form mutations owned by this app          | `features/<x>/api/actions.ts`            |

The `server.ts` / `queries.ts` split makes the tier visible in the filesystem, and `server-only` / `client-only` turn a wrong import into a build failure. **Push `"use client"` to the leaves. [M]**

**Boundary discipline**

- `import "server-only"` on every `api/server.ts`, `actions.ts`, `shared/api/server-client.ts`, and on `shared/config/env.ts` and `shared/config/cookies.ts`. **[M]**
  - Caveat: `server-only` resolves to a throwing module outside the `react-server` condition. After adding it to a module the **proxy** imports, verify the proxy bundle still builds. If it does not, move the bare constant it needed (e.g. a cookie name) into a dependency-free module rather than dropping the guard.
- `import "client-only"` on browser fetchers and hook-only modules. **A hook-only or non-interactive module does not need `"use client"` — it needs `client-only`.** [S]
- A `"use client"` file is a **boundary**, not a folder convention: everything it exports becomes a client reference. Do not put `"use client"` at the top of a primitives file where only one export is interactive — split the interactive part into its own file, or server-rendered tables serialize every row and cell into the RSC payload.
- Never re-export client components from a feature barrel: a barrel is one client-boundary module, so re-exporting several `"use client"` components fuses them into one chunk and tree-shaking does not undo it.
- A primitive that calls **any** library hook needs `"use client"`, even when it renders from a Server Component today. "It works because that hook happens to be RSC-safe" is a dependency on someone else's implementation detail, and it breaks on a minor upgrade.

### 2.5 The contract boundary

`shared/api/client.ts` owns transport, deadlines and **envelope unwrapping once, centrally** — not at every call site.

> **A type from `shared/api/contracts/` never appears in a component prop.** Map DTO → model at the boundary.

Mapping is required where the model is non-trivial (menu, cart, orders, checkout, loyalty). It is **not** required for display-only CMS payloads (FAQ, terms, blogs, news). That inconsistency is deliberate — record it so nobody "fixes" it.

### 2.6 Promotion rules — structure appears when a rule fires

| From                   | To                         | Trigger                                           |
| ---------------------- | -------------------------- | ------------------------------------------------- |
| inline logic           | `features/<x>/domain/`     | a pure business rule with branching worth testing |
| `features/<x>/lib`     | `shared/lib/`              | a third feature imports it                        |
| `features/<x>/domain/` | `shared/kernel/`           | two features need the same primitive              |
| local state            | `features/<x>/store.ts`    | two components need it and it is not server state |
| private view helper    | `shared/ui/layout/`        | a second **feature** needs the same scaffolding   |
| a repeated class string| a token or a primitive (§4)| the same combination appears a third time         |

A folder inside a feature stays flat until roughly ten files; then group by **a concern that reads as a unit**, never by file count. A group with fewer than three members is not a group.

**The reverse rule [M]: a shared primitive that exists must be used.** Both reviews found primitives written specifically to absorb duplication (`PageHeader`, `SectionHeader`, `EmptyState`) bypassed at 16 call sites — producing two visual treatments of the same concept *and* breaking an automated check that keyed on the primitive's `data-*` attribute. If a primitive is bypassed, either delete the primitive or finish the migration; never leave both.

---

## 3. Component-based pages and views

> This is the architecture rule the reviews rated **🔴 High** and found **not met**: one app had ~1,970 lines under `app/` of which only 52 obeyed it. It is not a style preference.

### 3.1 The rule [M]

**A `page.tsx` or `layout.tsx` does routing work only and renders exactly one component.** It contains no intrinsic HTML elements (`<div>`, `<h1>`, `<p>`, `<main>`, …), no `className`, and no icons.

The same applies to `error.tsx`, `not-found.tsx` and `loading.tsx` (§3.4). The only exemptions are the files that own the document: `app/[locale]/layout.tsx`, `app/layout.tsx` and `app/global-error.tsx`.

> **This does not contradict the "no `views/` layer" anti-pattern (§18).** What is banned is a *parallel top-level `views/` directory* that wraps every page in a shell for its own sake. What is required is that page-level markup lives **inside the feature that owns it** — `features/<x>/components/<x>-view.tsx` — so it can be reused, tested and restyled with the rest of that feature. One is an indirection layer; the other is ownership.

### 3.2 Why — the evidence, not the theory

Markup in routes cannot be reused, so it gets copied; copies drift silently. Measured in the two reviewed apps:

| Duplication found | Count | Consequence observed |
| --- | --- | --- |
| Back-link block (`ArrowLeft` + `Link`) | 9 pages | — |
| Hand-rolled list header where `PageHeader` existed | 4–5 pages | Two header alignments in one product; one page hard-coded `text-neutral-500 dark:text-neutral-400` where the theme token existed |
| Create/edit page layout | 8 pages | — |
| Auth shell (sign-in / set-password / change-password / 404) | 4 copies, byte-identical but for keys | The 404 copy drifted: `max-w-md` instead of `max-w-sm`, and **lost its locale switcher** — so the one page a lost Arabic reader lands on is the one page with no way to change language |
| Section heading where `SectionHeader` existed | 9 route sites vs **1** real caller | Hand-rolled copies cannot take the primitive's `note` / `aside` props, so a callout had to be hand-nested in a bare `<div>` |
| Empty state where `EmptyState` existed | 7 route sites + 6 in features | **Functional, not cosmetic:** the primitive emits `data-empty`, which the automated accuracy harness reads. The hand-rolled `<p>` elements emit nothing, so seven empty states are invisible to the check that exists to find them — and they render with different tokens (`rounded-lg border` vs `rounded-card border-border-strong bg-muted/40` with an icon), on pages a client compares side by side |
| Nested `<main>` inside the layout's `<main>` | 1 page | An accessibility defect that only existed because the page carried markup |

The honest caveat: for a genuinely one-off page body, moving markup into a view buys clarity, not deduplication. Do the duplicated shells and the bypassed primitives first — those pay for themselves immediately.

### 3.3 What stays in the page

| Stays in `page.tsx` / `layout.tsx`                              | Moves into the view                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `await params` / `await searchParams`                             | Page wrappers, grids, `space-y-*`, flex scaffolding            |
| Id validation and `notFound()`                                    | Headings, subtitles, back links, icons                         |
| Data fetching and the `ApiError` → 404 mapping                    | Header buttons (export, "New …"), section headers              |
| `redirect()` and route-level guards                               | Notices, cards, detail rows, empty states, tables              |
| Binding a Server Action (the inline `"use server"` closure)       | App header, sidebar, `<main>`, footer, toaster                 |
| `setRequestLocale(locale)` and `generateMetadata`                 | Anything with a `className`                                    |
| Providers (in layouts only)                                       | —                                                              |

The bound Server Action stays in the page on purpose: it must be created in a Server Component, and keeping it next to the id validation keeps the binding visible.

**A parallel-route slot follows the same rule.** A slot (`@modal`, `@sidebar`) composes and fetches; it does **not** transform. Mapping, filtering and formatting live in `features/<x>/model/`, never in the slot — and never in the page that renders it.

### 3.4 The boundary files are routing files too [M]

Next resolves `not-found.tsx`, `error.tsx`, `loading.tsx` and `global-error.tsx` **by their position in `app/`** — they cannot be moved into a feature and their filenames are fixed. So the file stays in `app/`; its markup does not.

| File in `app/`      | Renders                              | The component lives in                                                        |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `page.tsx`          | the view                             | `features/<x>/components/<x>-view.tsx`                                          |
| `layout.tsx`        | the shell + providers                | `features/app-shell/components/app-shell.tsx`                                   |
| `loading.tsx`       | the skeleton for that route's view   | `features/<x>/components/<x>-skeleton.tsx` — a Server Component that fetches nothing |
| `error.tsx`         | one error card                       | `shared/ui/layout/error-view.tsx` (`"use client"`), given `digest` and `reset`   |
| `not-found.tsx`     | one 404 view                         | `shared/ui/layout/not-found-view.tsx` — translated, `dir`-correct, keeps the locale switcher |
| `global-error.tsx`  | **the exception: self-contained**    | the file itself                                                                 |

`global-error.tsx` is exempt on purpose: it *replaces* the root layout, so it must render its own `<html>` / `<body>` and cannot rely on providers, fonts or the message catalogue — and importing a shared component there risks pulling in the very module that failed. Keep it small, English, dependency-free, and comment that this is deliberate.

### 3.5 Shared layout components

Cross-route scaffolding lives in `shared/ui/layout/` — a **subfolder**, never at the root of `shared/ui` (§4.8). Start with what the duplication actually shows:

| Component     | Props                                              | Replaces                                                        |
| ------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| `PageHeader`  | `title`, `description`, `actions`                  | The hand-rolled title / subtitle / button block on every list page |
| `SectionHeader` / `Section` | `title`, `note`, `aside`, `children`  | `<section>` + `<h2>` + caption blocks                            |
| `BackLink`    | `href`, `label`                                    | The `ArrowLeft` + `Link` block on detail and edit pages          |
| `FormPage`    | `backHref`, `backLabel`, `title`, `children`       | Back link + `<h1>` + wrapper on every create/edit page           |
| `AuthPage`    | `title`, `subtitle`, `children`, `localeSwitcher`  | The sign-in / set-password / change-password / 404 shell         |
| `EmptyState`  | `title`, `description`, `icon`, `action`           | Every "nothing here" box — and it emits the `data-empty` hook    |
| `ErrorView`   | `digest`, `reset`                                  | Every `error.tsx` body                                           |

**A primitive earns its place by removing at least three copies.** Fewer than that, keep the markup private to its view (§3.8, private helpers).

### 3.6 Feature views

All page-level views live in `features/<x>/components/` and are **Server Components** (no `"use client"`).

| Route shape        | View name              | Typically absorbs                                                  |
| ------------------ | ---------------------- | -------------------------------------------------------------------- |
| `(main)/layout.tsx`| `AppShell`             | `<aside>`, sidebar header, `<nav>`, `<main>`, footer, toaster       |
| `<x>/page.tsx`     | `<X>ListView`          | `PageHeader` + actions, filter bar, table, pagination, empty state   |
| `<x>/[id]/page.tsx`| `<X>DetailView`        | `BackLink`, `<dl>` rows, sections                                    |
| `<x>/new/page.tsx` | `<X>CreateView`        | `FormPage` + the form                                                |
| `<x>/[id]/edit`    | `<X>EditView`          | `FormPage` + the form                                                |
| dashboard pages    | `<X>View`              | Section wrappers, chart grids, callouts, empty states                |

### 3.7 Example

**Before** — routing and markup mixed:

```tsx
// app/[locale]/(main)/doctors/[id]/edit/page.tsx
return (
  <div className="space-y-6">
    <Link href="/doctors" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
      <ArrowLeft className="size-4" aria-hidden />
      {t("title")}
    </Link>
    <h1 className="text-2xl font-semibold tracking-tight">{t("editDoctor")}</h1>
    <DoctorForm doctor={doctor} services={services} action={action} />
  </div>
);
```

**After** — three files, each with one job:

```tsx
// app/[locale]/(main)/doctors/[id]/edit/page.tsx  — routing only
export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctorId = Number(id);
  if (!Number.isInteger(doctorId) || doctorId <= 0) notFound();

  let doctor;
  try {
    doctor = await getDoctor(doctorId);
  } catch (error) {
    unstable_rethrow(error);                                   // §5.4
    if (error instanceof ApiError && error.isNotFound) notFound();
    throw error;
  }
  const services = await getServiceOptions();

  async function action(values: DoctorFormValues) {
    "use server";
    return updateDoctor(doctorId, values);                     // validates its args — §10.3
  }

  return <DoctorEditView doctor={doctor} services={services} action={action} />;
}
```

```tsx
// features/doctors/components/doctor-edit-view.tsx  — a Server Component
export async function DoctorEditView({ doctor, services, action }: DoctorEditViewProps) {
  const t = await getTranslations("doctors");

  return (
    <FormPage backHref="/doctors" backLabel={t("title")} title={t("editDoctor")}>
      <DoctorForm doctor={doctor} services={services} action={action} />
    </FormPage>
  );
}
```

```tsx
// shared/ui/layout/form-page.tsx
export function FormPage({ backHref, backLabel, title, children }: FormPageProps) {
  return (
    <div className="space-y-6">
      <BackLink href={backHref} label={backLabel} />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
```

### 3.8 Conventions

| Topic            | Convention                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Naming           | `<Feature>ListView`, `<Feature>DetailView`, `<Feature>CreateView`, `<Feature>EditView`, `<Feature>View`; files kebab-case (`doctor-edit-view.tsx`). |
| Location         | `features/<x>/components/` — always. Cross-route scaffolding in `shared/ui/layout/`. **No route-local folder.** Markup no feature owns is the signal to name the feature. |
| Server vs client | Views are **Server Components**. Only interactive leaves carry `"use client"`.                                                               |
| Translations     | A view calls `getTranslations("<ns>")` itself. Pages need translations only for metadata.                                                    |
| Props            | Typed per view (`DoctorEditViewProps`). Pass fetched data and bound actions; **never** pass `t`, raw `searchParams`, or `env` — the page reads env and passes a flag. |
| Barrels          | Views are **not** added to `index.ts`; pages import them by path (§2.4).                                                                     |
| Private helpers  | Markup used by one view stays private in that file (e.g. a local `DetailRow`). Promote to `shared/ui/layout/` only when a **second feature** needs it. |
| Styling          | Views use semantic tokens and existing primitives (§4). A view is not a licence to invent new spacing.                                        |

### 3.9 Adopting it on an existing codebase — order of work

1. **The duplicated shell** (auth pages, form pages). Smallest change, removes real drift.
2. **The bypassed primitives** (`EmptyState`, `SectionHeader`, `PageHeader`). Fixes behaviour, not just structure.
3. **The app shell** out of `(main)/layout.tsx`.
4. **One view per page**, densest pages first.
5. **Then turn on the lint rule** (§3.10) — not before, or the repo is red while you work.

### 3.10 Enforcement [M]

Reviewing for this rule does not work; the reviews found it absent in both codebases despite both stating it in their own ESLint comments. Enforce it:

```js
{
  files: [
    "src/app/**/page.tsx", "src/app/**/layout.tsx",
    "src/app/**/error.tsx", "src/app/**/not-found.tsx", "src/app/**/loading.tsx",
  ],
  // The <html>/<body> owners are the only files allowed intrinsic elements.
  ignores: ["src/app/[locale]/layout.tsx", "src/app/layout.tsx", "src/app/global-error.tsx"],
  rules: {
    "no-restricted-syntax": ["error", ...RESTRICTED_SYNTAX, {
      selector: "JSXOpeningElement[name.name=/^[a-z]/]",
      message: "Routes render one component. Move markup into features/<name>/components/<name>-view.tsx.",
    }],
  },
},
```

Extract the base array **first** — a files-scoped block *replaces* a rule's options rather than merging them (§15).

### 3.11 Relation to the data architecture

- **Server-first:** views are async Server Components that receive server-fetched data from the page.
- **Browser-first** (the browser calls the backend directly): pages stay exactly as thin; each view becomes (or wraps) a client component that loads its own data, and bound Server Actions become mutations. **Only the views change, never the routes** — which is the second reason to do this refactor before any data-layer migration.

---

## 4. The design system in `globals.css`

Tailwind 4 is **CSS-first**: there is no `tailwind.config.ts`. The design system is one file — `src/app/globals.css` — imported once by the root layout. It is the source of truth for colour, type, spacing, radius, elevation and motion, and everything else consumes it through utilities.

### 4.1 File order [M]

Order matters; cascade bugs here look like random component bugs.

```css
/* src/app/globals.css */

@import "tailwindcss";              /* 1. the framework                       */
@custom-variant dark (…);           /* 2. variants                            */
:root { … }                         /* 3. primitives + semantic tokens (light) */
[data-theme="dark"] { … }           /* 4. semantic tokens (dark)              */
@theme inline { … }                 /* 5. expose semantics as utilities       */
@layer base { … }                   /* 6. element defaults only               */
@utility … { … }                    /* 7. custom utilities (rare)             */
@layer components { … }             /* 8. last resort — see §4.6              */
```

### 4.2 Three layers of tokens [M]

| Layer | Example | Who may reference it |
| --- | --- | --- |
| **Primitive** — the raw palette, values only | `--blue-600: oklch(0.55 0.20 259)` | Only the semantic layer. **Never a component.** |
| **Semantic** — the role a colour plays | `--primary`, `--muted-foreground`, `--border-strong` | Every component, via utilities |
| **Component** — a knob one component needs | `--color-sidebar`, `--radius-card` | That component |

A component that writes `bg-blue-600` has taken a decision the design system exists to own; when the brand changes, it is the one thing that does not. The reviewed status page proved the failure mode in miniature: `text-neutral-500 dark:text-neutral-400` hard-coded where `text-muted-foreground` already existed.

### 4.3 The skeleton

```css
@import "tailwindcss";

/* ── 2. Variants ─────────────────────────────────────────────────────────── */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* ── 3. Primitives + semantic tokens (light) ─────────────────────────────── */
:root {
  /* primitives — never used by a component */
  --brand-500: oklch(0.62 0.19 259);
  --brand-600: oklch(0.55 0.20 259);
  --neutral-0: oklch(1 0 0);
  --neutral-50: oklch(0.985 0 0);
  --neutral-500: oklch(0.55 0 0);
  --neutral-900: oklch(0.21 0 0);
  --red-600: oklch(0.58 0.22 27);

  /* scale roots */
  --radius: 0.625rem;

  /* semantic — what components use */
  --background: var(--neutral-0);
  --foreground: var(--neutral-900);
  --muted: var(--neutral-50);
  --muted-foreground: var(--neutral-500);
  --border: oklch(0.92 0 0);
  --border-strong: oklch(0.85 0 0);
  --primary: var(--brand-600);
  --primary-foreground: var(--neutral-0);
  --destructive: var(--red-600);
  --ring: var(--brand-500);
}

/* ── 4. Semantic tokens (dark). Same names. No exceptions. ───────────────── */
[data-theme="dark"] {
  --background: oklch(0.15 0 0);
  --foreground: oklch(0.98 0 0);
  --muted: oklch(0.22 0 0);
  --muted-foreground: oklch(0.72 0 0);
  --border: oklch(0.28 0 0);
  --border-strong: oklch(0.38 0 0);
  --primary: var(--brand-500);
  --primary-foreground: oklch(0.15 0 0);
  --destructive: oklch(0.65 0.20 27);
  --ring: var(--brand-500);
}

/* ── 5. Expose to Tailwind. `inline` keeps the var() indirection, which is
        what makes the theme switch at runtime instead of being baked in. ─── */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive: var(--destructive);
  --color-ring: var(--ring);

  --font-sans: var(--font-app-sans), ui-sans-serif, system-ui, sans-serif;
  --font-arabic: var(--font-app-arabic), var(--font-app-sans), sans-serif;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-card: calc(var(--radius) + 2px);

  --breakpoint-3xl: 120rem;
}

/* ── 6. Element defaults. Nothing that belongs to a component. ───────────── */
@layer base {
  *, ::before, ::after { border-color: var(--color-border); }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  :focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }

  [dir="rtl"] body { font-family: var(--font-arabic); }

  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* ── 7. Custom utilities. Only for what utilities cannot express. ────────── */
@utility chart-grid {
  display: grid;
  gap: calc(var(--spacing) * 6);
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
}
```

### 4.4 `@theme` vs `@theme inline` — the gotcha [M]

`@theme { --color-background: var(--background); }` **resolves at build time**. Your `.dark` / `[data-theme]` overrides then do nothing, and the bug shows up only when someone switches theme. Use **`@theme inline`** whenever a token's value is a `var()` that another selector overrides. Plain `@theme` is for values that never change per theme (breakpoints, font stacks, the radius scale).

### 4.5 What a `@theme` namespace generates

| Namespace         | Generates                                        | Example                                  |
| ----------------- | ------------------------------------------------ | ------------------------------------------ |
| `--color-*`       | `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`, `divide-*` | `--color-primary` → `bg-primary` |
| `--font-*`        | `font-*`                                         | `--font-arabic` → `font-arabic`           |
| `--text-*`        | font-size utilities                              | `--text-hero` → `text-hero`               |
| `--spacing`       | the whole spacing scale (`p-4`, `gap-6`, `size-8`)| one root value, everything derives        |
| `--radius-*`      | `rounded-*`                                      | `--radius-card` → `rounded-card`          |
| `--shadow-*`      | `shadow-*`                                       |                                            |
| `--breakpoint-*`  | responsive variants                              | `--breakpoint-3xl` → `3xl:`               |
| `--container-*`   | `max-w-*`                                        |                                            |
| `--ease-*`, `--animate-*` | `ease-*`, `animate-*`                    |                                            |

Anything without a namespace (z-index layers, timing constants read by JS) stays a plain custom property in `:root` and is used through `var()` or an `@utility`. Check the installed Tailwind docs for the full namespace list before inventing one.

### 4.6 Rules

| # | Rule | |
| --- | --- | --- |
| 1 | **Components use semantic tokens only.** No hex, no `rgb()`, no raw palette step, no hand-written `dark:` pair for a colour that has a token. | **[M]** |
| 2 | **Every semantic token is defined in both themes.** A token missing from one theme inherits the other's value and looks "almost right" until someone screenshots it. | **[M]** |
| 3 | Name tokens by **role**, not value: `--destructive`, not `--red`. Renaming a colour must not require renaming a token. | **[M]** |
| 4 | **Contrast is checked in both themes** — WCAG AA: 4.5:1 body text, 3:1 large text and UI boundaries. A token pair that fails is a broken token, not a design choice. | **[M]** |
| 5 | **No arbitrary values in feature code** (`p-[13px]`, `text-[#0af]`, `w-[327px]`). If the scale lacks it, add a token or use the nearest step. Arbitrary values are tolerated only inside `shared/ui/` and only with a comment. | **[S]** |
| 6 | **Logical properties for RTL**: `ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`. Never `pl-*` / `pr-*` / `left-*` on anything that mirrors. | **[M]** |
| 7 | `@layer components` is a **last resort** — for patterns utilities genuinely cannot express (prose/rich-text output, third-party widget overrides). Never for something that has a React component. | **[S]** |
| 8 | One spacing scale, one radius scale, one elevation scale. Three shadows, not eleven. | **[S]** |
| 9 | **Deleting or renaming a token is a breaking change**: grep the repo first. The token file has no types to protect it. | **[M]** |
| 10 | Class order is machine-decided (`prettier-plugin-tailwindcss`) and conflicts are resolved by `cn()` — never by ordering classes by hand. | **[S]** |

### 4.7 Theming, fonts and charts

- **Dark mode**: one attribute (`data-theme`) or one class on `<html>`, set before hydration by the theme script. `suppressHydrationWarning` on `<html>`. With next-themes, render from `resolvedTheme`, never `theme`.
- **Fonts**: declare with `next/font` in `shared/fonts/`, expose the generated CSS variable, and map it once in `@theme inline` (`--font-sans: var(--font-app-sans), …`). Always keep a real fallback stack.
- **Charts and SVG**: style with utility classes and `currentColor` rather than reading tokens from JS. A server-rendered chart that reads `getComputedStyle` cannot exist; one that uses `fill-muted-foreground` themes itself for free.
- **Multi-tenant / white-label**: tenants override the **semantic layer only**, on a scoping selector (`[data-tenant="x"]`), never the primitive palette and never `@theme`.

### 4.8 Vendored or hand-authored primitives — never ambiguous

- If shadcn is used, registry output lives in `shared/ui/vendor/**`, `cssVariables: true`, and **that path** is the single lint exception (§15). Keep shadcn's semantic token names as they are and *extend* rather than rename them — registry updates assume them.
- Never carve the exception by *depth* (`shared/ui/*.tsx`): the day the project stops vendoring, the exception silently unlints hand-written code — a reviewed app had exactly two files in it, both hand-authored, one of them the shared navigation component that most needed the rules.
- If primitives are hand-authored, there is **no** vendored exception at all. Delete it.

---

## 5. Rendering, routing and Next 16 behaviour

### 5.1 Async request APIs [M]

`params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **Promises**. Type them `Promise<…>` and `await` them. Never work around the type.

**Read request state as deep as possible [M]** — ideally inside the fetcher that needs the token, never in a layout. Reading it in a layout makes the whole subtree dynamic. If the proxy already computed something the layout needs (a CSP nonce, a resolved locale), pass it through a **request header** the proxy sets, so the layout reads props instead of request state.

### 5.2 Caching is explicit, never implicit [M]

Next 16's `fetch` is **uncached by default**. Do not rely on that default silently:

- A fetch that must not be cached says `cache: "no-store"`.
- A fetch that may be cached says `next: { revalidate }` or `next: { tags: [TAG] }`, and the tag is a **constant**, never a string literal at the call site.
- Do not ship contradictory directives. `generateStaticParams()` under a segment declaring `export const dynamic = "force-dynamic"` is inert — delete it, or keep it with a comment saying it is deliberately inert. Both present without explanation makes the next reader believe the tree is static.
- Invalidation uses the **internal** route, including the locale segment: `revalidatePath("/[locale]/admins", "page")`, not `revalidatePath("/admins")`. A path that silently matches nothing is the most common caching bug in a localised app.
- Next 16 also ships `updateTag` / `refresh`; check the installed docs for their stability before using either.

### 5.3 Special files — the full matrix [M]

| File                              | Catches                                | Notes                                                                                                   |
| --------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `app/global-error.tsx`            | a throw in the **root layout**         | `"use client"`, own `<html>`/`<body>`, self-contained (§3.4). English is acceptable and must be commented as deliberate. |
| `app/[locale]/error.tsx`          | a throw in the locale layout's children| Needed wherever a layout can throw (a malformed catalogue, a font module, `getTranslations()` itself).   |
| `<segment>/error.tsx`             | a throw in that route                  | Every route that fetches data has one.                                                                  |
| `<segment>/loading.tsx`           | the await at the top of the page       | Every route that fetches data has one. It is also what lets Next prefetch past a dynamic segment.        |
| `app/[locale]/not-found.tsx`      | `notFound()` under a locale            | Renders `<NotFoundView>`: translated, correct `dir`, a way back **and a locale switcher**.               |
| `app/[locale]/[...rest]/page.tsx` | unmatched paths under a locale         | Calls `notFound()`. next-intl's documented pattern.                                                     |
| `app/not-found.tsx`               | requests that never resolve a locale   | Renders `<RootNotFound>`: minimal, untranslated, no providers.                                          |
| `<segment>/@slot/default.tsx`     | a hard navigation or reload while a parallel slot has no match | **Required for every parallel-route slot.** Without it, loading that URL directly 404s, because Next cannot recover the slot's previous state. A slot that fetches also gets its own `loading.tsx`, or the document cannot flush and nothing streams. |

These files are fixed by filename and position — Next finds them nowhere else. Their **markup** still belongs to a component (§3.4); the file only wires the boundary.

**`error.tsx` rules [M]**

```tsx
"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };   // Next passes the digest; type it
  reset: () => void;
}) {
  return <ErrorView digest={error.digest} reset={reset} />;
}
```

- **Never render `error.message`.** A server exception can carry a connection string, a SQL fragment or a row of personal data.
- **Do** render `error.digest` in small print. It leaks nothing and is the only handle correlating a user's screenshot with the server log.
- Always offer `reset()` or a link out. An error screen with no exit is a dead end.

### 5.4 `redirect()` and `notFound()` are thrown control flow [M]

They throw (`NEXT_REDIRECT`, `NEXT_NOT_FOUND`). **Never call them inside a `try` whose `catch` swallows errors**, and never catch around a dynamic API:

```ts
catch (error) {
  unstable_rethrow(error);   // first line of every catch that can see framework errors
  return toActionResult(error);
}
```

Reviewed consequence: a 401 → `redirect("/login?expired=1")` was swallowed by the generic `catch` in **every** Server Action in the app; the "session expired" branch in the UI was unreachable and users saw "Something went wrong". Equally, a `try/catch` around `cookies()` can let a route prerender with no token, because the dynamic API signals dynamic rendering *by throwing*.

### 5.5 Metadata [S]

`title.template` on the locale layout, `generateMetadata` per page using `getTranslations`. Without it every tab reads the same product name, several open tabs are indistinguishable and bookmarks carry no page name.

### 5.6 Suspense boundaries [M]

- `useSearchParams()` in a client component **must** sit under a `<Suspense>` boundary. If `force-dynamic` currently hides that, the build breaks the day someone removes it — which is exactly when nobody is looking for it.
- Apply it consistently: a component wrapped in one place and not another is a latent build failure, not a style difference.
- Stream long pages: `loading.tsx` at the segment, `<Suspense>` around independently slow sections.

### 5.7 `proxy.ts` (Next 16's middleware) [M]

One file, `src/proxy.ts`, exporting `proxy` and `config.matcher`.

| Does                                                             | Never does                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| i18n routing (next-intl)                                         | Verify a JWT signature                                           |
| Per-request CSP nonce, set on **request and response** headers   | Business authorization (the API is the authority)                |
| Session **presence** check and redirect for page routes          | Redirect `/api/*` — those answer `401 JSON` (§6.3)               |
| Token refresh — **only** where Next.js owns the session (§7.1)   | Write a cookie the backend owns (§7.1), or decode/verify a token |
| —                                                                | Heavy work: it runs before every matched request                 |

**The matcher must exclude `/api`** (and `_next`, static assets) **[M]**, or unauthenticated API calls get a 307 to an HTML login page and a `fetch()` silently receives markup where JSON was expected.

### 5.8 Post-response work

Use `after()` (from `next/server`) for logging, analytics and cleanup that must not delay the response. Never for anything the user's next request depends on.

### 5.9 Images and fonts [S]

- `next/image` props move between majors — `priority` is deprecated in Next 16 in favour of the current preload prop. **Check `node_modules/next/dist/docs/` rather than copying an older example.**
- Do not fight the component's own sizing: a `style={{ height }}` overrides a `h-auto` class, so one of the two is dead code. Pick one.
- Always give a responsive image a `sizes`, or the browser downloads the largest candidate.
- Remote hosts are an explicit `images.remotePatterns` allowlist (§1.4), never `domains`.
- Fonts are declared once with `next/font` in `shared/fonts/` and reach components only through the token mapped in `@theme inline` (§4.7).

---

## 6. The network layer

### 6.1 One client

`shared/api/client.ts` is the only place that knows about transport: base URL, default headers, the auth header, envelope unwrapping, error normalisation into a typed `ApiError`, and the deadline below. Error handling repeated at every call site is an anti-pattern (§18).

- `ApiError` carries `status`, a stable `code` and the original `cause` — declared as `super(message, { cause })`, never re-assigned by hand.
- Map upstream status **before** returning it: `status >= 400 && status < 600 ? status : 502`. Passing an arbitrary upstream number into `NextResponse.json` throws when it falls outside 200–599.
- Distinguish a `TimeoutError` from a transport failure in the catch — the two need different words in the UI.

### 6.2 Every server-side fetch carries a deadline [M]

The single finding with an outage mode, and it was missing in both reviewed apps.

```ts
// RequestOptions
signal?: AbortSignal;

// at the fetch
signal: options.signal
  ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)])
  : AbortSignal.timeout(15_000),
```

If the backend accepts the connection but stalls, Node's HTTP defaults are measured in **minutes**. Every held render occupies the single Node process; browsers give up long before the server does and each retry adds another. A stalled dependency becomes a frontend outage.

| Call site                                                                   | Deadline                                                                 |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Normal server fetch                                                           | 15 s                                                                       |
| Anything on the **navigation critical path** (a token refresh in the proxy)   | 5 s — a refresh that has not answered in five seconds should send the reader to sign in, not hold the navigation |
| Route handler proxying a request                                              | `signal: request.signal`, **combined** with the timeout — so a cancelled download stops the upstream work too |
| Browser client (Tier 2)                                                       | Timeout **and** the query's own signal                                     |

### 6.3 Route handlers [M]

| Rule                                                                                 | Why                                                                                         |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Correct Next 16 signature: `context: { params: Promise<…> }`, awaited                 | —                                                                                             |
| Validate the **body with zod** and every **dynamic segment** before use               | A route handler is a public endpoint; `id: number` is a compile-time fiction                  |
| Answer API clients with a **status code, never a document redirect**                  | A `fetch()` follows a 307 and receives login HTML                                             |
| **CSRF guard on every handler that mutates or sets a cookie** (§8.6)                  | Next's Origin/Host check covers **Server Actions only** — route handlers get none             |
| Stream large responses: pass `upstream.body` through, do not buffer                   | Memory, and it preserves byte-exact payloads (e.g. the UTF-8 BOM that makes Arabic readable in Excel) |
| Reject on `Content-Length` **before** `await request.formData()`                      | Otherwise the size limit prevents forwarding, not buffering — the body is already in memory   |
| Keep the app's upload limit **below** the web server's                                | So the application's message is what the user sees, not the server's generic 413              |
| Never widen an upstream error: map to a fixed problem shape                           | §6.1                                                                                          |

---

## 7. Auth and session — who owns the cookie

### 7.1 The rule [M]

> **If the project has a backend of its own, that backend owns the session cookie end to end. Next.js never sets, refreshes or deletes it.**
> **Next.js issues the cookie only when Next.js *is* the server.**

| The project has… | The cookie is set, renewed and cleared by | Next.js may |
| --- | --- | --- |
| **A backend of its own** — .NET, Node, Java, Laravel, anything that authenticates the user | **That backend.** Sign-in sets it, refresh renews it, sign-out clears it, and a rejected token clears it (§8.5) | **Read only** — a presence check, or forwarding it upstream. Nothing else. |
| **No backend** — Next.js *is* the server: route handlers and Server Actions are the backend, and authentication happens here against a database or an identity provider | **Next.js**, through one helper (§8.4) | Everything. It is the issuer. |

**Why this is a rule and not a preference**

- **Two writers, one cookie, and the pair drifts.** The browser matches `Name` + `Path` + `Domain` exactly. Two codebases maintaining that agreement is two chances to be wrong — and the reviewed app that inverted this rule produced exactly that defect: a sign-out path that silently left the session in the browser (§8.9).
- **Session lifetime, rotation and revocation are the backend's data.** A frontend copy of "how long is a session" is a second number that drifts out of step with the first.
- **The backend must clear the cookie on a rejected token anyway** (`OnChallenge`, §8.5). If the frontend clears it too, one of the two eventually does it at the wrong path.
- **It deletes a whole failure class from the frontend:** no cookie helper, no refresh logic, no `app/api/auth/**` handlers, and no CSRF guard to write for them.

`app/api/auth/**` therefore exists **only in the second row** of that table. With a backend, the frontend has no auth route handlers at all — the sign-in form posts to the backend, and the backend's `Set-Cookie` lands in the browser.

### 7.2 The exception, and its price

Next.js may hold the session **only** when the backend genuinely cannot be changed — a third-party or legacy API that returns the token in a response body and cannot issue a cookie. Then:

- Record it in `docs/decisions/` with the reason and the date.
- Every rule in §8.4 now applies to **your** helper, because you have taken on the ownership this section tells you to avoid — including the refresh double-write (§8.7) and the CSRF guard on your own handlers (§8.6).
- Treat it as debt. The fix is a backend change, not a frontend pattern.

"It is easier", "we already have a proxy" and "we want the API address hidden" are not this exception. Hiding the API address is a hosting decision (§8.2 option C), not a reason to move cookie ownership.

### 7.3 What the frontend still does when the backend owns the cookie

| Concern | The frontend's part |
| --- | --- |
| Sign-in | Post the credentials to the backend with `credentials: "include"`; the backend's `Set-Cookie` does the rest. Handle the transport failure (§10.1). |
| Sign-out | `POST` the backend's logout endpoint, then clear cached data and navigate. **Never** `cookies().delete`. |
| Route guard | A **presence** check in the proxy where it can see the cookie (§8.2), plus a guard driven by the backend's `/auth/me`. Both are UX; the backend is the authority. |
| 401 handling | Clear any client cache and navigate to sign-in. The backend has already cleared the cookie. |
| Session user | One `/auth/me` per request, wrapped in React `cache()`. |
| Never | Set, delete, renew, decode or verify the token. Verifying would need the backend's signing key in the web environment — which is itself a reason the key stays there. |

### 7.4 Invariants, whoever owns the cookie [M]

1. **The backend is the authority.** Every UI-side gate is for user experience only, and says so at the call site. A guard in a layout does not run on client navigation and does not protect a Server Action.
2. **The token never reaches JavaScript.** No `localStorage`, no JS-readable cookie, no token in a response body delivered to the browser, no token in props, markup or logs.
3. **One owner per cookie.** §7.1 decides which. Never both.
4. **The session user is fetched once per request** — React `cache()`.
5. **Whoever owns the cookie owns the CSRF defence for the endpoints that set it** (§8.5 backend, §8.6 frontend-as-server).

### 7.5 Questions to answer before implementing

| # | Question | Why it blocks |
| --- | --- | --- |
| Q1 | Does this project have a backend that authenticates users? | §7.1 — decides everything else |
| Q2 | Production host names for the app and the backend | Decides same-site and the `Domain` option (§8.2), and the CORS origins |
| Q3 | Must sign-out end the session **server-side** immediately? | Cookie deletion alone leaves the token valid until expiry; a `SessionVersion` claim is the fix (§8.5) |
| Q4 | Is the backend reachable from the browser, or only from the server? | Decides CORS, CSP `connect-src`, and whether the proxy can see the cookie at all |

---

## 8. Cookies — the full contract

> **Read §7.1 first: it decides who this section is addressed to.** With a backend, §8.5 is the implementation and the frontend implements none of it. Without one, §8.3–8.4 and §8.6–8.7 are yours. The rules themselves are the browser's, not any framework's — they apply identically to C#, Node, Go or a Next.js route handler.

### 8.1 The session shape

Two cookies, both `httpOnly`, both server-set:

| Cookie | Holds | `SameSite` | Lifetime |
| --- | --- | --- | --- |
| Session | the access token (or an opaque session id) | `Lax` — it must survive a top-level navigation back into the app | from the **token's own `exp`** |
| Refresh | the refresh token | `Strict` — it is never needed on a cross-site navigation | from the issuer's own `Max-Age` |

### 8.2 Same-site hosting — wherever the browser talks to the backend

Browsers block or partition third-party cookies, so the cookie works reliably only when the app and the API are **same-site**: same scheme, same registrable domain. Ports and subdomains do not matter.

| App | API | Same-site? | Result |
| --- | --- | --- | --- |
| `https://admin.example.com` | `https://api.example.com` | ✅ | `SameSite=Lax` works |
| `https://app.example.com:9003` | `https://app.example.com:9001` | ✅ (ports ignored) | `SameSite=Lax` works |
| `https://admin.example.com` | `https://example-api.azurewebsites.net` | ❌ | Needs `SameSite=None`; rejected by Safari and by any browser with third-party cookies off. **Avoid.** |

**Which hosts receive the cookie** — decided by the `Domain` attribute the issuer sets:

| | **A — API host only** | **B — shared parent domain** | **C — one host, reverse proxy** |
| --- | --- | --- | --- |
| Layout | `admin.example.com` → app · `api.example.com` → API | same as A | `admin.example.com/` → app · `admin.example.com/api/` → API |
| Cookie `Domain` | none | `.example.com` | none |
| Next can read the cookie | ❌ | ✅ | ✅ |
| CORS policy needed | ✅ | ✅ | ❌ (same origin) |
| CSP `connect-src` | add the API origin | add the API origin | `'self'` |
| Public base URL | `https://api.…` | `https://api.…` | `/api` (relative) |
| Route guard | client-side only | proxy presence check + client guard | proxy presence check + client guard |
| Who else receives the cookie | nobody | **every** subdomain of the parent | nobody |

> **Ports do not isolate cookies. [M]** Two apps on the same host with different ports already share every cookie for that host. With option C, put any less-trusted app (a public site, a marketing page) on a *different host name*, or accept that it receives the session cookie.

Prefer **C** when a reverse proxy already fronts both apps; otherwise **A**. Use **B** only when no less-trusted app lives under the same parent domain.

### 8.3 Cookie attributes — the reference

| Attribute | Value | Why |
| --- | --- | --- |
| `Name` | one constant, exported from one module | It is half of the identity a browser matches on |
| `HttpOnly` | always | One XSS bug must not leak a multi-hour session |
| `Secure` | always outside local development | — |
| `SameSite` | `Lax` session / `Strict` refresh. **Never `None`** | `None` needs third-party cookies, which are being removed |
| `Path` | explicit, usually `/` | The other half of the identity (§8.4) |
| `Domain` | **omit** unless a sibling host genuinely needs it | Omitting it makes the cookie host-only |
| `Max-Age` / `Expires` | derived from the token (§8.4) | Prefer `Max-Age`; browsers do |

### 8.4 One definition, used for set *and* delete [M]

> A browser only replaces or deletes a cookie whose **`Name`, `Path` and `Domain` match exactly.**

This binds **the owner** (§7.1) — the backend in the normal case, in its own language (§8.5). The TypeScript below is for the case where Next.js is the server. Nobody but the owner writes the cookie at all.

- Export **one** helper per cookie — `sessionCookie(expires?)` — and **one** `clearSessionCookies(target)`. Not four hand-maintained option objects that happen to agree today.
- **No bare-name deletes.** `cookies.delete("name")` emits no `Path`, so the browser derives the default path from the request URI (RFC 6265 §5.1.4) — `/en` for a request to `/en/leads`. The real cookie at `Path=/` survives; the reader now holds two cookies of the same name, and which one is read back depends on browser ordering. This exact bug shipped in a reviewed app **that had a passing test for the invariant** (§16).
- **Lifetime comes from the token, not from a second copy of the backend's configured minutes.** Decode `exp`; two numbers drift, one does not. Copy a refresh cookie's lifetime from the issuer's own `Max-Age`.
- **An already-expired token is a failed login, not a successful one.** If the derived `maxAge` is `0`, the browser drops the cookie the moment it is set and the user "signs in" with no session. Answer 502 instead.
- Clear with the same mechanism everywhere. One reviewed app cleared via `store.set(NAME, "", { maxAge: 0 })` in handlers and `response.cookies.delete(…)` in the proxy — and the path bug is exactly what that split produced.

```ts
// shared/config/cookies.ts — server-only
import "server-only";

export const SESSION_COOKIE = "app_session";

const base = {
  httpOnly: true,
  secure: !isDevelopment,
  sameSite: "lax",
  path: "/",            // no domain: host-only
} as const;

export const sessionCookie = (expires?: Date) => ({ ...base, expires });
export const sessionCookieDeletion = () => ({ ...base, maxAge: 0 });
```

### 8.5 The backend side — what the API must implement [M]

**This is the default case (§7.1): the project has a backend, so the backend owns the cookie.** Everything below is the backend's responsibility, written here because the frontend must know it exists and must not duplicate any of it. The examples are ASP.NET Core; the same five pieces apply to any stack.

**One definition, in the API too.**

```csharp
public static class SessionCookie
{
    public const string Name = "app_session";

    public static CookieOptions Options(DateTimeOffset? expires = null) => new()
    {
        HttpOnly = true,
        Secure   = true,
        SameSite = SameSiteMode.Lax,
        Path     = "/",
        Expires  = expires,
        // Option B only: Domain = ".example.com". Options A and C: no Domain.
    };
}
```

**Login** — append the cookie and **stop returning the token in the body**; return only non-secret data (display name, expiry, role flags).

```csharp
Response.Cookies.Append(SessionCookie.Name, token, SessionCookie.Options(expiresAt));
```

**Logout** — `POST` only (a GET logout can be triggered by a link preload), `[AllowAnonymous]` so an already-expired session can still clear itself, and **deleted with the same options object**:

```csharp
[HttpPost("logout")]
[AllowAnonymous]
public IActionResult Logout()
{
    Response.Cookies.Delete(SessionCookie.Name, SessionCookie.Options());
    return NoContent();
}
```

**Read the token from the cookie** — in `JwtBearerEvents`:

```csharp
OnMessageReceived = context =>
{
    context.Token ??= context.Request.Cookies[SessionCookie.Name];
    return Task.CompletedTask;
},
```

**Clear it on a rejected token** — in `OnChallenge`, so a stale cookie cannot survive a 401:

```csharp
OnChallenge = async context =>
{
    context.HandleResponse();
    context.Response.Cookies.Delete(SessionCookie.Name, SessionCookie.Options());
    await WriteEnvelopeAsync(context.Response, "Unauthorized.", HttpStatusCode.Unauthorized);
},
```

**Current user** — `GET /auth/me` returns the display fields and expiry, and 401 (clearing the cookie through `OnChallenge`) when there is no valid session. It is what feeds the sidebar, the account menu and any UI-side role hiding.

**Revocation (Q2).** Deleting the cookie removes it from *that browser only*; the JWT stays valid until it expires. To end sessions server-side, add a `SessionVersion` column and claim, check it in `OnTokenValidated`, and increment it on logout, deactivation and password change. It also force-signs-out deactivated users.

**CORS (options A and B only).** Exact origins — scheme, host, port, no trailing slash, no wildcards:

```csharp
options.AddPolicy(CorsPolicies.BrowserApp, policy =>
    policy.WithOrigins(browserAppOrigins)
          .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
          .WithHeaders("Content-Type", Csrf.HeaderName)
          .WithExposedHeaders("Content-Disposition")   // export file name
          .AllowCredentials()                          // send the session cookie
          .SetPreflightMaxAge(TimeSpan.FromMinutes(10)));
```

- `AllowCredentials()` **cannot** be combined with `AllowAnyOrigin()`.
- Keep `UseCors()` after `UseRouting`, before `UseRateLimiter` and `UseAuthentication`.
- Fail fast at startup if the origin list is empty outside development. Keep localhost out of production config.

**CSRF middleware** — after `UseCors`, before `UseAuthentication`, for `POST` / `PUT` / `PATCH` / `DELETE`:

1. **Custom header** — require e.g. `X-App-Client: 1`. HTML forms cannot set headers, and a custom header forces a preflight only listed origins pass.
2. **Origin** — reject when `Origin` is present and not an allowed origin.
3. **Content type** — reject JSON endpoints whose `Content-Type` is not `application/json`.

Exclude genuinely public routes. `SameSite=Lax` is a second layer, never the only one.

**Rate limiting and client IP.** The partition key must come from the connection or from a header set by trusted infrastructure. When the browser starts calling the API directly, **remove the old frontend host from the trusted-proxy list** — otherwise a browser can forge the client-IP header the limiter keys on.

### 8.6 CSRF when Next.js *is* the server [M]

Applies when Next.js issues the cookie — the second row of §7.1, or the recorded exception in §7.2. With a backend, this belongs in the backend's middleware (§8.5) and there is nothing to write here.


A cross-site form POST is still *sent* with the cookie, and a `Set-Cookie` on a cross-site top-level POST **is applied** — `SameSite` governs whether a cookie is *sent*, not whether one is *accepted*. Next protects Server Actions with an Origin/Host check; **route handlers get nothing.**

Without a guard: **login CSRF** (the victim is silently signed into the attacker's account and works in it), **set-password CSRF** against an account awaiting its first password, and **forced sign-out** at any time. The anonymous handlers are the exposed ones — an authenticated `Lax` cookie is simply not sent on a cross-site POST, so those already answer 401.

```ts
export function rejectCrossSite(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // A same-origin fetch always sends Origin. Its absence on a POST is a form, not our client.
  if (origin === null || new URL(origin).host !== host) return problem(403, "Request rejected.", "CROSS_SITE");
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return problem(415, "Request rejected.", "CROSS_SITE");
  }
  return null;
}
```

Apply it to **every** cookie-setting or mutating handler — `login`, `logout` (Origin half only, it reads no body), `set-password`, `change-password`, and the ordinary POSTs too. One line each, and it stops relying on `SameSite` alone.

### 8.7 Refreshing a session

**With a backend, refresh is the backend's job** — it renews its own cookie on the request that needs it, and the frontend never notices. Nothing to build here.

The rest of this section applies only where Next.js owns the session (§7.1 second row, or the §7.2 exception). Then: refresh **in the proxy, on the request that needs it**, gated on a leeway (~2 minutes) before expiry — and write the new token to **both**:

- `request.cookies` — so the render on *this* request sees the new token;
- `response.cookies` — so the browser keeps it.

A Server Component cannot set a cookie and a route handler is a different request; the double write is the only correct form. **Comment it**, because it looks redundant and someone will delete it. Give the refresh call a 5-second deadline (§6.2) — it sits on the navigation path.

### 8.8 What Next may do with a cookie it does not own

| Place | Read | How |
| --- | --- | --- |
| Page / layout / Server Component | ✅ | `(await cookies()).get(NAME)` |
| Route handler | ✅ | `(await cookies()).get(…)` or `request.cookies.get(…)` |
| Server Action | ✅ | `(await cookies()).get(…)` |
| `proxy.ts` | ✅ | `request.cookies.get(…)` |

Rules when it only reads: **presence check only** (no decoding, no signature verification — that needs the issuer's key); **never set or delete**, not even on an `?expired=1` branch; **never pass the value to a client component**, into props, markup or logs. `cookies()` is async and makes the route dynamic.

### 8.9 Failure modes seen in review

| Symptom | Cause |
| --- | --- |
| "Sign-out worked but the user is still signed in" | Delete with a bare name → deleted at the default path, not the set path |
| "Sessions silently expire after ten minutes" | Cookie lifetime copied from a stale constant instead of the token's `exp` |
| "Login succeeds, then immediately bounces to login" | Already-expired token → `maxAge: 0` → the cookie is dropped as it is set |
| "It works in Chrome, not Safari" | `SameSite=None` on a cross-site pair |
| "The public site can read the admin session" | A parent-domain `Domain`, or two apps on one host with different ports |
| "The test passes but the bug shipped" | The test compared option objects; the call site used neither (§16) |

### 8.10 Verification before shipping auth

- [ ] Sign in, reload, navigate, sign out — on a **production-like host**, not localhost.
- [ ] Expire the token (or wait) → the UI reaches the sign-in page with the cookie gone.
- [ ] A cross-site POST from another origin to every mutating route is rejected.
- [ ] `document.cookie` shows nothing session-related.
- [ ] The network tab shows no token in any response body reaching the browser.
- [ ] Grep the frontend for `response.cookies`, `cookies().set`, `cookies().delete` — with a backend there are **no hits at all** (§7.1); without one, every hit goes through the one helper (§8.4).
- [ ] The backend clears the cookie on a rejected token, not just on sign-out (§8.5).

---

## 9. React 19 and the React Compiler

### 9.1 Expected shape [M]

| Banned                                         | Use instead                                    |
| ---------------------------------------------- | ------------------------------------------------ |
| `forwardRef`                                   | `ref` as a normal prop                          |
| `<Context.Provider value>`                     | `<Context value>` — `.Provider` is deprecated    |
| `useFormState`                                 | `useActionState`                                 |
| `defaultProps`, `propTypes`, string refs       | Default parameters, TypeScript                   |
| `React.*` namespace access                     | Named imports (lint-enforced, §15)               |
| A state-setting effect to read the environment | `useSyncExternalStore`                           |

### 9.2 The compiler is on, so write code it can see [M]

- **Never `// eslint-disable-next-line react-hooks/exhaustive-deps`.** The suppression opts the **whole component** out of the compiler, not that one hook. In a reviewed app it excluded the single largest client component — the one that benefited most. Give the hook its real dependencies, or move the work into the event handler where it belongs.
- **react-hook-form: `useWatch({ control, name })`, never `watch()`.** `watch()` is flagged `incompatible-library`; the compiler can memoize its result and the control shows stale values.
- **Drop redundant `useMemo` / `useCallback`.** With the compiler on they are hand-maintained dependency arrays that can only drift. Remove them *after* the component is actually being compiled.
- **Tests run the compiler too** (§1.4). Otherwise the one class of bug the compiler can introduce is the one class your tests cannot see.
- Do not write a ref during render — a render-phase ref write is invisible to the compiler. Assign latest-callback refs in an effect.

### 9.3 State and effects [S]

- `useState(propValue)` never re-syncs. If the prop can change (back/forward navigation, a filter link), re-seed with `key={…}` from the parent — and choose the key deliberately: keying on a value the component itself writes will remount it mid-interaction.
- Measure in `useLayoutEffect`, not `useEffect`, or the first paint is wrong.
- Bind effects to the **element** (React 19 callback refs with cleanup), not to a ref object.
- Always cancel: `cancelAnimationFrame`, `clearTimeout`, listeners, observers.
- A rejection inside `startTransition(async () => …)` is **not** surfaced by the transition. If a `try/catch` inside is what makes it safe, say so in a comment — the next person will delete it.

---

## 10. Forms, mutations and Server Actions

### 10.1 Forms

| Rule | Detail |
| --- | --- |
| **Every submit `fetch` is wrapped [M]** | If `fetch` itself rejects (offline, dropped connection, a 502 from the reverse proxy before the app is reached), the rejection leaves `onSubmit`; react-hook-form re-throws from `handleSubmit`, React does not await it, and it becomes an **unhandled rejection no error boundary catches**. The user sees the button say "Signing in…", return to "Sign in", and *nothing else change* — on the sign-in screen, which is the door. |
| Shape | `try { response = await fetch(…) } catch { setError("root", { type: "server", message: t("genericError") }); return; }` |
| Response branching | `code` before `message`; field errors bound to their fields; unmatched errors lifted to `root`. |
| Validation | One zod schema shared by the form and the server. The client copy is for UX; the server copy is the authority. |
| Pending state | `useTransition` / form status; disable the submit control, never the whole form. |
| Hydration gate | If a native POST before hydration would leak a value into the URL, gate the control with `useSyncExternalStore` — then make sure the first rule holds, or the same silent failure returns one line later. |
| Optimistic UI | `useOptimistic` inside `startTransition`; the server result is the truth. |
| After a mutation | Navigate **or** revalidate, not both. `router.refresh()` straight after `router.push()` repeats the work the push already did; if the destination shows stale data, the invalidation path is wrong (§5.2), not the navigation. `replace()` + `refresh()` after **sign-out** is the deliberate exception — it stops the back button showing a signed-in page. |

### 10.2 Downloads and typeahead

- A download link cannot send an `Authorization` header. Where the browser holds the backend's cookie, use `fetch(url, { credentials: "include" })` → blob, so a refusal can still raise a toast. Only where the token is server-side does a route handler add the header and stream the response (§6.3).
- A per-keystroke lookup belongs in a `GET` route handler or a query, not a Server Action: actions run one at a time.

### 10.3 Server Actions are public endpoints [M]

- Bound arguments can be tampered with. **Validate every argument on the server**, including ids and booleans: `z.coerce.number().int().positive().parse(rawId)`. "The id never round-trips through the browser" is false — that is exactly what binding does.
- Return plain serializable objects. Never a class instance or an `Error`.
- Do not swallow `redirect()` (§5.4).
- A file with `"use server"` exports async functions only.

---

## 11. i18n and RTL [M]

| Rule | Detail |
| --- | --- |
| Routing | `defineRouting` + `hasLocale` validation. All navigation through `@/i18n/navigation`; `next/link` and locale-unaware `next/navigation` exports are lint-banned. |
| Raw anchors | No `<a href="/…">` to an internal route. The selector must catch **computed** hrefs, not only string literals; allow intended exceptions with a scoped disable. |
| Every page | `setRequestLocale(locale)`. |
| Direction | `dir` derived from the route segment, not from a client hook. Layout uses logical properties (§4.6 rule 6). |
| Catalogues | `en.json` / `ar.json` key parity checked by a **real test**, not a regex script — a script misses `useTranslations()` with no namespace, `getTranslations({ namespace })`, `t.rich` / `t.raw` / `t.has`, and dynamic keys. |
| 404 | The translated `not-found.tsx` keeps the locale switcher. It is the page a reader who took a wrong turn lands on. |
| Invalidation | Cache paths include the locale segment (§5.2). |
| Typography | A locale-specific font stack is mapped once in `@theme inline` (§4.7), never per component. |

---

## 12. Security baseline [M]

| Control | Requirement |
| --- | --- |
| CSP | Per-request nonce generated in the proxy, `'strict-dynamic'` in production, `unsafe-eval` confined to development. `connect-src 'self'`, plus the backend origin only where the browser calls it directly (§8.2). Thread the nonce through a **request header** so layouts never call `headers()`. |
| Headers | `Strict-Transport-Security` (with `includeSubDomains`), `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`, `poweredByHeader: false`. One source of truth: `shared/config/security-headers.ts`, never duplicated between `next.config.ts` and the proxy. |
| `process.env` | Read in **exactly one module** (`shared/config/env.ts`), enforced by `no-restricted-properties`. Validated with zod including the URL protocol (`z.url({ protocol: /^https?$/ })`). Imported from `instrumentation.ts` so it fails at startup. |
| Secrets | Never `NEXT_PUBLIC_*`. A `NEXT_PUBLIC_` name is a decision to publish. |
| Input | Every route handler body and dynamic segment validated (§6.3); every Server Action argument validated (§10.3). |
| Output | `error.message` is never rendered (§5.3). Logs record the path and the digest, never the token or the body. |
| Uploads | Reject on `Content-Length` first; rebuild the multipart body field by field rather than forwarding it wholesale. |
| Session | §7–§8 in full. |

---

## 13. Accessibility baseline [S]

Checked per PR, not per release:

- One `<main>` per document — never nested inside a layout's `<main>` (a defect that only exists when pages carry markup, §3.2).
- A skip link; `aria-busy` on the content region while it swaps.
- `aria-label` on every `<nav>`, `<aside>` and repeated landmark.
- Labels bound with `useId()` → `htmlFor` + `id`. A combobox trigger has an accessible name.
- `aria-sort` on the **column header**, not the link inside it.
- A scrollable region is keyboard reachable: `tabIndex={0} role="region" aria-label=…` when it overflows.
- Charts and decorative SVG: `role="img"` + `aria-label` plus a `<title>`; purely decorative marks get `aria-hidden`.
- Popovers and menus handle Arrow / Home / End / Escape.
- Disabled navigation renders as an `aria-disabled` element, not a dead link.
- Empty states are one component, so "filter matched nothing" and "this failed to load" never look alike.
- **A wrapper spreads `{...props}` first, then composes its own handlers.** Spreading last lets a consumer silently replace the handler that forwards focus or closes a popover. Every pointer-driven affordance has a keyboard equivalent.
- Dialog and popover headers render **inside** the content element, not beside it — outside, they sit in the page flow while the dialog is closed.
- Focus ring comes from the `--ring` token (§4.3) and is visible in both themes.

---

## 14. Conventions

**kebab-case everywhere.** It matches shadcn and avoids case-sensitivity breakage between Windows development and Linux CI.

**Barrel policy: exactly one barrel per feature (`features/<x>/index.ts`), zero elsewhere. Never `export *`.** Server components, hooks, models, schemas and types go in the barrel; client components and views are imported from their own module (§2.4).

**Comments: three lines maximum.** Write what the code cannot say — the bug this shape prevents, the deployed failure it fixed. Rationale goes in `docs/`, linked (`// see build-log 014 §6`).

**Comments must stay true. [S]** A stale rationale is worse than none: a reviewed app carried a comment justifying a correct split with a reason that had since become false — which is how a correct split gets deleted later. When you change a behaviour, grep for the comment that explains it.

---

## 15. Enforcement — in place from commit one

| Guard                                           | Mechanism                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Layer dependencies                              | `eslint-plugin-boundaries` with `dependencies` + `policies` — `app → feature, shared`; `feature → sharedApi, shared, kernel, own domain`; `domain → kernel` only. (The deprecated `element-types` rule is a silent no-op — do not rely on it.) |
| Deep-import ban                                 | `no-restricted-imports` on `@/features/*/*`                                                                                       |
| **Routes render one component**                 | `no-restricted-syntax` selector on `page` / `layout` / `error` / `not-found` / `loading` (§3.10)                                   |
| Locale-safe navigation                          | `no-restricted-imports` on `next/link` and `next/navigation`'s `redirect` / `usePathname` / `useRouter` → `@/i18n/navigation`      |
| No raw internal `<a href>`                      | `no-restricted-syntax` selector, broad enough for computed hrefs (§11)                                                            |
| React members imported by name                  | `no-restricted-syntax` — no `React.*` namespace                                                                                   |
| No `process.env` outside `shared/config/env.ts` | `no-restricted-properties`                                                                                                        |
| No `any`                                        | `@typescript-eslint/no-explicit-any` + `strict`                                                                                   |
| No circular dependencies                        | `eslint-plugin-import` `no-cycle` with `maxDepth: Infinity`, in CI                                                                |
| Hooks and the compiler                          | `react-hooks/*` **never suppressed** (§9.2) — treat a disable comment as a failed review                                           |
| Class hygiene                                   | `prettier-plugin-tailwindcss` in CI; review rejects hex colours and arbitrary values in feature code (§4.6)                        |

**The flat-config trap [M].** A files-scoped block **replaces** a rule's options rather than merging into them. Extract every ban list into a base constant (`RESTRICTED_SYNTAX`, `RESTRICTED_IMPORTS`) and spread it into any scoped override — otherwise the override silently drops every rule it does not repeat. Keep each ban list declared in exactly **one** array, and comment why.

**The vendored exception.** Exactly one, scoped **by path** (`src/shared/ui/vendor/**`), and only if vendored code actually exists (§4.8). If you find yourself renaming a file to dodge a lint override, the override is wrong — delete it.

---

## 16. Testing

| Layer | What gets tested |
| --- | --- |
| `domain/` | The real target. Filter cascades, date bounds, URL parsing, ordering, token decoding — all without a renderer. Business logic embedded in a component is untestable by construction. |
| `model/` | DTO → model mapping, zod schemas. |
| Components | Interactive leaves only, with the compiler on (§1.4). |
| i18n | Catalogue key parity as a test (§11). |
| Config invariants | Cookie set/delete symmetry, env schema, security headers. |

**Test the call site, not only the constant. [M]** A reviewed app had a test asserting that its two cookie *option objects* shared a path — with a comment explaining the exact bug it prevented — while the actual bug shipped at a call site that used **neither object**. The test gave false confidence on precisely the invariant it was written to protect. When an invariant matters, assert it where it is used: forbid the unsafe call shape, or route every use through one helper so there is only one way to be wrong.

---

## 17. Delivery order — vertical slices, never horizontal layers

Build one route end to end — page → view → components → query → contract → domain → test — then the next. Never "all contracts, then all queries, then all screens". Each slice proves patterns the next one reuses.

| #   | Slice                                | Proves                                                           |
| --- | ------------------------------------ | ------------------------------------------------------------------ |
| 0   | `globals.css` + one primitive        | tokens, both themes, RTL, the class pipeline (§4)                 |
| 1   | a trivial content page (FAQ / terms) | the whole pipeline: SSR fetch, i18n, RTL, view layer, tests, deploy |
| 2   | a listing page                       | caching, Tier 1, route params, `loading` / `error`                |
| 3   | the deep feature                     | the `domain/` layer                                               |
| 4   | a mutating feature                   | Tier 2/4, validation, CSRF, server-authoritative state            |
| 5   | auth end to end                      | the backend's cookie, expiry, sign-out, the 401 path (§7, §8.10)  |

Slice 1 is deliberately trivial. Its job is proving the pipeline where being wrong costs nothing.

---

## 18. Anti-patterns — do not reintroduce

| Anti-pattern                                                                        | Rule that prevents it                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| A `views/` **indirection layer** parallel to `features/`                               | §3.1 — views belong to the feature that owns them |
| Markup, `className` or icons in any `app/` file                                        | §3.1, enforced in §3.10                          |
| A route-local `_components/` folder                                                    | §3.8 — unowned markup names a new feature        |
| A shared primitive that exists and is bypassed                                         | §2.6 — finish the migration or delete it         |
| A hex colour, `rgb()` or raw palette step in a component                               | §4.2 — semantic tokens only                      |
| A hand-written `dark:` pair for a colour that has a token                              | §4.6 rule 1                                      |
| `@theme` (not `inline`) for a token a theme overrides                                  | §4.4 — it bakes the value in                     |
| Two conventions inside one `features/` folder                                          | §2.3 — one anatomy, no exceptions                |
| A `global/` or flat `components/` dumping ground                                       | §2.6 — promotion needs a real trigger            |
| A flat top-level `hooks/` folder                                                       | hooks live with their feature                    |
| Error handling repeated at every call site                                             | §2.5, §6.1 — centralized in `client.ts`          |
| A `fetch` with no deadline                                                             | §6.2                                             |
| `redirect()` inside a swallowing `try/catch`                                           | §5.4                                             |
| `cookies.delete("name")` with no path                                                  | §8.4                                             |
| **Next.js writing a session cookie while the project has a backend**                    | §7.1 — the backend owns it end to end            |
| Next.js **and** the backend both writing the same cookie                                | §7.4 — one owner per cookie                      |
| A frontend cookie helper, refresh path or `app/api/auth/**` in a project that has a backend | §7.1 — none of them should exist              |
| A route handler that trusts its body, its id, or its caller's origin                   | §6.3, §8.6, §10.3                                |
| `// eslint-disable-next-line react-hooks/exhaustive-deps`                              | §9.2 — it opts the whole component out           |
| Request state read in a layout ⇒ nothing prerenders                                    | §5.1                                             |
| Business logic embedded in components, untestable                                      | §16 — `domain/` is pure and tested first         |
| A lint exception scoped by folder depth                                                | §15 — scope by path, and only if it earns its keep |
| Two numbers that must agree (token TTL and cookie TTL, tag strings, a colour and its dark twin) | §5.2, §8.4, §4.2 — derive one from the other |

---

## 19. Bootstrapping a new project

```bash
npx create-next-app@latest <name> --ts --app --tailwind --eslint --src-dir --import-alias "@/*"
cd <name>
npx shadcn@latest init          # only if vendoring primitives; Base UI, rsc: true, rtl if needed
npm i next-intl react-hook-form zod @hookform/resolvers \
      class-variance-authority clsx tailwind-merge lucide-react \
      server-only client-only
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom \
      prettier prettier-plugin-tailwindcss babel-plugin-react-compiler
# add @tanstack/react-query and zustand only when §1.2 applies
```

Then, in order:

1. `tsconfig` — strict, alias, **`target: "ES2022"`**, both `.next` type globs.
2. `next.config.ts` — `reactCompiler`, `poweredByHeader: false`, `turbopack.root`, image allowlist, security headers.
3. **`app/globals.css`** — the token layers, both themes, base layer (§4). Delete any `tailwind.config.*`.
4. `src/i18n/{routing,request,navigation}` and `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`), with the `/api` exclusion in the matcher.
5. `src/shared/config/{env,security-headers,cookies}.ts` + `instrumentation.ts`.
6. `src/shared/api/client.ts` — **with the deadline from §6.2 in the first commit**, not added later.
7. `app/global-error.tsx`, `app/not-found.tsx`, `app/[locale]/not-found.tsx`, `[...rest]/page.tsx`, plus `ErrorView` / `NotFoundView`.
8. ESLint flat config with the §15 guards and the §3.10 route rule — **before** the first feature, not after.
9. `vitest.config.mts` (compiler plugin included) + `vitest.setup.ts`.
10. Answer §7.5 Q1–Q4. If there is a backend, it owns the cookie (§7.1) — the frontend writes **no** auth route handlers and **no** cookie helper. Write the answers into `docs/decisions/`.
11. Slice 0, then Slice 1, end to end.

---

## 20. Pre-merge checklist

**Structure and views**

- [ ] Every file in `app/` renders one component — `page`, `layout`, `error`, `not-found`, `loading` alike; no intrinsic elements, no `className`. (`global-error.tsx` and the `<html>` layouts are the only exemptions.)
- [ ] No new component sits beside a route; each lives in the feature that owns it, or `shared/ui/layout/`.
- [ ] No markup was copied: a second occurrence uses the primitive, a third creates one.

**Design system**

- [ ] No hex, `rgb()` or raw palette step in feature code; no arbitrary values.
- [ ] Every new token exists in both themes and passes AA contrast in both.
- [ ] Tokens a theme overrides are exposed through `@theme inline`.
- [ ] Logical properties used; the page was checked in RTL.

**Rendering**

- [ ] `params` / `searchParams` / `cookies()` / `headers()` awaited; request state read deep, not in a layout.
- [ ] `loading.tsx` **and** `error.tsx` on every data route; `global-error.tsx` and both `not-found.tsx` present.
- [ ] No `error.message` rendered; `digest` typed and shown.
- [ ] No `redirect()` / `notFound()` / dynamic API inside a swallowing `catch`.
- [ ] `useSearchParams()` under `<Suspense>` everywhere it appears.
- [ ] No contradictory rendering directives; `generateMetadata` on new pages.

**Network, auth and security**

- [ ] Every server-side fetch has a deadline; route handlers pass `request.signal`.
- [ ] Every route handler validates body and params; mutating ones reject cross-site requests.
- [ ] Every Server Action validates its arguments.
- [ ] **If the project has a backend: the frontend writes no cookie.** `grep -rn "cookies().set\|cookies().delete\|response.cookies" src/` returns nothing (§7.1).
- [ ] If Next.js *is* the server: cookies set and cleared through one helper; no bare-name deletes.
- [ ] `server-only` / `client-only` on the modules that need them; the proxy bundle still builds.
- [ ] No secret in a `NEXT_PUBLIC_` name; `process.env` read in one module only.

**React**

- [ ] No `react-hooks` disable comments; no `watch()`; no `Context.Provider`; no `forwardRef`.
- [ ] Every submit `fetch` has a `catch` that sets a visible error.
- [ ] Redundant `useMemo` removed from compiled components.

**Process**

- [ ] `npm run lint && npm run typecheck && npm test && npm run format` pass locally and in CI.
- [ ] Every comment touched still says something true.

---

## Appendix A — where these rules came from

Each rule generalises a finding from `FRONTEND-REVIEW.md` (booking admin) or `FRONTEND-CONFORMANCE-REVIEW.md` (CRM intelligence). Severity is the reviews'.

| Rule here | Origin | Severity found |
| --- | --- | --- |
| §6.2 fetch deadlines | CONFORMANCE **H1**, REVIEW **#11** | 🔴 High — the only finding with an outage mode |
| §3 component-based pages and views | CONFORMANCE **H2**, REVIEW **Part 3 / D5** | 🔴 High — not met in either app |
| §5.4 `unstable_rethrow` | REVIEW **#1** | 🔴 High — swallowed in *every* Server Action |
| §8.4 one cookie definition, no bare-name delete | CONFORMANCE **M1**, **L1**, REVIEW **§2.4.2** | 🟠 Medium |
| §8.6 CSRF on route handlers | CONFORMANCE **M2**, REVIEW **#12**, **§2.4.3** | 🟠 Medium |
| §8.5 API-owned cookie, CORS, revocation, rate-limit key | REVIEW **§2.4.1–2.4.4** | Design |
| §8.2 same-site hosting and `Domain` scope | REVIEW **§2.3** | Design |
| §8.7 refresh in the proxy, double write | CONFORMANCE **§2.1** | Pattern |
| §9.2 no hooks-rule suppression | CONFORMANCE **M3**, REVIEW **#7** | 🟠 Medium |
| §5.3 `global-error` + layout boundary | CONFORMANCE **M4**, REVIEW **#5** | 🟠 Medium |
| §10.1 submit `fetch` wrapped | CONFORMANCE **M5**, REVIEW **#8** | 🟠 Medium |
| §4.8 vendored exception scoped by path | CONFORMANCE **M6** | 🟠 Medium |
| §1.4 tests run the compiler | CONFORMANCE **M7**, REVIEW **L17** | 🟠 Medium |
| §6.3 API clients get a status, not a redirect | REVIEW **#2** | 🟠 Medium |
| §10.3 validate Server Action arguments | REVIEW **#3** | 🟠 Medium |
| §5.4 no `try/catch` around `cookies()` | REVIEW **#4** | 🟠 Medium |
| §9.2 `useWatch` not `watch()` | REVIEW **#6** | 🟠 Medium |
| §2.4 `server-only` on config | CONFORMANCE **L15**, REVIEW **#9** | 🟠/🟡 |
| §2.4 client boundary granularity | REVIEW **#10**, **L10** | 🟠 Medium |
| §3.2 bypassed primitives break an automated check | CONFORMANCE **3.2(c)** | 🔴 folded into H2 |
| §4.2 semantic tokens, not hard-coded pairs | REVIEW **3.7**, **L21** | 🟡 Low |
| §5.2 locale-aware invalidation, constant tags | REVIEW **L1**, **L7** | 🟡 Low |
| §5.2 inert `generateStaticParams` | CONFORMANCE **L3**, REVIEW **L5** | 🟡 Low |
| §5.5 per-page metadata | CONFORMANCE **L6**, REVIEW **L6** | 🟡 Low |
| §5.6 Suspense around `useSearchParams` | CONFORMANCE **L5** | 🟡 Low |
| §5.3 typed `digest` | CONFORMANCE **L8** | 🟡 Low |
| §9.1 `<Context value>` | CONFORMANCE **L9** | 🟡 Low |
| §9.2 redundant `useMemo` | CONFORMANCE **L10**, REVIEW **L9** | 🟡 Low |
| §9.3 async transition rejections | CONFORMANCE **L11** | 🟡 Low |
| §6.3 `Content-Length` before `formData()` | CONFORMANCE **L14** | 🟡 Low |
| §11 broad raw-anchor selector | CONFORMANCE **L16** | 🟡 Low |
| §1.4 `target: ES2022` | CONFORMANCE **L18** | 🟡 Low |
| §1.3 format and lint in CI | CONFORMANCE **L17** | 🟡 Low |
| §9.3 `useState` from props never re-syncs | REVIEW **L11** | 🟡 Low |
| §9.3 effects bound to the element, cancelled | REVIEW **L12–L14** | 🟡 Low |
| §1.2 `resolvedTheme`, not `theme` | REVIEW **L15** | 🟡 Low |
| §10.1 navigate **or** revalidate, not both | REVIEW **L2**, CONFORMANCE Part 6 L2 | 🟡 Low |
| §5.9 `next/image` props and sizing | REVIEW **L18** | 🟡 Low |
| §13 spread props before composing handlers | REVIEW **L23** | 🟡 Low |
| §13 dialog header inside the content element | REVIEW **L24** | 🟡 Low |
| §2.4 a primitive calling a library hook needs `"use client"` | REVIEW **#10** (badge) | 🟠 Medium |
| §13 accessibility list | REVIEW **L19–L24**, CONFORMANCE Part 6 | 🟡 Low |
| §6.1 clamp upstream status, `super(message, { cause })` | REVIEW **L8**, **L29** | 🟡 Low |
| §12 HSTS, env protocol, startup validation | REVIEW **L28**, **L30**, CONFORMANCE **L30** | 🟡 Low |
| §11 catalogue parity as a test | REVIEW **L31**, CONFORMANCE Part 5 | 🟡 Low |
| §14 comments must stay true | CONFORMANCE **L4** | 🟡 Low |
| §16 test the call site | CONFORMANCE **M1** analysis | 🟠 Medium |
| §7.1 the backend owns the cookie | REVIEW **D2 / D3 / D4**, **§2.4.2** — "the API owns authentication, the session and the cookie end to end; Next.js never sets or deletes it". CONFORMANCE **Part 7** shows what the inversion cost: the cookie helper, the refresh logic and defects **M1** + **L1** all exist only because the frontend took ownership | Decision |
| §15 flat-config replace-not-merge trap | Both, **§3.8** | Pattern |

**Not adopted here:** everything specific to one product — hosting host names and per-file extraction tables. Those belong in each project's own `docs/decisions/`. The two apps answered cookie ownership in opposite ways; §7.1 settles it for future projects rather than leaving it open.

---

*v3 — 2026-09-22. Generalised from two full-codebase reviews (Next.js 16.3 · React 19.2 · Tailwind 4). Verify every version-specific claim against `node_modules/next/dist/docs/` and the installed Tailwind docs for the versions actually installed.*
