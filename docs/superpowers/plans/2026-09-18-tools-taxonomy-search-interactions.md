# Tools Taxonomy, Search, and Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Satellite and RF into five-tool specialist categories, add scoped search to every category, preserve legacy links, and upgrade engineering plots with accessible interaction.

**Architecture:** `data/tool-categories.js` remains the catalog authority and gains explicit category/group/search metadata. A shared grouped catalog client renders all category pages, while Satellite and RF retain dedicated calculator workspaces and canonical route roots. Plot math stays in pure functions under `lib/tools/satellite` so UI behavior is testable without a browser.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript/JavaScript, SVG, Node test runner, JSDOM.

## Global Constraints

- Category order is Workbenches, Circuit Design, Text & Encoding, Conversions, Number Systems, Physics & Math, Satellite, RF Engineering.
- Satellite and RF contain exactly five unique calculators each; Wavelength remains only in Physics & Math.
- No exam, practice, progress, difficulty, study-time, or studied-state controls appear publicly.
- Preserve valid query strings across legacy redirects.
- Use ASL blue for calculated data, amber for selected references or constraints, and teal for acceptable margin or capacity.
- Controls meet 44–48 px touch targets and pages never gain horizontal overflow at 320 px.

---

### Task 1: Catalog ownership and route map

**Files:**
- Modify: `data/tool-categories.js`
- Modify: `data/satellite-course.js`
- Create: `data/rf-calculators.js`
- Test: `tests/tools/tool-taxonomy-v2.test.js`

**Interfaces:**
- Produces: `satelliteCalculators`, `rfCalculators`, `getToolCategoryItems(slug)`, and `getLegacyToolRedirect(slug)`.

- [ ] **Step 1: Write the failing test** asserting the eight-category order, five items per specialist category, unique public hrefs, category group order, and Wavelength ownership.
- [ ] **Step 2: Run test to verify it fails** with `node --test tests/tools/tool-taxonomy-v2.test.js`.
- [ ] **Step 3: Implement the minimal split** by moving RF metadata into `rf-calculators.js`, assigning canonical `/tools/rf/<slug>/` hrefs, and defining old-to-new slug redirects.
- [ ] **Step 4: Run test to verify it passes** with the same command.
- [ ] **Step 5: Commit** with `git commit -m "feat: split satellite and rf tool catalogs"`.

### Task 2: Shared searchable grouped category UI

**Files:**
- Create: `components/tools/GroupedToolsIndex.tsx`
- Create: `components/tools/GroupedToolsIndex.module.css`
- Modify: `app/tools/category/[slug]/page.tsx`
- Modify: `lib/tool-search.js`
- Test: `tests/tools/category-search-v2.test.js`

**Interfaces:**
- Consumes: `CatalogItem[]` where each item exposes `title`, `summary`, `tags`, `symbols`, `aliases`, and `group`.
- Produces: query-backed grouped filtering with live count and empty state.

- [ ] **Step 1: Write failing tests** for title, summary, tag, symbol, abbreviation, and group matches; empty groups hidden; group order retained; `?q=` initial state supported.
- [ ] **Step 2: Run test to verify it fails** with `node --test tests/tools/category-search-v2.test.js`.
- [ ] **Step 3: Implement shared grouped search** with an accessible search label, clear action, live results, purpose-specific thumbnails, and query-string synchronization using `history.replaceState`.
- [ ] **Step 4: Replace category-specific card branches** so every category, including Circuit Design, Satellite, and RF, uses the shared catalog.
- [ ] **Step 5: Run tests** with `node --test tests/tools/category-search-v2.test.js tests/tools/theme-and-tool-categories.test.js`.
- [ ] **Step 6: Commit** with `git commit -m "feat: add scoped search to every tool category"`.

### Task 3: RF canonical routes and compatibility redirects

