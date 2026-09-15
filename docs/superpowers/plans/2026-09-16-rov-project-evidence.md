# ROV Project Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real prototype and SolidWorks evidence plus the related Q1 paper to the Wireless ROV project, and remove AgriBot's inaccurate original-photo claim.

**Architecture:** Extend the existing project content model with one optional gallery heading, then configure only the Wireless ROV entry to use it. Keep AgriBot's UI gallery intact while removing only the inaccurate hardware gallery and note. Optimize the two supplied PNG files into project-scoped WebP assets.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, static portfolio data, WebP media assets.

## Global Constraints

- The real ROV prototype photograph is the primary project cover.
- The SolidWorks render is labeled as a mechanical design, not as a prototype photograph.
- The Nature article is described as related Q1 research.
- AgriBot keeps its award link and mobile UI gallery.
- Unrelated working-tree changes must remain untouched.

---

### Task 1: Lock the content contract with a failing test

**Files:**
- Create: `tests/tools/rov-project-evidence.test.js`

**Interfaces:**
- Consumes: `data/portfolio.ts`, `types/portfolio.ts`, and `components/WorkCollection.tsx` as source contracts.
- Produces: assertions for the ROV assets, paper link, custom gallery label, and AgriBot cleanup.

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const portfolio = fs.readFileSync("data/portfolio.ts", "utf8");
const types = fs.readFileSync("types/portfolio.ts", "utf8");
const workCollection = fs.readFileSync("components/WorkCollection.tsx", "utf8");

test("Wireless ROV exposes real prototype, SolidWorks design, and related Q1 paper", () => {
  const rov = portfolio.slice(portfolio.indexOf('slug: "wireless-rov-control"'), portfolio.indexOf('slug: "multi-mcu-security-lock"'));
  assert.match(rov, /wireless-rov\/prototype\.webp/);
  assert.match(rov, /wireless-rov\/solidworks-design\.webp/);
  assert.match(rov, /galleryLabel: "View SolidWorks mechanical design"/);
  assert.match(rov, /s41598-025-23281-8/);
  assert.match(types, /galleryLabel\?: string/);
  assert.match(workCollection, /project\.galleryLabel/);
});

test("AgriBot no longer claims a hardware image is an original project photo", () => {
  const agribot = portfolio.slice(portfolio.indexOf('slug: "agribot-architecture"'), portfolio.indexOf('slug: "wireless-rov-control"'));
  assert.doesNotMatch(agribot, /Original build photos below/);
  assert.doesNotMatch(agribot, /gallery:/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/tools/rov-project-evidence.test.js`

Expected: FAIL because the ROV-specific assets, custom label, and paper link do not exist yet.

### Task 2: Add optimized ROV media

**Files:**
- Create: `public/media/portfolio/showcase/wireless-rov/prototype.webp`
- Create: `public/media/portfolio/showcase/wireless-rov/solidworks-design.webp`

**Interfaces:**
- Consumes: the two user-supplied PNG files.
- Produces: stable static asset paths referenced by `data/portfolio.ts`.

- [ ] **Step 1: Convert both source images to WebP**

Use the repository's available image tooling to resize only if necessary, preserve aspect ratio, strip metadata, and encode high-quality WebP output.

- [ ] **Step 2: Inspect both generated files**

Confirm the prototype remains photographic and the second image remains recognizably the supplied SolidWorks assembly.

### Task 3: Implement truthful project metadata and gallery labeling

**Files:**
- Modify: `types/portfolio.ts`
- Modify: `components/WorkCollection.tsx`
- Modify: `data/portfolio.ts`

**Interfaces:**
- Consumes: `Project.galleryLabel?: string`.
- Produces: the custom gallery heading and updated ROV/AgriBot project entries.

- [ ] **Step 1: Add the optional type field**

```ts
galleryLabel?: string;
```

- [ ] **Step 2: Render the optional label with the current fallback**

```tsx
<summary>{project.galleryLabel ?? `View original project images (${project.gallery.length})`}</summary>
```

- [ ] **Step 3: Update the Wireless ROV entry**

Use `prototype.webp` as `image`, add the SolidWorks render to `gallery`, set `galleryLabel` to `View SolidWorks mechanical design`, and add the Scientific Reports URL to `links`.

- [ ] **Step 4: Clean the AgriBot entry**

Remove only `imageNote` and `gallery`; preserve `links` and `uiGallery`.

- [ ] **Step 5: Run the focused test**

Run: `node --test tests/tools/rov-project-evidence.test.js`

Expected: PASS.

### Task 4: Verify rendering and prevent regression

**Files:**
- Modify if required by a demonstrated regression: `tests/tools/project-showcase.test.js`

**Interfaces:**
- Consumes: the completed content and media changes.
- Produces: verified static pages and a passing build.

- [ ] **Step 1: Run the complete Node test suite**

Run: `npm test`

Expected: all tests pass. If an existing test asserts the removed AgriBot gallery, update that test to assert the new truthful behavior and rerun it red-green.

- [ ] **Step 2: Build the production site**

Run: `npm run build`

Expected: exit code 0 with both project routes generated.

- [ ] **Step 3: Inspect both project pages**

Open `/work/embedded-iot/wireless-rov-control/` and `/work/embedded-iot/agribot-architecture/` locally. Verify the ROV cover, SolidWorks disclosure, research link, and the absence of AgriBot's original-project-image section at desktop and mobile widths.

- [ ] **Step 4: Review the final diff**

Confirm no unrelated content or local user changes are included.
