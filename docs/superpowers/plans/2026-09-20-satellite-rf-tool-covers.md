# Satellite and RF Tool Covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and integrate ten unique ASL-branded cover images for every Satellite and RF Engineering calculator.

**Architecture:** Add one versioned raster source per calculator under `public/media/tools/`, expose those paths through the existing specialist-tool catalog adapter, and let the current public-image pipeline produce responsive AVIF/WebP variants. A focused contract test will enforce complete and unique cover coverage before the category pages consume the assets.

**Tech Stack:** Next.js 16.3.1, React, Node test runner, GPT Image built-in generation, Sharp-based public image pipeline.

## Global Constraints

- Produce ten separate 16:9 landscape raster covers.
- Use dark charcoal, warm gold, restrained teal, precise engineered forms, and crisp studio lighting.
- Do not include titles, words, formulas, numbers, logos, badges, watermarks, people, flags, or pseudo-text.
- Keep the important subject away from crop edges and readable at card size.
- Use the same images for English and Arabic pages.
- Do not replace existing workbench or calculator covers.
- Do not change calculator behavior, formulas, routes, layouts, or localization.

---

### Task 1: Add the Specialist Cover Contract

**Files:**
- Create: `tests/tools/satellite-rf-covers.test.js`
- Modify: `data/tool-categories.js`

**Interfaces:**
- Consumes: `getToolCategoryItems(slug)` from `data/tool-categories.js`.
- Produces: a catalog contract requiring each Satellite/RF item to expose a unique `coverImage` path that exists on disk.

- [ ] **Step 1: Write the failing test**

Create a Node test that loads both specialist categories, asserts exactly ten items, asserts every `coverImage` begins with `/media/tools/tool-`, asserts every path is unique, and resolves each path beneath `public/` with `existsSync`.

- [ ] **Step 2: Run the focused test and verify red**

Run: `node --test tests/tools/satellite-rf-covers.test.js`

Expected: FAIL because the specialist items currently have no `coverImage` property.

- [ ] **Step 3: Add the explicit cover map**

Add an immutable map in `data/tool-categories.js` with these exact filenames:

```js
const specialistCoverImages = Object.freeze({
  "satellite-orbit": "/media/tools/tool-satellite-orbit-v1.png",
  "satellite-look-angles": "/media/tools/tool-satellite-look-angles-v1.png",
  "satellite-power-lifetime": "/media/tools/tool-satellite-power-lifetime-v1.png",
  "satellite-doppler-delay": "/media/tools/tool-satellite-doppler-delay-v1.png",
  "satellite-link-budget": "/media/tools/tool-satellite-link-budget-v1.png",
  "rf-frequency-bands": "/media/tools/tool-rf-frequency-bands-v1.png",
  "rf-antenna": "/media/tools/tool-rf-antenna-v1.png",
  "rf-rf-path": "/media/tools/tool-rf-path-v1.png",
  "rf-noise-gt": "/media/tools/tool-rf-noise-gt-v1.png",
  "rf-multiple-access": "/media/tools/tool-rf-multiple-access-v1.png"
});
```

