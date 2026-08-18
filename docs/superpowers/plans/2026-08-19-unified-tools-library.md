# Unified Tools Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split Tools page with a category-first library that searches all 41 tool destinations, provides six static category pages with subcategory filters, and preserves every existing tool URL.

**Architecture:** Normalize the existing calculator and workbench registries into one immutable discovery catalog without coupling their internal implementations. Server components derive category routes, metadata, and counts from that catalog; focused client components own ranked search, keyboard navigation, and subcategory filter state. Existing calculator and workbench pages remain at their current URLs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript/ES modules, CSS in `app/game-theme.css`, Node’s built-in test runner, Chrome DevTools Protocol responsive tests, static GitHub Pages export.

## Global Constraints

- Preserve `/tools/` and every existing `/tools/<tool-slug>/` route.
- Add exactly six static `/tools/category/<category-slug>/` routes.
- Do not display the complete individual-tool catalog on the initial empty `/tools/` view.
- Every destination has exactly one primary category and one primary subcategory.
- Calculators and workbenches share one discovery card and search result treatment.
- Search state and subcategory state remain client-local; add no backend, account, persistence, or indexable query-string page.
- Search results are normal links and support Arrow Up, Arrow Down, Enter, and Escape.
- All interactive targets are at least 44×44px; search inputs use at least 16px text.
- No horizontal page overflow at 320, 390, 768, 1024, or 1440px.
- Preserve the static `/myPortflio` GitHub Pages base path and `out/.nojekyll`.
- Follow test-driven development: add a focused failing test before each behavior change.

---

## File Structure

### Create

- `data/tool-library.js` — category definitions, explicit destination taxonomy, advanced-tool search metadata, and the normalized immutable 41-record catalog.
- `lib/tools/tool-library-search.js` — pure category lookup, subcategory filtering, normalized search, and deterministic ranking helpers.
- `components/tools/UnifiedToolCard.tsx` — one full-surface link card for calculators and workbenches.
- `components/tools/ToolCategoryGrid.tsx` — six derived category cards with live catalog counts.
- `components/tools/ToolLibrarySearch.tsx` — accessible global search combobox and compact mixed results.
- `components/tools/CategoryToolBrowser.tsx` — category-local subcategory filters and focused tool grid.
- `app/tools/category/[category]/page.tsx` — statically generated category route, metadata, breadcrumb, search, and browser.
- `tests/tools/tool-library-catalog.test.js` — catalog completeness, taxonomy, category counts, filtering, and ranked-query contracts.
- `tests/tools/tool-library-ui.test.js` — hub/category source contracts and semantic interaction contracts.
- `tests/tools/tool-library-responsive.test.js` — browser journeys for desktop, tablet, and phone.

### Modify

- `app/tools/page.tsx` — replace the calculator-first/advanced-tools split with unified search and category navigation.
- `components/tools/CalculatorFinder.js` — send “browse all” navigation to the unified library and relevant category.
- `app/sitemap.js` — include all six category routes.
- `public/llms.txt` — describe the unified tool directory and category routes.
- `app/game-theme.css` — category matrix, search panel, unified cards, category filters, and responsive states.
- `tests/tools/calculator-restoration.test.js` — replace obsolete split-hub assertions while retaining all calculator restoration checks.
- `tests/tools/discoverability.test.js` — require category routes in sitemap and updated tool-directory copy.
- `tests/tools/github-pages-export.test.js` — verify exported category pages.
- `tests/tools/site-responsive.test.js` — include representative category routes in the sitewide overflow sweep.

### Leave in place

- `data/calculators.js` remains the calculator implementation metadata source.
- `data/tools.js` remains the advanced-workbench implementation metadata source.
- `components/tools/ToolsIndex.js`, `ToolCard.js`, and `ToolNavCard.tsx` may remain until the unified page is verified; remove them only if repository-wide search proves they are unused.
- All existing tool implementations and `/tools/[slug]` behavior remain unchanged.

---

### Task 1: Build the normalized taxonomy and ranked search engine

**Files:**
- Create: `data/tool-library.js`
- Create: `lib/tools/tool-library-search.js`
- Create: `tests/tools/tool-library-catalog.test.js`

**Interfaces:**
- Consumes: `calculators` from `data/calculators.js`; `engineeringTools` from `data/tools.js`.
- Produces: `toolCategories`, `toolLibrary`, `getToolCategory(slug)`, `getToolLibraryItem(id)`, `getCategorySummaries(items)`, `filterToolsByCategory(items, categorySlug, subcategory)`, and `searchToolLibrary(items, query, options)`.
- `searchToolLibrary` options: `{ limit?: number; categorySlug?: string }`; default limit is `8`.