**Files:**
- Create: `app/tools/rf/[slug]/page.jsx`
- Create: `app/tools/satellite/[slug]/LegacyRfRedirect.jsx`
- Modify: `app/tools/satellite/[slug]/page.jsx`
- Modify: `app/tools/satellite-communication/page.jsx`
- Create: `app/tools/category/satellite-communication/page.tsx`
- Test: `tests/tools/tool-route-compatibility.test.js`

**Interfaces:**
- Produces: canonical RF pages and client redirects that retain `window.location.search` for static hosting.

- [ ] **Step 1: Write failing route-contract tests** for static params, canonical metadata, and legacy destination mapping.
- [ ] **Step 2: Run test to verify it fails** with `node --test tests/tools/tool-route-compatibility.test.js`.
- [ ] **Step 3: Implement RF pages and compatibility routes** without duplicating calculator definitions.
- [ ] **Step 4: Run tests and a production build** with `node --test tests/tools/tool-route-compatibility.test.js && npm run build`.
- [ ] **Step 5: Commit** with `git commit -m "feat: add canonical rf routes and legacy redirects"`.

### Task 4: Accessible engineering plot model

**Files:**
- Modify: `lib/tools/satellite/visuals.js`
- Modify: `components/tools/satellite/SatelliteLivePlots.jsx`
- Modify: `components/tools/satellite/SatelliteLinkPlot.jsx`
- Modify: `components/tools/satellite/SatelliteDiagrams.jsx`
- Modify: `components/tools/satellite/SatelliteWorkspace.module.css`
- Test: `tests/tools/satellite-interactive-plots-v2.test.js`

**Interfaces:**
- Produces pure helpers `buildAntennaPattern`, `buildRfPathSeries`, `buildNoiseContributions`, `buildLinkWaterfall`, `buildPowerLifeSeries`, and `buildAccessSegments`.

- [ ] **Step 1: Write failing numeric tests** for normalized boresight, -3 dB HPBW crossings, log-distance monotonic FSPL, stage noise contributions, signed waterfall totals, EOL endpoint, and segment capacity sums.
- [ ] **Step 2: Run test to verify it fails** with `node --test tests/tools/satellite-interactive-plots-v2.test.js`.
- [ ] **Step 3: Implement pure plot models** with finite-value guards and explicit approximation labels.
- [ ] **Step 4: Run numeric tests** and keep existing satellite engine tests green.
- [ ] **Step 5: Add synchronized polar/Cartesian antenna views** with pointer/tap/focus probes, boresight, HPBW, dish inset, and keyboard arrow controls.
- [ ] **Step 6: Upgrade the other calculator plots** to expose the focusable probes and reference-plane readouts specified in the design document.
- [ ] **Step 7: Add reduced-motion and touch behavior tests** in `tests/tools/satellite-accessibility-browser.test.js` and run the focused browser suite.
- [ ] **Step 8: Commit** with `git commit -m "feat: add accessible interactive rf plots"`.

### Task 5: Remove learning-state surfaces and verify responsive behavior

**Files:**
- Modify: `components/tools/satellite/SatelliteWorkspace.jsx`
- Modify: `components/tools/satellite/SatelliteCategoryFlow.jsx`
- Modify: `app/asl-tools.css`
- Test: `tests/tools/satellite-public-surface.test.js`
- Test: `tests/tools/tool-category-responsive.test.js`

**Interfaces:**
- Produces public calculators with calculation, explanation, source, and graph surfaces only.

- [ ] **Step 1: Write failing source and browser tests** rejecting exam/practice/studied/progress UI and enforcing button type floors and no page overflow at 320, 390, 768, 1024, 1440, and 1920 px.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Remove public learning-state imports and UI** while retaining private dead data only where other tests require it.
- [ ] **Step 4: Apply the approved mobile control hierarchy** to category and calculator controls.
- [ ] **Step 5: Run focused tests, full `npm test`, and `npm run build`**.
- [ ] **Step 6: Commit** with `git commit -m "fix: simplify satellite and rf public calculators"`.

