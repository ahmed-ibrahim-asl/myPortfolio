# Complete Tool Image Variations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 70 public tools distinct raster artwork and supply clearly differentiated mobile and desktop compositions for six resistor concepts.

**Architecture:** Extend the existing prompt catalog into a desktop/mobile pair catalog, generate versioned source assets, then let `PublicImage` and the existing responsive pipeline supply AVIF/WebP variants. Keep live calculator diagrams code-rendered so numeric state remains accurate.

**Tech Stack:** Next.js 16, React 19, Node test runner, Sharp, built-in image generation, AVIF/WebP responsive pipeline.

## Global Constraints

- Produce 36 new source images: 18 square mobile and 18 landscape desktop.
- Complete raster coverage for all 70 tools.
- Preserve existing interactive SVGs and dynamic resistor state.
- Use ASL near-black, cyan, blue, and restrained amber styling without logos, watermarks, or decorative clutter.
- Keep source images at or below 500 KB and generated variants inside the tool-cover budget.
- Do not stage unrelated working-tree changes.

---

### Task 1: Lock the 70-tool raster coverage contract

**Files:**
- Modify: `tests/tools/tool-mobile-images.test.js`
- Modify: `data/tool-image-variation-prompts.js`

**Interfaces:**
- Consumes: `calculators`, workbench catalog, Satellite/RF catalogs, and `calculatorVisuals`.
- Produces: `toolImageVariationPrompts`, keyed by tool slug, with `{ desktopSource, mobileSource, desktopPrompt, mobilePrompt }`.

- [ ] **Step 1: Write the failing coverage test**

Assert that the combined public tool catalog has 70 unique slugs, every slug has one prompt record, and every record declares both desktop and mobile sources.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/tools/tool-mobile-images.test.js`

Expected: FAIL because the 12 SVG-only/Gradify records and desktop variation prompts do not exist.

- [ ] **Step 3: Add the exact 18-concept prompt records**

Add records for Gradify; the 11 SVG-only design tools; and the six resistor concepts. Mobile prompts require a centered 1:1 novice metaphor. Desktop prompts require the same identity in 16:9 with one extra explanatory relationship.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/tools/tool-mobile-images.test.js`

Expected: all prompt and catalog assertions pass.

- [ ] **Step 5: Commit**

```powershell
git add -- data/tool-image-variation-prompts.js tests/tools/tool-mobile-images.test.js
git commit -m "test: require complete tool image variations"
```

### Task 2: Generate and normalize the 36 source images

**Files:**
- Create: `public/media/tools/variations/*-desktop-v1.png`
- Create: `public/media/tools/mobile/*-mobile-v2.png`

**Interfaces:**
- Consumes: the exact prompts exported by `data/tool-image-variation-prompts.js`.
- Produces: 18 landscape PNG sources at 1536×1024 or a normalized 1440×810 crop, plus 18 square PNG sources normalized to 960×960.

- [ ] **Step 1: Generate one asset per prompt with the built-in image generator**

Issue a separate generation request for every desktop and mobile prompt. Keep the two compositions conceptually consistent but independently framed.

- [ ] **Step 2: Copy generated outputs into versioned workspace paths**

Do not overwrite current v1 sources. Store mobile replacements as `-mobile-v2.png` and new landscape covers under `public/media/tools/variations/`.

- [ ] **Step 3: Normalize dimensions and source budgets**

Use Sharp to resize/crop mobile sources to 960×960 and desktop sources to 1440×810, preserving visual focus. Encode PNGs under 500 KB.

- [ ] **Step 4: Inspect a contact sheet**

Build one contact sheet with all 36 assets and reject any image with illegible generated text, wrong circuit topology, repeated composition, watermark, or weak thumbnail readability.

- [ ] **Step 5: Commit**

```powershell
git add -- public/media/tools/variations public/media/tools/mobile
git commit -m "feat: add complete tool image variation sources"
```

### Task 3: Register desktop/mobile art direction for every tool

