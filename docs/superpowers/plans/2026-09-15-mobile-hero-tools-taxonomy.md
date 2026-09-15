# Mobile Hero and Circuit Design Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a proportionate mobile homepage identity and outcome-focused hero while consolidating circuit-related tool classes under one Circuit Design category.

**Architecture:** Keep homepage behavior in the existing page, header, and `home-grid.css` files. Centralize category aliases, membership, and display groups in `data/tool-categories.js`, then render the returned groups through the existing category route. Preserve legacy static paths while giving them Circuit Design metadata and content.

**Tech Stack:** Next.js 16 App Router, React 19, CSS, Node test runner, Puppeteer, TypeScript.

## Global Constraints

- Mobile identity stays in one horizontal row at 320, 360, 390, and 430 px.
- Mobile copy is exactly “Your hardware idea.” and “A prototype ready to test.”
- Mobile identity uses “Ahmed Ibrahim Asl”, “Embedded Systems & IoT R&D Engineer”, and “PROTOTYPING · FIRMWARE · SYSTEM INTEGRATION”.
- Desktop homepage copy and layout remain unchanged.
- Mobile CTAs stay full width, at least 48 px high, and do not wrap.
- Former category URLs remain statically generated and resolve to the consolidated Circuit Design catalog.
- No new icon dependency, translations, or locale routes.
- Preserve unrelated working-tree changes.

---

### Task 1: Consolidate the Circuit Design taxonomy

**Files:**
- Modify: `tests/tools/theme-and-tool-categories.test.js`
- Modify: `data/tool-categories.js`
- Modify: `app/tools/category/[slug]/page.tsx`
- Modify: `components/tools/design/DesignToolPage.tsx`
- Modify: `app/sitemap.js`

**Interfaces:**
- Produces: `getToolCategory(slug)` aliases legacy circuit slugs to `circuit-design`.
- Produces: `getToolCategoryItems(slug)` returns every circuit member once with a normalized `group`.
- Produces: `getToolCategoryStaticParams()` retains legacy category paths.

- [ ] **Step 1: Write failing taxonomy tests**

Assert that top-level slugs equal `workbenches`, `circuit-design`, `text-encoding`, `conversions`, `number-systems`, and `physics-math`; aliases resolve to Circuit Design; the consolidated item set equals the union of the former five categories with unique IDs; groups appear in the required order; and static params retain legacy slugs.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/tools/theme-and-tool-categories.test.js`

Expected: FAIL because the four former categories still appear at top level and Circuit Design does not aggregate their tools.

- [ ] **Step 3: Implement centralized aliases and group mapping**

Add constants equivalent to:

```js
const circuitCategoryAliases = Object.freeze({
  fundamentals: "Fundamentals",
  resistors: "Resistors",
  "timing-filters": "Circuit Design",
  "control-design": "Control Design",
  "power-conversion-supplies": "Power Conversion & Supplies"
});

