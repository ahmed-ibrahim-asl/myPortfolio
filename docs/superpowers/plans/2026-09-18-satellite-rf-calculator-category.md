# Satellite & RF Calculator Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Satellite course product with a standalone, responsive category containing ten connected engineering calculators and no study, examination, practice, laboratory or formula-sheet product surfaces.

**Architecture:** Keep the tested numerical engines and calculator input declarations. Export a dedicated `satelliteCalculators` registry for every public route, category, sitemap and search consumer. Render the generic category route with a Satellite-specific engineering-flow header, and simplify `SatelliteWorkspace` into a calculator-only surface.

**Tech Stack:** Next.js 16 static export, React 19, CSS modules, KaTeX, Node test runner, Vitest, Puppeteer.

## Global Constraints

- Satellite & RF is its own category. No Satellite entry may appear in Workbenches.
- Publish exactly ten calculators: frequency, orbit, look angles, power, antenna, RF path, noise/G/T, link budget, Doppler/delay and multiple access.
- Remove all public study, progress, practice, examination, laboratory and formula-sheet surfaces.
- Retain sources, explanations, derivations, warnings, history, sharing, printing and compatible value transfer inside calculators.
- Preserve unrelated dirty-worktree changes.
- Do not deploy or publish source PDFs.

---

### Task 1: Public calculator registry and category ownership

**Files:**

- Modify: `data/satellite-course.js`
- Modify: `data/tools.js`
- Modify: `data/tool-categories.js`
- Test: `tests/tools/satellite-category.test.js`

**Interfaces:**

- Produces: `satelliteCalculators`, an ordered array containing the ten public calculator records.
- Consumes: existing `satelliteTools` lesson metadata and `satelliteInputs` calculator declarations.

- [ ] **Step 1: Write the failing registry test**

Assert that `satelliteCalculators.map(({slug}) => slug)` equals:

```js
[
  "frequency-bands",
  "orbit",
  "look-angles",
  "power-lifetime",
  "antenna",
  "rf-path",
  "noise-gt",
  "link-budget",
  "doppler-delay",
  "multiple-access"
];
```

Also assert that Satellite & RF contains these ten unique items and Workbenches contains no ID beginning with `satellite-`.

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test tests/tools/satellite-category.test.js`

Expected: FAIL because `satelliteCalculators` does not exist and Workbenches still contains `satellite-communication`.

- [ ] **Step 3: Add the public registry and update catalog ownership**

Export the ten records from `data/satellite-course.js`. Build Satellite category items only from that array. Remove the course landing and module expansion from `engineeringTools`. Filter every Satellite-prefixed ID from Workbenches. Rename the category to `Satellite & RF Calculators` and describe engineering design outputs rather than a course.

- [ ] **Step 4: Run the registry and category tests**

Run: `node --test tests/tools/satellite-category.test.js tests/tools/theme-and-tool-categories.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS.

### Task 2: Static routes, sitemap and search discovery

**Files:**

- Modify: `app/tools/satellite/[slug]/page.jsx`
- Modify: `app/tools/satellite-communication/page.jsx`
- Modify: `app/sitemap.js`
- Modify: `data/tool-search-hooks.ts`
- Modify: `tests/seo/discovery.test.ts`
- Modify: `tests/seo/tool-search-hook-registry.test.ts`
- Test: `tests/tools/satellite-category.test.js`

**Interfaces:**

- Consumes: `satelliteCalculators` from Task 1.
- Produces: ten static calculator routes, calculator metadata/search hooks and compatibility redirect.

- [ ] **Step 1: Extend failing discovery tests**

Assert that static params, sitemap URLs and registered Satellite search hooks contain exactly the ten calculator slugs. Assert that `/tools/satellite-communication/` is absent from sitemap output, while the category URL remains. Assert that the legacy page calls `redirect('/tools/category/satellite-communication/')`.

- [ ] **Step 2: Run tests and verify failures**

Run: `node --test tests/tools/satellite-category.test.js && npx vitest run --config vitest.seo.config.ts`

Expected: FAIL because discovery still exposes course, practice, laboratory and reference routes.

- [ ] **Step 3: Switch public consumers to the calculator registry**

Use `satelliteCalculators` for static params, sitemap and Satellite search hooks. Rewrite search language around inputs, outputs, assumptions and engineering review. Replace the old Course JSON-LD page with a permanent route redirect to the category.

- [ ] **Step 4: Verify discovery**

Run: `node --test tests/tools/satellite-category.test.js && npx vitest run --config vitest.seo.config.ts`

Expected: PASS with ten Satellite calculator URLs plus the category URL.

### Task 3: Calculator-only workspace

**Files:**

- Modify: `components/tools/satellite/SatelliteWorkspace.jsx`
- Modify: `components/tools/satellite/SatelliteWorkspace.module.css`
- Modify: `components/tools/satellite/SatelliteCatalog.jsx`
- Modify: `tests/tools/satellite-browser.test.js`
- Modify: `tests/tools/satellite-journey-browser.test.js`

**Interfaces:**

- Consumes: `satelliteCalculators`, `satelliteInputs`, calculation engine and state helpers.
- Produces: calculator-only pages with calculation, explanation, print, history, sharing and transfer controls.