- [ ] **Step 1: Write the failing catalog completeness and taxonomy tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { calculators } from "../../data/calculators.js";
import { engineeringTools } from "../../data/tools.js";
import { toolCategories, toolLibrary } from "../../data/tool-library.js";

test("the unified catalog contains all 41 destinations exactly once", () => {
  assert.equal(toolLibrary.length, calculators.length + engineeringTools.length);
  assert.equal(toolLibrary.length, 41);
  assert.equal(new Set(toolLibrary.map(({ id }) => id)).size, 41);
  assert.equal(new Set(toolLibrary.map(({ href }) => href)).size, 41);
});

test("all destinations use one of the six declared categories and a declared subcategory", () => {
  assert.equal(toolCategories.length, 6);
  const categories = new Map(toolCategories.map((category) => [category.slug, category]));
  for (const tool of toolLibrary) {
    const category = categories.get(tool.categorySlug);
    assert.ok(category, `${tool.id} has an unknown category`);
    assert.ok(category.subcategories.includes(tool.subcategory), `${tool.id} has an unknown subcategory`);
  }
});
```

- [ ] **Step 2: Run the catalog test and confirm the missing-module failure**

Run: `node --test tests/tools/tool-library-catalog.test.js`

Expected: FAIL because `data/tool-library.js` does not exist.

- [ ] **Step 3: Create the six immutable category definitions and explicit calculator taxonomy**

Use these category slugs and subcategories verbatim:

```js
export const toolCategories = Object.freeze([
  Object.freeze({
    slug: "electronics-power",
    title: "Electronics & Power",
    summary: "Design circuits, select components, and estimate power behavior.",
    subcategories: Object.freeze(["Circuits", "Resistors", "Timing & Filters", "Batteries & Power"])
  }),
  Object.freeze({
    slug: "embedded-iot",
    title: "Embedded & IoT",
    summary: "Generate firmware for sensors, communication, and hardware interfaces.",
    subcategories: Object.freeze(["Sensors", "Communication", "Firmware & Interfaces"])
  }),
  Object.freeze({
    slug: "ai-computer-vision",
    title: "AI & Computer Vision",
    summary: "Build runnable detection, segmentation, depth, and sensor-ML projects.",
    subcategories: Object.freeze(["Detection", "Segmentation", "Depth", "Sensor ML"])
  }),
  Object.freeze({
    slug: "control-engineering",
    title: "Control & Engineering",
    summary: "Simulate control systems and solve physics and engineering math problems.",
    subcategories: Object.freeze(["PID & Simulation", "Physics", "Engineering Math"])
  }),
  Object.freeze({
    slug: "security-networks",
    title: "Security & Networks",
    summary: "Build and understand commands for authorized network and security labs.",
    subcategories: Object.freeze(["Network", "Web", "Wireless", "Active Directory"])
  }),
  Object.freeze({
    slug: "data-conversion",
    title: "Data & Conversion",
    summary: "Convert units, encodings, and number-system representations.",
    subcategories: Object.freeze(["Number Systems", "Encoding", "Unit Conversion"])
  })
]);
```

Define `calculatorTaxonomy` with an explicit entry for every calculator slug. Use these rules to populate the object without runtime guessing:

- `ohms-law-calculator`, `voltage-divider-calculator`, and `led-series-resistor-calculator` → `electronics-power / Circuits`.
- `battery-life-calculator` → `electronics-power / Batteries & Power`.
- Every current `Resistors` calculator → `electronics-power / Resistors`.
- Every current `Timing & Filters` calculator → `electronics-power / Timing & Filters`.
- Every current `Conversions` calculator → `data-conversion / Unit Conversion`.
- `ascii-to-hex-converter` and `hex-to-ascii-converter` → `data-conversion / Encoding`.
- The remaining current `Number Systems` calculators → `data-conversion / Number Systems`.
- `acceleration-calculator`, `force-mass-acceleration-calculator`, `speed-distance-time-calculator`, `wavelength-calculator`, and `frequency-to-period-calculator` → `control-engineering / Physics`.
- `percentage-change-calculator`, `square-root-calculator`, and `cube-root-calculator` → `control-engineering / Engineering Math`.

Normalize calculator records with `id`, `href`, `title`, `summary`, `type: "Calculator"`, `categorySlug`, `categoryTitle`, `subcategory`, `keywords`, `aliases`, and `visualKey`.

- [ ] **Step 4: Add explicit workbench discovery metadata and create the frozen 41-record catalog**

```js
const workbenchDiscovery = Object.freeze({
  "ai-script-generator": Object.freeze({
    type: "Workbench",
    categorySlug: "ai-computer-vision",
    subcategory: "Detection",
    aliases: ["Model Mission", "AI Script Generator"],
    keywords: ["YOLO", "YOLOE", "U-Net", "object detection", "segmentation", "depth", "classification", "sensor ML"]
  }),
  "security-command-builder": Object.freeze({
    type: "Workbench",
    categorySlug: "security-networks",
    subcategory: "Network",
    aliases: ["Security Mission", "Security Command Builder"],
    keywords: ["Nmap", "web", "wireless", "traffic", "credentials", "Active Directory", "pivoting", "authorized labs"]
  }),
  "pid-simulator": Object.freeze({
    type: "Simulator",
    categorySlug: "control-engineering",
    subcategory: "PID & Simulation",
    aliases: ["PID", "control simulator"],
    keywords: ["proportional", "integral", "derivative", "tuning", "step response"]
  }),
  "sensor-code-generator": Object.freeze({
    type: "Generator",
    categorySlug: "embedded-iot",
    subcategory: "Sensors",
    aliases: ["Sensor Code Generator", "firmware generator"],
    keywords: ["ESP32", "Arduino", "PlatformIO", "MQTT", "BLE", "ESP-NOW", "I2C", "SPI", "camera", "sensor"]
  }),
  "battery-estimator": Object.freeze({
    type: "Estimator",
    categorySlug: "electronics-power",
    subcategory: "Batteries & Power",
    aliases: ["ESP32 Battery Estimator", "power estimator"],
    keywords: ["battery life", "sleep current", "active current", "duty cycle", "runtime", "ESP32"]
  })
});
```

Map `engineeringTools` through the metadata above and freeze every record plus the containing array. Throw during module initialization if a calculator taxonomy or workbench discovery record is missing.

Export the catalog lookups from `data/tool-library.js`:

```js
export function getToolCategory(slug) {
  return toolCategories.find((category) => category.slug === slug) ?? null;
}

