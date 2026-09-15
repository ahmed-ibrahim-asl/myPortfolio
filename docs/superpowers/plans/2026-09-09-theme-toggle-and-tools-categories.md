# Theme Toggle and Tools Categories Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** Add a persistent dark/light navbar control (dark by default) and replace the overwhelming Tools index with seven browsable category destinations.

**Architecture:** Keep theme state at the document root so the existing semantic tokens recolor the entire site, with a synchronous head initializer preventing a stored-light flash and a small client control handling interaction. Centralize the seven tool-category definitions and grouping rules in one data module; use that source for the Tools hub, static route generation, metadata, and locked-category catalog pages.

**Tech Stack:** Next.js App Router, React, TypeScript/JavaScript, CSS modules and global design-token CSS, Node test runner, Playwright-based responsive checks, static export.

**Global constraints:** Preserve all direct tool URLs, current tool functionality, semantic color tokens, square ASL geometry, and unrelated dirty-worktree changes. Do not commit or push. Use narrow patches and inspect overlapping files before editing.

---

### Task 1: Document-root theme behavior and navbar control

**Files:**
- Create: `lib/theme.js`
- Create: `components/ThemeToggle.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/SiteHeader.tsx`
- Modify: `app/home-grid.css`
- Test: `tests/tools/theme-and-tool-categories.test.js`

**Step 1: Write the failing theme contract tests**

Add tests that assert the exported preference normalizer falls back to `dark`, accepts only `dark` and `light`, and that the initializer script reads the shared storage key and applies `data-theme` plus `color-scheme`. Browser verification will cover the React integration rather than locking tests to component source text.

**Step 2: Run the focused test and confirm the expected failure**

Run: `node --test tests/tools/theme-and-tool-categories.test.js`

Expected: FAIL because `lib/theme.ts`, `ThemeToggle`, and their integration do not exist.

**Step 3: Implement the minimum theme module and client control**

In `lib/theme.js`, export:

```js
export const THEME_STORAGE_KEY = "asl-theme-preference";
export function normalizeTheme(value);
export const themeInitializerScript;
```

The initializer must default to dark, catch storage failures, set `document.documentElement.dataset.theme`, and set `style.colorScheme` before hydration. `ThemeToggle` must initialize safely as dark, reconcile with the root after mounting, toggle the root immediately, persist when possible, show the next available theme action, and expose an accurate `aria-label`/pressed state.

**Step 4: Integrate and style the control**

Install the initializer in `app/layout.tsx`. Render `ThemeToggle` in `SiteHeader` immediately before `Start a project`. Add token-based desktop and mobile styles in `app/home-grid.css`, including a 44px target, focus-visible treatment, and a full-width mobile `Appearance` row.

**Step 5: Run the focused test**

Run: `node --test tests/tools/theme-and-tool-categories.test.js`

Expected: theme contract assertions PASS.

### Task 2: Shared category model and calm Tools hub

**Files:**
- Create: `data/tool-categories.js`
- Create: `components/tools/ToolsCategoryHub.tsx`
- Create: `components/tools/ToolsCategoryHub.module.css`
- Modify: `app/tools/page.tsx`
- Test: `tests/tools/theme-and-tool-categories.test.js`
- Modify: `tests/tools/asl-design-contract.test.js`

**Step 1: Add failing category model tests**

Assert that the shared model has exactly the approved seven unique slugs, every calculator and workbench resolves to exactly one category, and each category produces a non-empty count/examples set. Update the old design-contract assertion so `/tools/` is expected to render `ToolsCategoryHub`, not `UnifiedToolsIndex`.

**Step 2: Run focused tests and confirm failure**

Run: `node --test tests/tools/theme-and-tool-categories.test.js tests/tools/asl-design-contract.test.js`

Expected: FAIL because the shared category model and hub do not exist and the current Tools page still renders all tools.

**Step 3: Implement shared category data**

Create seven stable descriptors with `slug`, `title`, and `intro`, plus pure helpers for lookup, static params, normalized category items, counts, and examples. Map all `engineeringTools` to `workbenches`; map calculators from their existing category value. Throw or fail loudly for an unmapped item so additions cannot silently disappear.

**Step 4: Implement the category hub**

Build a server-rendered `ToolsCategoryHub` whose seven cards are single semantic links to `/tools/category/[slug]/`. Each card must include title, intro, count, up to three example names, and `Explore category`. Style it responsively with semantic ASL tokens, square corners, 1/2/3-column behavior, wrapping text, and clear hover/focus states.

**Step 5: Replace the root Tools catalog**

Update `app/tools/page.tsx` to render its existing heading plus the category hub. Remove the all-tool catalog from this route while leaving direct tool pages untouched.

**Step 6: Run focused tests**

Run: `node --test tests/tools/theme-and-tool-categories.test.js tests/tools/asl-design-contract.test.js`

Expected: category grouping and hub contract assertions PASS.

### Task 3: Static category pages and category-scoped search

**Files:**
- Modify: `components/tools/UnifiedToolsIndex.tsx`
- Create: `app/tools/category/[slug]/page.tsx`
- Modify: `app/asl-tools.css`
- Test: `tests/tools/theme-and-tool-categories.test.js`

**Step 1: Add failing route and locked-catalog tests**

Assert that the category route exports all seven static params, resolves metadata from the shared descriptor, calls `notFound` for unknown slugs, and passes only the selected category into locked catalog mode. Assert that locked mode retains search and result count but does not render the cross-category filter bar.

**Step 2: Run the focused test and confirm failure**

Run: `node --test tests/tools/theme-and-tool-categories.test.js`

Expected: FAIL because the route and locked mode do not exist.

**Step 3: Add locked-category behavior to `UnifiedToolsIndex`**

Add an optional category/locked-items input while preserving current default behavior for any other consumers. In locked mode, initialize from only the supplied items, hide category filter controls, retain query search, keep accurate singular/plural result messaging, and render the existing full-surface cards.

**Step 4: Build all static category pages**

Use `generateStaticParams`, `generateMetadata`, and `notFound` in `app/tools/category/[slug]/page.tsx`. Render a breadcrumb, category eyebrow/title/intro, and the locked searchable catalog. Keep generated URLs compatible with the project’s static-export trailing-slash rules.

**Step 5: Add focused page styles and rerun tests**

Add only the breadcrumb/intro/locked-control layout needed in `app/asl-tools.css`.

Run: `node --test tests/tools/theme-and-tool-categories.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS.

### Task 4: End-to-end verification and visual inspection

**Files:**
- Modify only if a verified defect requires it: files above and responsive tests

**Step 1: Run relevant automated tests**

Run the focused tests, then the existing Tools/work/responsive suites that cover affected shared navigation and cards.

Expected: all selected tests PASS with no new horizontal overflow, clipping, or route errors.

**Step 2: Run the production build**

Run: `npm run build`

Expected: static generation includes `/tools/` and all seven `/tools/category/[slug]/` pages and exits 0. If the build refreshes generated metrics, do not overwrite or revert unrelated user changes.

**Step 3: Inspect the running site in both themes**

At 390, 768, 1366, 1920, and 3440px, verify `/tools/` and one representative category page in dark and light. Confirm the navbar control changes theme, survives reload, works inside the mobile menu, cards remain readable, and no page scrolls horizontally.

**Step 4: Review the final diff without committing**

Use `git diff --` limited to the touched files and report implementation and verification results. Do not commit or push.