**Files:**
- Modify: `data/calculator-visuals.js`
- Modify: `data/public-image-registry.js`
- Modify: relevant workbench and Satellite/RF cover records under `data/`
- Modify: `tests/tools/tool-mobile-images.test.js`

**Interfaces:**
- Consumes: versioned sources from Task 2.
- Produces: a raster `image` source for each catalog item and registry entries whose `mobileSrc` is the matching square composition.

- [ ] **Step 1: Extend the failing test to resolve all 70 sources**

For every tool slug, assert the desktop source exists, is raster, and resolves to the expected mobile source through `getPublicImageConfig()`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/tools/tool-mobile-images.test.js`

Expected: FAIL while catalogs still point to SVG-only visuals or the old resistor sources.

- [ ] **Step 3: Wire the 18 new desktop sources and explicit mobile overrides**

Retain SVG pairs as live in-tool diagrams, but set category/discovery covers to raster assets. Add explicit registry entries where the automatic `-mobile-v1` convention is insufficient for v2 assets.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/tools/tool-mobile-images.test.js tests/tools/public-image-component.test.js tests/tools/public-image-audit.test.js`

- [ ] **Step 5: Commit**

```powershell
git add -- data/calculator-visuals.js data/public-image-registry.js data tests/tools/tool-mobile-images.test.js
git commit -m "feat: complete raster art direction for every tool"
```

### Task 4: Produce responsive variants and verify delivery

**Files:**
- Modify: `data/public-image-manifest.generated.ts`
- Modify: `data/public-image-cache.generated.json`
- Modify: `data/public-image-audit.generated.json`
- Create: `public/media/generated/responsive/media/tools/variations/**`
- Create: `public/media/generated/responsive/media/tools/mobile/**`

**Interfaces:**
- Consumes: registered desktop/mobile source pairs.
- Produces: bounded AVIF and WebP `srcset` families used by `PublicImage`.

- [ ] **Step 1: Generate responsive families**

Run: `npm run prepare:images`

Expected: zero missing, oversized, unregistered, or direct-img bypass entries.

- [ ] **Step 2: Run focused image verification**

Run: `node --test tests/tools/public-image-audit.test.js tests/tools/public-image-pipeline.test.js tests/tools/public-image-component.test.js tests/tools/tool-mobile-images.test.js`

Expected: all image tests pass.

- [ ] **Step 3: Run repository verification**

Run: `npm test`

Run: `npx tsc --noEmit`

Run: `npm run build`

Expected: zero failures and a successful static export.

- [ ] **Step 4: Verify mobile and desktop in the browser**

At 390×844, confirm `currentSrc` selects `/media/tools/mobile/` and page width has no overflow. At 1440×900, confirm `currentSrc` selects `/media/tools/variations/` and page width has no overflow.

- [ ] **Step 5: Commit generated delivery assets**

```powershell
git add -- data/public-image-manifest.generated.ts data/public-image-cache.generated.json data/public-image-audit.generated.json public/media/generated/responsive/media/tools
git commit -m "perf: publish responsive variants for complete tool artwork"
```

### Task 5: Publish verified source and static site

**Files:**
- Source branch: `source`
- Static deployment branch: `main`

**Interfaces:**
- Consumes: verified source commit and clean `out/` export.
- Produces: public pages at `https://eng-asl.com/tools/`.

- [ ] **Step 1: Push the verified source commit**

Fast-forward `origin/source` only after confirming it is an ancestor of the feature head.

- [ ] **Step 2: Create a clean deployment worktree from `origin/main`**

Copy only the verified `out/` artifact, preserving `.nojekyll` and `CNAME` with `eng-asl.com`.

- [ ] **Step 3: Commit and push the static deployment**

Commit message: `deploy: publish complete tool image variations`.

- [ ] **Step 4: Verify the public site**

At 390px, confirm a newly added mobile image URL loads from the public domain. At desktop width, confirm its paired landscape source loads. Confirm no horizontal overflow.