export function getToolLibraryItem(id) {
  return toolLibrary.find((tool) => tool.id === id) ?? null;
}
```

- [ ] **Step 5: Add failing ranking and category-filter tests**

```js
import {
  filterToolsByCategory,
  getCategorySummaries,
  searchToolLibrary
} from "../../lib/tools/tool-library-search.js";

test("representative capability searches rank the intended destinations first", () => {
  assert.equal(searchToolLibrary(toolLibrary, "YOLO")[0].id, "ai-script-generator");
  assert.equal(searchToolLibrary(toolLibrary, "MQTT")[0].id, "sensor-code-generator");
  assert.equal(searchToolLibrary(toolLibrary, "Nmap")[0].id, "security-command-builder");
  assert.equal(searchToolLibrary(toolLibrary, "PID")[0].id, "pid-simulator");
  assert.match(searchToolLibrary(toolLibrary, "resistor")[0].title, /Resistor/i);
});

test("category summaries and subcategory filtering are derived from the catalog", () => {
  const summaries = getCategorySummaries(toolLibrary);
  assert.equal(summaries.length, 6);
  assert.equal(summaries.reduce((sum, category) => sum + category.count, 0), 41);
  const resistors = filterToolsByCategory(toolLibrary, "electronics-power", "Resistors");
  assert.ok(resistors.length > 0);
  assert.ok(resistors.every(({ subcategory }) => subcategory === "Resistors"));
});
```

- [ ] **Step 6: Implement deterministic ranking and filtering**

In `lib/tools/tool-library-search.js`, normalize case and punctuation once, score exact title/alias matches at `100`, title-prefix matches at `80`, title containment at `70`, keyword/alias containment at `60`, category/subcategory matches at `40`, and summary matches at `20`. Sort by descending score, then title, and slice to the limit. Return `[]` for a blank query.

```js
export function searchToolLibrary(items, query, { limit = 8, categorySlug } = {}) {
  const needle = normalizeSearchText(query);
  if (!needle) return [];
  return items
    .filter((item) => !categorySlug || item.categorySlug === categorySlug)
    .map((item) => ({ item, score: scoreTool(item, needle) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .slice(0, limit)
    .map(({ item }) => item);
}
```

Implement the shared category derivation helpers with these signatures:

```js
export function filterToolsByCategory(items, categorySlug, subcategory = "All") {
  return items.filter((item) =>
    item.categorySlug === categorySlug &&
    (subcategory === "All" || item.subcategory === subcategory)
  );
}

export function getCategorySummaries(items) {
  return toolCategories.map((category) => Object.freeze({
    ...category,
    count: items.filter((item) => item.categorySlug === category.slug).length
  }));
}
```

- [ ] **Step 7: Run the focused catalog test**

Run: `node --test tests/tools/tool-library-catalog.test.js`

Expected: all catalog, category, filter, and ranking tests PASS.

- [ ] **Step 8: Commit the catalog and search engine**

```powershell
git add -- data/tool-library.js lib/tools/tool-library-search.js tests/tools/tool-library-catalog.test.js
git commit -m "feat: add unified tool taxonomy and search"
```

---

### Task 2: Build the reusable category and result cards

**Files:**
- Create: `components/tools/UnifiedToolCard.tsx`
- Create: `components/tools/ToolCategoryGrid.tsx`
- Create: `tests/tools/tool-library-ui.test.js`

**Interfaces:**
- Consumes: normalized records from `toolLibrary` and summaries from `getCategorySummaries`.
- Produces: `UnifiedToolCard({ tool, compact? })` and `ToolCategoryGrid({ categories })`.

- [ ] **Step 1: Write failing source-contract tests for full-surface semantic links**

```js
test("unified tool and category cards use one full-surface link", async () => {
  const toolCard = await readFile(new URL("../../components/tools/UnifiedToolCard.tsx", import.meta.url), "utf8");
  const categoryGrid = await readFile(new URL("../../components/tools/ToolCategoryGrid.tsx", import.meta.url), "utf8");
  assert.match(toolCard, /<Link[^>]+className="unified-tool-card/);
  assert.doesNotMatch(toolCard, /<button/);
  assert.match(categoryGrid, /<Link[^>]+className="tool-category-card/);
  assert.match(categoryGrid, /category\.count/);
});
```

- [ ] **Step 2: Run the UI test and confirm the missing-component failure**

Run: `node --test tests/tools/tool-library-ui.test.js`

Expected: FAIL because both card components are absent.

- [ ] **Step 3: Implement the unified destination card**

```tsx
export function UnifiedToolCard({ tool, compact = false }: Props) {
  return (
    <Link className={`unified-tool-card${compact ? " is-compact" : ""}`} href={tool.href}>
      <span className="unified-tool-card-type mono">{tool.type}</span>
      <h3>{tool.title}</h3>
      <p>{tool.summary}</p>
      <span className="unified-tool-card-path mono">
        {tool.categoryTitle} / {tool.subcategory}
      </span>
    </Link>
  );
}
```

Keep the complete card inside one `Link`; do not nest another interactive element.

- [ ] **Step 4: Implement the category matrix with derived counts**

```tsx
export function ToolCategoryGrid({ categories }: Props) {
  return (
    <div className="tool-category-grid">
      {categories.map((category) => (
        <Link className="tool-category-card" href={`/tools/category/${category.slug}/`} key={category.slug}>
          <div className="tool-category-card-top mono">
            <span>{category.count} {category.count === 1 ? "tool" : "tools"}</span>
            <span>{category.subcategories.length} areas</span>
          </div>
          <h2>{category.title}</h2>
          <p>{category.summary}</p>
          <ul aria-label={`${category.title} areas`}>
            {category.subcategories.map((subcategory) => <li key={subcategory}>{subcategory}</li>)}
          </ul>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run the UI test**

Run: `node --test tests/tools/tool-library-ui.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the reusable cards**

```powershell
git add -- components/tools/UnifiedToolCard.tsx components/tools/ToolCategoryGrid.tsx tests/tools/tool-library-ui.test.js
git commit -m "feat: add unified tool discovery cards"
```

---

### Task 3: Add the accessible global tool search

**Files:**
- Create: `components/tools/ToolLibrarySearch.tsx`
- Modify: `tests/tools/tool-library-ui.test.js`

**Interfaces:**
- Consumes: `items`, optional `label`, and optional `categorySlug`.
- Produces: client component with query, active result index, capped ranked results, live count, and listbox navigation.

- [ ] **Step 1: Add failing source-contract tests for combobox semantics and keyboard controls**

```js
test("global search exposes combobox semantics and complete keyboard controls", async () => {
  const source = await readFile(new URL("../../components/tools/ToolLibrarySearch.tsx", import.meta.url), "utf8");
  assert.match(source, /role="combobox"/);
  assert.match(source, /aria-autocomplete="list"/);
  assert.match(source, /aria-activedescendant/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /role="option"/);
  for (const key of ["ArrowDown", "ArrowUp", "Enter", "Escape"]) assert.match(source, new RegExp(key));
  assert.match(source, /aria-live="polite"/);
});
```

- [ ] **Step 2: Run the UI test and confirm the missing-search failure**

Run: `node --test tests/tools/tool-library-ui.test.js`

Expected: FAIL because `ToolLibrarySearch.tsx` is absent.

- [ ] **Step 3: Implement query, result, and active-index state**

Use `useMemo` to call `searchToolLibrary(items, query, { limit: 8, categorySlug })`. Reset the active index to `0` whenever the query changes and results are present; use `-1` when the panel is closed or empty.

- [ ] **Step 4: Implement combobox and keyboard navigation**

```tsx
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (!results.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveIndex((index) => (index + 1) % results.length);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
  } else if (event.key === "Enter" && activeIndex >= 0) {
    event.preventDefault();
    router.push(results[activeIndex].href);
  } else if (event.key === "Escape") {
    setOpen(false);
    setActiveIndex(-1);
  }
}
```

The input must use `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, and an `aria-activedescendant` pointing to the active normal-link result. Results use `role="option"` and retain their `href`.

- [ ] **Step 5: Implement blank and no-result behavior**

Render no result list for a blank query. For a nonblank query with zero results, render `No tools matched “{query}”. Try a broader term or browse a category.`, links to the first three summaries returned by `getCategorySummaries(items)`, and a `Clear search` button. Announce `N results for {query}` through a polite live region.

- [ ] **Step 6: Run the focused tests**

Run: `node --test tests/tools/tool-library-catalog.test.js tests/tools/tool-library-ui.test.js`

Expected: PASS.

- [ ] **Step 7: Commit global search**

```powershell
git add -- components/tools/ToolLibrarySearch.tsx tests/tools/tool-library-ui.test.js
git commit -m "feat: add accessible unified tool search"
```

---

### Task 4: Replace the split Tools hub with category-first navigation

**Files:**
- Modify: `app/tools/page.tsx`
- Modify: `tests/tools/calculator-restoration.test.js`
- Modify: `tests/tools/tool-library-ui.test.js`

**Interfaces:**
- Consumes: `toolLibrary`, `getCategorySummaries`, `ToolLibrarySearch`, and `ToolCategoryGrid`.
- Produces: empty-query hub containing the search panel and six category cards without a complete individual-tool grid.

- [ ] **Step 1: Replace obsolete split-hub assertions with failing category-first assertions**

```js
test("the Tools hub is a unified category-first directory", () => {
  const hub = readFileSync(new URL("../../app/tools/page.tsx", import.meta.url), "utf8");
  assert.match(hub, /ToolLibrarySearch/);
  assert.match(hub, /ToolCategoryGrid/);
  assert.match(hub, /getCategorySummaries/);
  assert.doesNotMatch(hub, /<ToolsIndex/);
  assert.doesNotMatch(hub, /engineeringTools\.map/);
  assert.doesNotMatch(hub, /id="advanced-tools"/);
});
```

Keep the existing tests proving all 36 calculator components and routes exist.

- [ ] **Step 2: Run the focused test and confirm it fails against the split hub**

Run: `node --test tests/tools/calculator-restoration.test.js tests/tools/tool-library-ui.test.js`

Expected: FAIL because the hub still renders `ToolsIndex` and a separate advanced section.

- [ ] **Step 3: Rewrite the Tools hub**

```tsx
export default function ToolsIndexPage() {
  const categories = getCategorySummaries(toolLibrary);
  return (
    <section className="section shell tool-library-hub">
      <header className="tool-library-hero">
        <p className="eyebrow">Free engineering tool library</p>
        <h1>Choose a field or search for the job in front of you.</h1>
        <p className="section-intro">
          Find calculators, code generators, simulators, and guided workbenches without opening the complete catalog at once.
        </p>
      </header>
      <ToolLibrarySearch items={toolLibrary} label="Search all engineering tools" />
      <div className="tool-library-guidance mono">Search directly or open a field to narrow the library.</div>
      <ToolCategoryGrid categories={categories} />
    </section>
  );
}
```

Use the natural metadata title `Free Engineering Tools by Category` and describe the unified 41-destination library.

- [ ] **Step 4: Run the focused hub tests**

Run: `node --test tests/tools/calculator-restoration.test.js tests/tools/tool-library-ui.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the unified hub**

```powershell
git add -- app/tools/page.tsx tests/tools/calculator-restoration.test.js tests/tools/tool-library-ui.test.js
git commit -m "feat: make tools hub category first"
```

---

### Task 5: Add static category routes and subcategory browsing

**Files:**
- Create: `components/tools/CategoryToolBrowser.tsx`
- Create: `app/tools/category/[category]/page.tsx`
- Modify: `tests/tools/tool-library-ui.test.js`

**Interfaces:**
- Consumes: `toolCategories`, `toolLibrary`, `getToolCategory`, `filterToolsByCategory`, `ToolLibrarySearch`, `UnifiedToolCard`, `JsonLd`, `createPageMetadata`, and `absoluteUrl`.
- Produces: six static category pages and a client-local `CategoryToolBrowser({ items, subcategories })`.

- [ ] **Step 1: Add failing static-route and category-browser tests**

```js
test("category routes are statically generated and reject unknown slugs", async () => {
  const source = await readFile(new URL("../../app/tools/category/[category]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /generateStaticParams/);
  assert.match(source, /dynamicParams\s*=\s*false/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /ToolLibrarySearch/);
  assert.match(source, /CategoryToolBrowser/);
  assert.match(source, /JsonLd/);
});

test("category browsing exposes pressed subcategory filters", async () => {
  const source = await readFile(new URL("../../components/tools/CategoryToolBrowser.tsx", import.meta.url), "utf8");
  assert.match(source, /aria-pressed/);
  assert.match(source, /filterToolsByCategory/);
  assert.match(source, /UnifiedToolCard/);
});
```

- [ ] **Step 2: Run the UI test and confirm both missing-file failures**

Run: `node --test tests/tools/tool-library-ui.test.js`

Expected: FAIL because the category route and browser do not exist.

- [ ] **Step 3: Implement client-local subcategory filtering**

`CategoryToolBrowser` starts at `All`, renders `All` plus the subcategories that occur in the supplied category items as buttons with `aria-pressed`, derives results with `filterToolsByCategory`, announces the visible count, and renders a `UnifiedToolCard` for each result. Do not render filters for declared subcategories that have no primary destination in the current catalog.

```tsx
const visibleTools = useMemo(
  () => filterToolsByCategory(items, categorySlug, activeSubcategory),
  [items, categorySlug, activeSubcategory]
);
```

- [ ] **Step 4: Implement the static category server page**

```tsx
export function generateStaticParams() {
  return toolCategories.map(({ slug }) => ({ category: slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = getToolCategory(slug);
  if (!category) return {};
  return createPageMetadata({
    title: `${category.title} Tools`,
    description: category.summary,
    pathname: `/tools/category/${category.slug}/`
  });
}
```

The page resolves the category or calls `notFound()`, filters `toolLibrary` to that category, renders `Home / Tools / {Category}` breadcrumbs, includes the global search above `CategoryToolBrowser`, and supplies a `BreadcrumbList` through the existing escaped `JsonLd` component.

- [ ] **Step 5: Run catalog and UI tests**

Run: `node --test tests/tools/tool-library-catalog.test.js tests/tools/tool-library-ui.test.js`

Expected: PASS.

- [ ] **Step 6: Commit category routes**

```powershell
git add -- components/tools/CategoryToolBrowser.tsx app/tools/category/[category]/page.tsx tests/tools/tool-library-ui.test.js
git commit -m "feat: add browsable tool category pages"
```

---

### Task 6: Style and verify the responsive library experience

**Files:**
- Modify: `app/game-theme.css`
- Create: `tests/tools/tool-library-responsive.test.js`
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: class names introduced in Tasks 2–5.
- Produces: category matrix, search results, cards, filter row, mobile overflow behavior, and browser-level interaction guarantees.

- [ ] **Step 1: Write the failing browser journey**

Reuse the local Next.js and Chrome DevTools Protocol helpers from `tests/tools/model-mission-responsive.test.js`. For each viewport `320×720`, `390×844`, `768×1024`, `1024×800`, and `1440×900`, verify:

```js
const state = await evaluate(client, `(() => ({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  categoryCount: document.querySelectorAll('.tool-category-card').length,
  initialToolCards: document.querySelectorAll('.unified-tool-card').length,
  inputFontSize: parseFloat(getComputedStyle(document.querySelector('.tool-library-search input')).fontSize),
  smallestTarget: Math.min(...[...document.querySelectorAll('.tool-category-card, .tool-library-search button')].map((node) => node.getBoundingClientRect().height))
}))()`);
assert.ok(state.overflow <= 1);
assert.equal(state.categoryCount, 6);
assert.equal(state.initialToolCards, 0);
assert.ok(state.inputFontSize >= 16);
assert.ok(state.smallestTarget >= 44);
```

Then type `MQTT`, verify Sensor Code Generator is the leading result, activate it by keyboard, return to Tools, open Electronics & Power, select Resistors, and verify every visible card exposes `Electronics & Power / Resistors`.

- [ ] **Step 2: Add category routes to the sitewide overflow sweep and run the new test**

Add `/tools/category/electronics-power/`, `/tools/category/embedded-iot/`, and `/tools/category/data-conversion/` to `ROUTES` in `tests/tools/site-responsive.test.js`.

Run: `node --no-warnings --test tests/tools/tool-library-responsive.test.js`

Expected: FAIL because the new class names have no layout rules.

- [ ] **Step 3: Add the desktop category matrix and search panel styles**

Add a dedicated block at the end of `app/game-theme.css` so it wins over older Tools-hub rules without raising selector specificity unnecessarily:

```css
.tool-library-hub { padding-block: clamp(40px, 6vw, 88px); }
.tool-library-hero { max-width: 860px; margin-bottom: 28px; }
.tool-library-search { position: relative; max-width: 980px; }
.tool-library-search input { width: 100%; min-height: 56px; padding: 14px 18px; font-size: 1rem; }
.tool-library-results { display: grid; gap: 8px; margin-top: 8px; }
.tool-category-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.tool-category-card, .unified-tool-card { min-width: 0; color: var(--ink); border: 2px solid #354064; background: var(--panel); }
.tool-category-card { display: flex; min-height: 290px; padding: 22px; flex-direction: column; }
.unified-tool-card { display: grid; min-height: 220px; padding: 20px; align-content: start; }
.unified-tool-card p { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.tool-category-card:focus-visible, .unified-tool-card:focus-visible { outline: 3px solid var(--pixel-cyan); outline-offset: 3px; }
.tool-subcategory-filters { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: thin; }
.tool-subcategory-filters button { min-height: 44px; flex: 0 0 auto; }
```

- [ ] **Step 4: Add tablet and phone adaptations**

At `max-width: 1024px`, use two category columns. At `max-width: 680px`, use one category column, reduce card minimum height, keep 16px input text, use single-column results, and constrain filter overflow to its own row. Do not apply `overflow-x: hidden` to `html` or `body`; fix the responsible element.

- [ ] **Step 5: Add reduced-motion and focus behavior**

Transitions may use border/color and a two-pixel offset. Under `@media (prefers-reduced-motion: reduce)`, remove transforms and transitions for the new cards and search panel.

- [ ] **Step 6: Run responsive and focused functional tests**

Run: `node --no-warnings --test tests/tools/tool-library-responsive.test.js`

Run: `node --test tests/tools/tool-library-catalog.test.js tests/tools/tool-library-ui.test.js tests/tools/calculator-restoration.test.js`

Expected: all PASS at all five viewport sizes.

- [ ] **Step 7: Commit responsive styles and journeys**

```powershell
git add -- app/game-theme.css tests/tools/tool-library-responsive.test.js tests/tools/site-responsive.test.js
git commit -m "feat: make unified tool library responsive"
```

---

### Task 7: Connect sitemap, local discovery, and static export

**Files:**
- Modify: `components/tools/CalculatorFinder.js`
- Modify: `app/sitemap.js`
- Modify: `public/llms.txt`
- Modify: `tests/tools/discoverability.test.js`
- Modify: `tests/tools/github-pages-export.test.js`

**Interfaces:**
- Consumes: `toolCategories`, `toolLibrary`, and `getToolLibraryItem`.
- Produces: category sitemap entries, relevant calculator back-navigation, updated machine-readable directory copy, and export coverage.

- [ ] **Step 1: Write failing discoverability and export assertions**

```js
test("the sitemap includes every static tool category", async () => {
  const source = await readFile(new URL("../../app/sitemap.js", import.meta.url), "utf8");
  assert.match(source, /toolCategories/);
  assert.match(source, /tools\/category\/\$\{category\.slug\}/);
});
```

In the GitHub Pages export test, loop through `toolCategories` and assert that `out/tools/category/<slug>/index.html` exists.

- [ ] **Step 2: Run discoverability tests and confirm missing category coverage**

Run: `node --test tests/tools/discoverability.test.js`

Expected: FAIL because the sitemap does not import `toolCategories`.

- [ ] **Step 3: Add category routes to the sitemap**

Import `toolCategories` and append records using `absoluteUrl(`/tools/category/${category.slug}/`)`, a stable weekly change frequency, and the same timestamp strategy used by the current static routes.

- [ ] **Step 4: Update calculator local discovery navigation**

Resolve the active calculator’s normalized record and change `Browse all 36 calculators` to two links:

- `Browse {categoryTitle}` → `/tools/category/{categorySlug}/`
- `All engineering tools` → `/tools/`

Keep the existing local calculator search and related-tool results.

- [ ] **Step 5: Update `llms.txt`**

Describe `/tools/` as the unified search and category directory. List all six category routes and keep the current Model Mission, Sensor Generator, Security Mission, PID, Battery, and calculator route references.

- [ ] **Step 6: Run discoverability and export tests**

Run: `node --test tests/tools/discoverability.test.js`

Run: `node --test tests/tools/github-pages-export.test.js`

Expected: both PASS; the second command produces all 41 existing destinations plus six category pages under `out/`.

- [ ] **Step 7: Commit discovery and export integration**

```powershell
git add -- components/tools/CalculatorFinder.js app/sitemap.js public/llms.txt tests/tools/discoverability.test.js tests/tools/github-pages-export.test.js
git commit -m "feat: publish unified tool category routes"
```

---

### Task 8: Remove obsolete hub-only code after proving it is unused

**Files:**
- Delete only if unused: `components/tools/ToolsIndex.js`
- Delete only if unused: `components/tools/ToolCard.js`
- Delete only if unused: `components/tools/ToolNavCard.tsx`
- Modify: `app/game-theme.css`
- Modify: tests that contain obsolete split-hub selectors

**Interfaces:**
- Consumes: repository-wide reference results.
- Produces: no orphaned hub components or CSS while preserving calculator-local discovery.

- [ ] **Step 1: Prove which legacy components have no importers**

Run:

```powershell
rg -n "ToolsIndex|ToolCard|ToolNavCard" app components tests --glob '*.js' --glob '*.tsx'
```

Expected: references exist only in the component files themselves or obsolete tests. If any production importer remains, keep that component and remove only confirmed dead files.

- [ ] **Step 2: Delete confirmed dead components with `apply_patch`**

Delete each file only after Step 1 proves it has no production importer. Do not delete `CalculatorFinder`, `CalculatorShell`, or the calculator registry.

- [ ] **Step 3: Remove CSS selectors used exclusively by the deleted hub components**

Use `rg` for each candidate class in `app`, `components`, and `tests`. Remove only selectors with no remaining markup owner. Preserve shared `.project-card`, `.writing-tools`, `.filter-row`, and calculator-local styles.

- [ ] **Step 4: Run focused regression tests**

Run: `node --test tests/tools/tool-library-*.test.js tests/tools/calculator-restoration.test.js tests/tools/discoverability.test.js`

Expected: PASS.

- [ ] **Step 5: Commit cleanup if files changed**

```powershell
git add -A -- components/tools app/game-theme.css tests/tools
git commit -m "refactor: remove obsolete split tools hub"
```

If Step 1 proves that every candidate still has a production importer, skip the commit and record that no cleanup was required.

---

### Task 9: Run complete verification, review, merge, and publish

**Files:**
- Verify all changed files.
- Update no source file unless verification exposes a specific defect, in which case add a failing regression test before the fix.

**Interfaces:**
- Consumes: the complete unified library implementation.
- Produces: independently reviewed, merged, and publicly verified source and GitHub Pages deployment.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: zero failures; intentional environment skips must state their reason.

- [ ] **Step 2: Run TypeScript and content validation**

Run: `npx tsc --noEmit`

Run: `npm run validate:content`

Expected: both commands exit `0`.

- [ ] **Step 3: Run dependency audit**

Run: `npm audit --omit=dev --audit-level=high`

Expected: zero high or critical production vulnerabilities.

- [ ] **Step 4: Build the exact GitHub Pages export**

```powershell
$env:GITHUB_ACTIONS='true'
npm run build
Remove-Item Env:GITHUB_ACTIONS
```

Expected: successful static export containing `/tools/index.html`, all six `/tools/category/<slug>/index.html` files, all 41 existing tool destinations, `out/_next`, and `out/.nojekyll`.

- [ ] **Step 5: Inspect representative desktop and mobile routes**

Check `/tools/`, `/tools/category/electronics-power/`, `/tools/category/embedded-iot/`, and `/tools/category/data-conversion/` at 390×844 and 1440×900. Confirm:

- the empty hub displays six categories and zero individual tool cards;
- search ranks YOLO, MQTT, Nmap, PID, and resistor results correctly;
- subcategory filters change visible cards;
- cards are clickable across their complete surface;
- no text is cropped and no page has horizontal overflow.

- [ ] **Step 6: Request independent code review**

Provide the design spec, this implementation plan, the merge-base diff, and verification output. Resolve every Critical and Important finding with a failing regression test and a separate fix commit.

- [ ] **Step 7: Merge the verified implementation into `main`**

Use a fast-forward merge when the feature branch descends directly from `main`. Rerun `npm test` on the merged commit before publication.

- [ ] **Step 8: Push editable source**

Run: `git push origin main:source`

Expected: `origin/source` resolves to the verified source commit.

- [ ] **Step 9: Publish the exact `out/` artifact to the Pages branch**

Use a temporary worktree based on `origin/main`, replace only that exact worktree’s contents with the verified `out/` files, compare source and deployment file hashes, commit with `deploy: publish unified tools library`, and push detached `HEAD` to `origin/main` without force.

- [ ] **Step 10: Verify the public deployment and clean temporary worktrees**

Verify HTTP `200` plus expected category/search markers for:

- `https://ahmed-ibrahim-asl.github.io/myPortflio/tools/`
- all six `/myPortflio/tools/category/<slug>/` routes;
- one calculator route;
- Model Mission, Sensor Generator, PID, Battery, and Security Mission;
- `/myPortflio/sitemap.xml` and `/myPortflio/llms.txt`.

Remove only the exact clean deployment and feature worktrees after live verification succeeds, prune worktree metadata, and delete the merged feature branch.

---

## Completion Criteria

The work is complete only when the empty Tools hub renders search plus six category cards, the global search finds all 41 destinations and capability aliases, all category pages and existing tool routes export successfully, responsive browser journeys pass at all five target widths, the full test/type/build/audit suite is green, independent review has no remaining Critical or Important finding, and the public GitHub Pages routes serve the verified artifact.