- [ ] **Step 1: Write failing browser assertions**

On every public calculator route, assert the absence of `Learning mode`, `Practice`, `Quiz`, `Midterm`, `Final`, `Mark as studied` and practice-return links. Assert that the calculator still exposes Calculate, results, derivation, share, history and print controls.

- [ ] **Step 2: Run the browser tests and verify failure**

Run: `node --test tests/tools/satellite-browser.test.js tests/tools/satellite-journey-browser.test.js`

Expected: FAIL on the current Study/Exam selector and embedded practice panels.

- [ ] **Step 3: Remove course state and conditional branches**

Delete the landing renderer, practice imports/maps, progress state, return-to-practice query logic, learning-mode selector and practice panels from `SatelliteWorkspace`. Keep explicit Calculate behavior and show source-backed lesson cards as calculator documentation. Build module navigation from `satelliteCalculators` only. Remove practice actions and study metadata from `SatelliteCatalog`, or retire the component if the generic category replaces it.

- [ ] **Step 4: Verify calculator behavior**

Run: `node --test tests/tools/satellite-browser.test.js tests/tools/satellite-journey-browser.test.js tests/tools/satellite-share-browser.test.js tests/tools/satellite-print-browser.test.js`

Expected: PASS.

### Task 4: Responsive category flow and gutter repair

**Files:**

- Create: `components/tools/satellite/SatelliteCategoryFlow.jsx`
- Create: `components/tools/satellite/SatelliteCategoryFlow.module.css`
- Modify: `app/tools/category/[slug]/page.tsx`
- Modify: `components/tools/satellite/SatelliteWorkspace.module.css`
- Test: `tests/tools/satellite-category-browser.test.js`
- Modify: `tests/tools/satellite-accessibility-browser.test.js`

**Interfaces:**

- Consumes: ten category items and their routes.
- Produces: `SatelliteCategoryFlow`, a responsive navigation flow from Orbit through Capacity.

- [ ] **Step 1: Write the failing layout test**

At 320, 390, 768, 1024 and 1440 px, assert equal category/workspace left-right gutters within one pixel, no page-level overflow, ten calculator cards and nine labelled flow stages. Assert that each stage links to a calculator and no decorative communication-system figure exists.

- [ ] **Step 2: Run and verify the layout failure**

Run: `node --test tests/tools/satellite-category-browser.test.js tests/tools/satellite-accessibility-browser.test.js`

Expected: FAIL because the category flow does not exist and the current Satellite shell is left-anchored.

- [ ] **Step 3: Build the category flow and own the gutters**

Render `SatelliteCategoryFlow` only for the Satellite category before its cards. Use semantic links in the engineering order `Orbit → Pointing → Power → Antenna → RF path → Noise → Link margin → Doppler → Capacity`. Add a category data strip for units and transfer relationships. Give the Satellite workspace `width:100%`, `margin-inline:auto` and `padding-inline:var(--page-gutter)`; remove dependence on the conflicting global `.shell` width rule. Stack calculator panels before they become too narrow.

- [ ] **Step 4: Run responsive and accessibility tests**

Run: `node --test tests/tools/satellite-category-browser.test.js tests/tools/satellite-accessibility-browser.test.js tests/tools/site-responsive.test.js`

Expected: PASS.

- [ ] **Step 5: Inspect production-like screenshots**

Capture category and representative Orbit/Link Budget pages at 390, 768 and 1440 px in light and dark themes. Verify equal gutters, readable labels, useful first viewport content and no clipped panels.

### Task 5: Retire obsolete course contracts and verify the export

**Files:**

- Modify or remove obsolete assertions in: `tests/tools/satellite-content.test.js`, `tests/tools/satellite-learning-path-browser.test.js`, `tests/tools/satellite-lab-browser.test.js`, `tests/tools/satellite-practice-browser.test.js`, `tests/tools/satellite-formula-browser.test.js`
- Modify: `docs/satellite-communication-verification.md`
- Modify: `docs/satellite-source-audit.md`

**Interfaces:**

- Consumes: completed public registry and UI from Tasks 1–4.
- Produces: a coherent calculator-only regression suite and final evidence ledger.

- [ ] **Step 1: Replace obsolete public-course assertions**

Remove tests whose only contract is a removed route or exam/practice/laboratory UI. Retain pure numerical/source tests where they still validate calculator behavior. Add one scan that rejects removed course language across exported Satellite pages.

- [ ] **Step 2: Run the complete Satellite suite**

Run: `node --test tests/tools/satellite-*.test.js`

Expected: PASS.

- [ ] **Step 3: Run repository verification**

Run:

```powershell
npm test
npx vitest run --config vitest.seo.config.ts
npx tsc --noEmit
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 4: Inspect exported discovery output**

Confirm that `out/tools/category/satellite-communication/index.html` has the category canonical, only ten calculator routes exist in the Satellite static output, and `out/sitemap.xml` contains the category plus ten calculators without course/practice/lab/formula URLs.

- [ ] **Step 5: Update evidence and mark the plan complete**

Record exact test counts, build page count, screenshot review and redirect/export behavior. Check every plan item only after its evidence passes.