When adapting specialist tools, set `coverImage` from the map using the item ID.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/tools/satellite-rf-covers.test.js`

Expected: the property assertions pass and the existence assertions remain red until Task 2 creates the files.

### Task 2: Generate Ten Cover Sources

**Files:**
- Create: `public/media/tools/tool-satellite-orbit-v1.png`
- Create: `public/media/tools/tool-satellite-look-angles-v1.png`
- Create: `public/media/tools/tool-satellite-power-lifetime-v1.png`
- Create: `public/media/tools/tool-satellite-doppler-delay-v1.png`
- Create: `public/media/tools/tool-satellite-link-budget-v1.png`
- Create: `public/media/tools/tool-rf-frequency-bands-v1.png`
- Create: `public/media/tools/tool-rf-antenna-v1.png`
- Create: `public/media/tools/tool-rf-path-v1.png`
- Create: `public/media/tools/tool-rf-noise-gt-v1.png`
- Create: `public/media/tools/tool-rf-multiple-access-v1.png`

**Interfaces:**
- Consumes: the asset names defined by Task 1 and the visual system in the approved design spec.
- Produces: ten decodable 16:9 PNG sources for the image pipeline.

- [ ] **Step 1: Generate each asset independently**

Use the built-in image generator once per cover. Apply this shared prompt foundation to every generation:

```text
Use case: scientific-educational
Asset type: engineering calculator cover image for a website tool card
Style: premium technical product visualization, precise engineered forms, dark charcoal instrument environment, warm gold primary signals and focal light, restrained teal secondary measurements, crisp studio lighting, subtle flat grid structure, high contrast, clean central silhouette
Composition: 16:9 landscape, readable at thumbnail size, subject inside generous crop-safe margins
Constraints: physically coherent engineering relationships; no text, letters, numbers, formulas, logos, badges, watermarks, people, flags, pseudo-text, decorative sci-fi HUD clutter, gradients, or space-battle imagery
```

Append the route-specific subject from the approved design table to each prompt.

- [ ] **Step 2: Inspect every output**

Reject and regenerate any cover with embedded text, incorrect engineering geometry, duplicated composition, weak thumbnail readability, or a palette outside charcoal/gold/teal.

- [ ] **Step 3: Place the approved outputs in the repository**

Copy each selected output from the generated-image location to its exact `public/media/tools/` filename without overwriting unrelated assets.

- [ ] **Step 4: Run the focused contract**

Run: `node --test tests/tools/satellite-rf-covers.test.js`

Expected: PASS.

### Task 3: Generate Responsive Variants and Verify Catalog Rendering

**Files:**
- Modify (generated): `data/public-image-manifest.generated.ts`
- Create (generated): `public/media/generated/responsive/media/tools/tool-satellite-*/**`
- Create (generated): `public/media/generated/responsive/media/tools/tool-rf-*/**`
- Modify: `tests/tools/asl-design-contract.test.js`

**Interfaces:**
- Consumes: ten PNG sources and `coverImage` catalog fields.
- Produces: optimized AVIF/WebP variants discoverable through `PublicImage`.

- [ ] **Step 1: Extend the design contract**

Add an assertion that both `getToolCategoryItems("satellite")` and `getToolCategoryItems("rf-engineering")` expose a cover for every item and that `GroupedToolsIndex.tsx` renders `item.coverImage` through `PublicImage`.

- [ ] **Step 2: Run the affected tests and confirm the assertions exercise the new data**

Run: `node --test tests/tools/satellite-rf-covers.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS after Task 2.

- [ ] **Step 3: Generate responsive image variants**

Run: `npm run prepare:images`

Expected: all ten sources appear in the generated manifest with AVIF and WebP variants and no missing or oversized images.

- [ ] **Step 4: Verify the image pipeline**

Run: `npm run check:images`

Expected: `missing` and `oversized` are empty arrays.

### Task 4: Visual and Production Verification

**Files:**
- Modify only if verification exposes a defect in the files above.

**Interfaces:**
- Consumes: the completed catalog and optimized image assets.
- Produces: release evidence for English/Arabic rendering and production safety.

- [ ] **Step 1: Run focused catalog and design tests**

Run: `node --test tests/tools/satellite-rf-covers.test.js tests/tools/asl-design-contract.test.js tests/tools/arabic-localization.test.js`

Expected: PASS.

- [ ] **Step 2: Run SEO tests**

Run: `npx vitest run --config vitest.seo.config.ts`

Expected: PASS.

- [ ] **Step 3: Run TypeScript**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 4: Build the production export**

Run: `npm run build`

Expected: all static pages build successfully.

- [ ] **Step 5: Inspect category pages at representative widths**

Open `/tools/category/satellite/`, `/tools/category/rf-engineering/`, `/ar/tools/category/satellite/`, and `/ar/tools/category/rf-engineering/` at 390px and 1440px. Confirm all ten covers load, remain distinct, crop safely, and preserve the existing card layout.

- [ ] **Step 6: Commit the implementation**

Stage only the ten sources, generated responsive variants/manifest, catalog change, and tests. Commit with:

```text
feat: add satellite and RF tool cover artwork
```