const circuitGroupOrder = Object.freeze([
  "Fundamentals",
  "Resistors & Networks",
  "Timing, Filters & Analog Design",
  "Control Design",
  "Power Conversion & Supplies"
]);
```

Map each matching calculator to one of those display groups while preserving its original `category`. Remove the four former categories from `toolCategories`. Return legacy slugs from `getToolCategoryStaticParams()` in addition to top-level slugs.

- [ ] **Step 4: Normalize route navigation and sitemap**

Make legacy category routes render the canonical Circuit Design header and catalog. Change circuit-related design-tool breadcrumbs to `/tools/category/circuit-design/`. Generate sitemap category entries from top-level `toolCategories` only.

- [ ] **Step 5: Run taxonomy tests and verify GREEN**

Run: `node --test tests/tools/theme-and-tool-categories.test.js tests/tools/calculator-restoration.test.js`

Expected: PASS with unique tools and six top-level categories.

- [ ] **Step 6: Commit taxonomy changes**

```bash
git add data/tool-categories.js app/tools/category/[slug]/page.tsx components/tools/design/DesignToolPage.tsx app/sitemap.js tests/tools/theme-and-tool-categories.test.js tests/tools/calculator-restoration.test.js
git commit -m "feat: consolidate circuit design tool categories"
```

### Task 2: Rebuild the mobile identity, headline, menu, and CTAs

**Files:**
- Modify: `tests/tools/home-mobile-clear-service.test.js`
- Modify: `app/page.tsx`
- Modify: `components/SiteHeader.tsx`
- Modify: `app/home-grid.css`
- Modify: `data/portfolio.ts`

**Interfaces:**
- Homepage exposes `.home-mobile-title-line` phrase blocks and `.home-mobile-capabilities` identity text.
- Menu button exposes `aria-label="Open navigation"` or `aria-label="Close navigation"` and `.menu-icon` rails.

- [ ] **Step 1: Update the browser test for the approved design**

Assert exact identity and title copy, a portrait width from 104 through 112 px, horizontal identity alignment, intro font below 16 px, equal CTA widths/heights, no CTA text wrapping, no single-letter headline line, no viewport overflow, icon-only menu semantics, and unchanged desktop copy.

- [ ] **Step 2: Run the browser test and verify RED**

Start the existing local dev server when needed, then run:

`node --test tests/tools/home-mobile-clear-service.test.js`

Expected: FAIL on the old name, role, headline, portrait size, intro size, and menu text.

- [ ] **Step 3: Implement semantic mobile copy and identity**

Update `profile.name` and `profile.role`, add a mobile-only capabilities element, and wrap the two mobile headline phrases in separate spans:

```tsx
<span className="home-copy-mobile home-mobile-headline">
  <span className="home-mobile-title-line">Your hardware idea.</span>
  <b className="home-mobile-title-line">A prototype ready to test.</b>
</span>
```

Keep the desktop headline and its desktop visibility unchanged.

- [ ] **Step 4: Replace menu text with an accessible icon**

Render three decorative rails inside `.menu-icon` when closed and a CSS close mark when open. Set the button's changing `aria-label`; keep `aria-expanded`, `aria-controls`, Escape handling, body scroll locking, and the overlay.

- [ ] **Step 5: Apply the proportional mobile layout**

At `max-width: 560px`, size the portrait to `clamp(104px, 29vw, 112px)`, make the identity row a bordered card with proportional padding, reduce intro text below 16 px, style deliberate headline blocks, and prevent CTA labels from wrapping. Keep every interactive target at least 48 px high and define visible keyboard focus.

- [ ] **Step 6: Run the mobile browser test and verify GREEN**

Run: `node --test tests/tools/home-mobile-clear-service.test.js`

Expected: PASS at 320, 360, 390, and 430 px in light and dark themes, then PASS at 1366 px.

- [ ] **Step 7: Commit mobile changes**

```bash
git add app/page.tsx components/SiteHeader.tsx app/home-grid.css data/portfolio.ts tests/tools/home-mobile-clear-service.test.js
git commit -m "feat: refine mobile portfolio hero"
```

### Task 3: Verify integration and static export

**Files:**
- Modify only if a regression test identifies an in-scope issue.

**Interfaces:**
- Consumes the completed taxonomy and mobile layout.
- Produces a verified static artifact in `out/`.

- [ ] **Step 1: Run focused unit and browser tests**

```bash
node --test tests/tools/theme-and-tool-categories.test.js tests/tools/calculator-restoration.test.js
node --test tests/tools/home-mobile-clear-service.test.js tests/tools/theme-tools-browser.test.js tests/tools/design-tools-browser.test.js tests/tools/design-rebuild-browser.test.js tests/tools/smps-browser.test.js
```

Expected: all selected tests PASS without console errors.

- [ ] **Step 2: Run compile and content checks**

```bash
npx tsc --noEmit
npm run validate:content
```

Expected: both commands exit 0.

- [ ] **Step 3: Build the GitHub Pages artifact**

PowerShell:

```powershell
$env:GITHUB_ACTIONS='true'
npm run build
```

Expected: static export succeeds and generated links use `/myPortfolio`.

- [ ] **Step 4: Inspect responsive screenshots**

Capture the homepage at 320, 360, 390, 430, and 1366 px in both themes. Confirm identity proportion, phrase rhythm, icon state, CTA fit, and absence of horizontal overflow. Capture `/tools/` and `/tools/category/circuit-design/` to confirm the consolidated hierarchy and group order.

- [ ] **Step 5: Review the final diff**

Run:

```bash
git status --short
git diff --stat HEAD~2..HEAD
git diff --check HEAD~2..HEAD
```

Confirm that unrelated local files remain uncommitted and unchanged.
