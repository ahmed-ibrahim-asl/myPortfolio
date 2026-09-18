# Arabic Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a natural, static-export-safe Arabic experience for the portfolio shell, core pages, work and tool catalogs, and calculator interfaces.

**Architecture:** English remains unprefixed while Arabic pages live under `/ar`. A typed dictionary owns interface copy, locale helpers map equivalent paths, and shared data records gain optional localized fields instead of being cloned. Arabic route layouts set `lang` and `dir`; metadata helpers emit reciprocal canonical/hreflang links only for substantive translations.

**Tech Stack:** Next.js 16 App Router/static export, React 19, TypeScript, IBM Plex Sans Arabic, CSS logical properties, Node/Vitest tests.

## Global Constraints

- Arabic copy uses professional Arabic with warm Egyptian calls to action; no literal sentence-by-sentence translation.
- Keep equations, code, units, protocols, part numbers, URLs, and email addresses LTR.
- Preserve the ASL palette, surfaces, spacing, typography roles, and control hierarchy.
- Every substantive Arabic page self-canonicalizes and exposes `en`, `ar`, and `x-default` alternates.
- Untranslated content is clearly labelled `المحتوى التفصيلي متاح بالإنجليزية` and is excluded from Arabic static routes and sitemap.
- No Arabic text clips or causes page-level horizontal overflow at 320 px.

---

### Task 1: Locale core, dictionaries, and path mapping

**Files:**
- Create: `lib/i18n/types.ts`
- Create: `lib/i18n/dictionaries.ts`
- Create: `lib/i18n/routes.ts`
- Modify: `lib/seo.ts`
- Test: `tests/seo/i18n-core.test.ts`

**Interfaces:**
- Produces: `Locale = "en" | "ar"`, `getDictionary(locale)`, `toLocalePath(pathname, locale)`, and locale-aware `createPageMetadata` options.

- [ ] **Step 1: Write failing tests** for complete dictionary keys, route preservation, fallback indexes, trailing slashes, and reciprocal alternates.
- [ ] **Step 2: Run and verify failure** with `npx vitest run tests/seo/i18n-core.test.ts`.
- [ ] **Step 3: Implement typed dictionaries and route maps** for home, about, contact, work, tools, project categories, tool categories, and calculators.
- [ ] **Step 4: Add locale-aware metadata** with `ar_EG` OpenGraph locale and accurate `inLanguage`.
- [ ] **Step 5: Run tests and commit** with `git commit -m "feat: add arabic locale foundation"`.

### Task 2: Localized shell and language switch

**Files:**
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`
- Create: `components/LanguageSwitch.tsx`
- Create: `components/LocalizedShell.tsx`
- Modify: `app/globals.css`
- Test: `tests/tools/arabic-shell.test.js`

**Interfaces:**
- Produces locale-aware navigation/footer components and route-preserving language switching.

- [ ] **Step 1: Write failing component/source tests** for Arabic labels, active navigation, `lang=ar`, `dir=rtl`, fallback explanation, and LTR isolation.
- [ ] **Step 2: Run and verify failure**.
- [ ] **Step 3: Refactor shell components to accept `locale`** while preserving existing English defaults.
- [ ] **Step 4: Add logical-property RTL styles** and mixed-direction utility classes.
- [ ] **Step 5: Run shell tests and commit** with `git commit -m "feat: localize the site shell in arabic"`.

### Task 3: Arabic core pages

**Files:**
- Create: `app/ar/layout.tsx`
- Create: `app/ar/page.tsx`
- Create: `app/ar/about/page.tsx`
- Create: `app/ar/contact/page.tsx`
- Create: `app/ar/work/page.tsx`
- Create: `app/ar/tools/page.tsx`
- Create focused localized presentation components under `components/i18n/`
- Test: `tests/tools/arabic-core-pages.test.js`

**Interfaces:**
- Produces static Arabic core routes sharing profile/project/tool facts with English.

- [ ] **Step 1: Write failing route tests** for static existence, Arabic titles/descriptions, canonical/alternates, directionality, and no copied English marketing paragraphs.
- [ ] **Step 2: Run and verify failure**.
- [ ] **Step 3: Build Arabic home, About, Contact, Work, and Tools pages** with authored Arabic copy and shared factual data.
- [ ] **Step 4: Run focused tests and a build**, then commit with `git commit -m "feat: add arabic core portfolio pages"`.

### Task 4: Arabic category and calculator interfaces

**Files:**
- Create: `app/ar/tools/category/[slug]/page.tsx`
- Create: `app/ar/tools/satellite/[slug]/page.jsx`
- Create: `app/ar/tools/rf/[slug]/page.jsx`
- Modify: `data/tool-categories.js`
- Modify: `data/satellite-course.js`
- Modify: `data/rf-calculators.js`
- Modify: `components/tools/GroupedToolsIndex.tsx`
- Modify: `components/tools/satellite/SatelliteWorkspace.jsx`
- Test: `tests/tools/arabic-tool-routes.test.js`

**Interfaces:**
- Consumes optional `titleAr`, `summaryAr`, and localized workspace labels; produces Arabic category/search/calculator chrome without duplicating numeric engines.

- [ ] **Step 1: Write failing tests** for localized five-tool categories, search/empty states, calculator labels, warnings, result interpretations, and LTR equations.
- [ ] **Step 2: Run and verify failure**.
- [ ] **Step 3: Add localized fields to shared records** and locale props to catalog/workspace components.
- [ ] **Step 4: Add Arabic static params and metadata** only for the ten reviewed calculators.
- [ ] **Step 5: Run tool route tests and commit** with `git commit -m "feat: localize satellite and rf calculators"`.

### Task 5: Arabic project indexes, sitemap, and visual QA

**Files:**
- Create: `app/ar/work/[category]/page.tsx` or the exact existing category route equivalent
- Modify: `app/sitemap.js`
- Modify: `app/globals.css`
- Test: `tests/seo/arabic-discovery.test.ts`
- Test: `tests/tools/arabic-responsive.test.js`

**Interfaces:**
- Produces Arabic project indexes, hreflang sitemap entries, and responsive mixed-direction behavior.

- [ ] **Step 1: Write failing tests** for route parity, no untranslated placeholder URLs, reciprocal hreflang, Arabic schema language, and no page overflow.
- [ ] **Step 2: Run and verify failure**.
- [ ] **Step 3: Add Arabic project category indexes** using shared media and localized summary fields; label English-only details honestly.
- [ ] **Step 4: Update sitemap and responsive RTL styles**.
- [ ] **Step 5: Capture both-theme screenshots** at 320, 390, 768, 1024, and 1440 px; fix only evidenced clipping or direction defects.
- [ ] **Step 6: Run full tests and `npm run build`**, then commit with `git commit -m "feat: complete arabic portfolio discovery"`.

