# Responsive Asset Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver responsive, art-directed image families for every raster asset used by the site, including simplified mobile covers for every raster-backed tool.

**Architecture:** A human-authored asset registry defines roles and optional mobile/wide sources. The existing Sharp pipeline discovers all referenced raster families, generates role-specific AVIF/WebP widths, enforces budgets, and emits a typed manifest plus audit report. `PublicImage` consumes that manifest and uses `<picture>` media sources so the browser downloads only the correct mobile, default, or wide asset.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node.js, Sharp, Node test runner, Vitest SEO suite, GPT Image generation.

## Global Constraints

- Preserve every unrelated dirty-worktree change; stage only files named by the current task.
- Do not replace authentic photographs or real UI screenshots with generated imagery.
- Do not upscale a variant past its source width.
- Generate AVIF and WebP variants with the original file as fallback.
- Tool mobile covers contain no generated text; semantic labels remain HTML.
- Mobile tool covers show one input, one transformation, and one output with the primary object occupying roughly 55–70% of the frame.
- Use ASL charcoal, blue/cyan, and gold visual language for generated tool artwork.
- Keep stable source URLs unless an art-directed source is genuinely new.
- Budgets: tool/tutorial 120 KB, portrait 100 KB, project/UI 180 KB, evidence 260 KB, wide hero 320 KB, social 300 KB per generated variant.
- Direct `<img>` is allowed only inside `PublicImage` or with an explicit audit exemption.
- Tool interaction redesign and Gradify workflow restructuring remain out of scope.

---

### Task 1: Asset registry and complete inventory report

**Files:**
- Create: `data/public-image-registry.js`
- Create: `scripts/public-image-audit.mjs`
- Create: `tests/tools/public-image-audit.test.js`
- Modify: `data/public-image-sources.json`

**Interfaces:**
- Produces: `publicImageRegistry: Record<string, { role, sizesPreset, mobileSrc?, wideSrc?, focalPoint?, decorative? }>`
- Produces: `auditPublicImages({ rootDir }): Promise<{ referenced, unreferenced, directImgUsages, oversizedSources, roleCounts }>`
- Consumes: public raster files plus source references in `app`, `components`, `content`, `data`, and `lib`.

- [ ] **Step 1: Write the failing audit tests**

```js
test("audit accounts for every referenced raster and direct img usage", async () => {
  const report = await auditPublicImages({ rootDir: process.cwd() });
  assert.equal(report.referenced.filter(item => !item.registered).length, 0);
  assert.deepEqual(report.directImgUsages.filter(item => item.file !== "components/PublicImage.tsx"), []);
});

test("all raster-backed tool covers declare a mobile source", async () => {
  const report = await auditPublicImages({ rootDir: process.cwd() });
  const tools = report.referenced.filter(item => item.role === "tool-cover");
  assert.ok(tools.length >= 20);
  assert.deepEqual(tools.filter(item => !item.mobileSrc), []);
});
```

- [ ] **Step 2: Run the audit test and confirm failure**

Run: `node --test tests/tools/public-image-audit.test.js`  
Expected: FAIL because the registry and audit module do not exist.

- [ ] **Step 3: Add role and size-preset registry contracts**

```js
export const IMAGE_ROLES = Object.freeze([
  "tool-cover", "project-cover", "gallery-evidence", "portrait",
  "tutorial-cover", "social", "interface-screenshot", "decorative"
]);

export const publicImageRegistry = Object.freeze({
  "/media/tools/tool-satellite-orbit-v1.png": Object.freeze({
    role: "tool-cover",
    sizesPreset: "tool-card",
    mobileSrc: "/media/tools/mobile/tool-satellite-orbit-mobile-v1.png"
  })
});
```

Populate the registry from every actual reference and list indirect data-driven sources in `data/public-image-sources.json`. Classify vectors separately in the report but do not send SVG files through Sharp.

- [ ] **Step 4: Implement the audit report**

The report must normalize slashes, exclude `/media/generated/responsive/`, decode every registered raster with Sharp, record source bytes/dimensions, and list unreferenced files without deleting them. Print JSON when run directly:

```js
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  console.log(JSON.stringify(await auditPublicImages({ rootDir: process.cwd() }), null, 2));
}
```

- [ ] **Step 5: Run and review the full inventory**

Run: `node scripts/public-image-audit.mjs > tmp/public-image-audit.json`  
Expected: every referenced raster is registered; unreferenced historical files are reported, not removed.

- [ ] **Step 6: Run tests and commit**

Run: `node --test tests/tools/public-image-audit.test.js`  
Expected: PASS.

```bash
git add data/public-image-registry.js data/public-image-sources.json scripts/public-image-audit.mjs tests/tools/public-image-audit.test.js
git commit -m "feat: inventory responsive image assets"
```

### Task 2: Role-aware responsive generation pipeline

**Files:**
- Modify: `scripts/public-image-pipeline.mjs`
- Modify: `tests/tools/public-image-pipeline.test.js`
- Modify: `data/public-image-manifest.generated.ts` (generated)
- Create: `data/public-image-audit.generated.json` (generated)

**Interfaces:**
- Consumes: `publicImageRegistry` and `auditPublicImages` from Task 1.
- Produces: `preparePublicImages({ rootDir, write }): Promise<ImagePipelineReport>`.
- Produces manifest entries shaped as:

```ts
type PublicImageFamily = {
  source: string;
  width: number;
  height: number;
  role: ImageRole;
  sizesPreset: string;
  avif: PublicImageVariant[];
  webp: PublicImageVariant[];
  mobile?: PublicImageAsset;
  wide?: PublicImageAsset;
};
```

- [ ] **Step 1: Extend fixture tests for role widths, budgets, and art direction**

```js
assert.deepEqual(toolAsset.webp.map(item => item.width), [240, 320, 480, 640, 960, 1280]);
assert.equal(toolAsset.mobile.source, "/media/tools/mobile/tool-mobile.png");
assert.ok(toolAsset.mobile.avif.every(item => item.bytes <= 120 * 1024));
assert.ok(report.assets.every(asset => asset.avif.every(v => v.width <= asset.width)));
assert.deepEqual(report.unregistered, []);
```

- [ ] **Step 2: Run the pipeline tests and confirm failure**

Run: `node --test tests/tools/public-image-pipeline.test.js`  
Expected: FAIL because the current manifest is flat and uses one global width list.

- [ ] **Step 3: Add exact role policies**

```js
export const ROLE_POLICIES = Object.freeze({
  "tool-cover": { widths: [240, 320, 480, 640, 960, 1280, 1600], budget: 120 * 1024 },
  "tutorial-cover": { widths: [240, 320, 480, 640, 960, 1280], budget: 120 * 1024 },
  portrait: { widths: [96, 160, 240, 320, 480, 640], budget: 100 * 1024 },
  "project-cover": { widths: [320, 480, 640, 768, 960, 1280, 1600, 1920], budget: 180 * 1024 },
  "interface-screenshot": { widths: [320, 480, 640, 768, 960, 1280, 1600], budget: 180 * 1024 },
  "gallery-evidence": { widths: [320, 480, 640, 768, 960, 1280, 1600, 1920, 2560], budget: 260 * 1024 },
  social: { widths: [1200], budget: 300 * 1024 },
  decorative: { widths: [240, 320, 480, 640, 960, 1280], budget: 120 * 1024 }
});
```

- [ ] **Step 4: Generate default, mobile, and wide family variants**

Refactor encoding into `prepareAsset(source, policy, rootDir, write)`. Filter each role’s width list with `width <= metadata.width`, append the exact intrinsic width, deduplicate, and sort. Reuse unchanged variants only when the output mtime is newer than its source.

- [ ] **Step 5: Emit typed manifest and JSON audit**

The audit file records totals by role, original bytes, generated bytes, missing sources, oversized variants, unregistered references, and direct `<img>` bypasses. `--check` exits nonzero for any of those four error lists.

- [ ] **Step 6: Run tests and generate repository outputs**

Run: `node --test tests/tools/public-image-pipeline.test.js`  
Run: `npm run prepare:images`  
Run: `npm run check:images`  
Expected: all pass, no missing/unregistered/oversized/direct-bypass errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/public-image-pipeline.mjs tests/tools/public-image-pipeline.test.js data/public-image-manifest.generated.ts data/public-image-audit.generated.json
git commit -m "feat: generate role-aware responsive image families"
```

### Task 3: Art-directed `PublicImage` renderer

**Files:**
- Modify: `components/PublicImage.tsx`
- Create: `data/public-image-sizes.ts`
- Modify: `tests/tools/public-image-component.test.js`

**Interfaces:**
- Produces: `PublicImage({ src, mobileSrc?, wideSrc?, sizes?, sizesPreset?, ...imgProps })`.
- Produces: `publicImageSizes` presets: `tool-card`, `project-card`, `feature`, `gallery-thumb`, `article`, `portrait`.
- Consumes: Task 2 manifest families.

- [ ] **Step 1: Write renderer contract tests**

```js
assert.match(source, /media="\(max-width: 639px\)"/);
assert.match(source, /media="\(min-width: 1600px\)"/);
assert.match(source, /asset\.mobile\?\.avif/);
assert.match(source, /asset\.wide\?\.webp/);
assert.match(source, /publicImageSizes\[sizesPreset\]/);
assert.match(source, /width=\{asset\.width\}/);
assert.match(source, /height=\{asset\.height\}/);
```

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/tools/public-image-component.test.js`  
Expected: FAIL because media art direction and presets do not exist.

- [ ] **Step 3: Add named size presets**

```ts
export const publicImageSizes = {
  "tool-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 320px",
  "project-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 33vw",
  feature: "(max-width: 767px) 100vw, (max-width: 1599px) 70vw, 1280px",
  "gallery-thumb": "(max-width: 639px) 44vw, 240px",
  article: "(max-width: 767px) 100vw, 820px",
  portrait: "(max-width: 639px) 180px, 260px"
} as const;
```

- [ ] **Step 4: Render media sources in download-safe order**

Order sources as wide AVIF/WebP, mobile AVIF/WebP, then default AVIF/WebP. Use `media="(min-width: 1600px)"` for wide and `media="(max-width: 639px)"` for mobile. The fallback `<img>` uses the default source and intrinsic dimensions.

- [ ] **Step 5: Run tests and commit**

Run: `node --test tests/tools/public-image-component.test.js`  
Expected: PASS.

```bash
git add components/PublicImage.tsx data/public-image-sizes.ts tests/tools/public-image-component.test.js
git commit -m "feat: add art-directed responsive image renderer"
```

### Task 4: Migrate every referenced raster call site

**Files:**
- Modify: `components/HomePageView.tsx`
- Modify: `components/WorkCollection.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `components/WorldGallery.tsx`
- Modify: `components/MobileScreenGallery.tsx`
- Modify: `components/CommunityRecord.tsx`
- Modify: `components/ProfilePortrait.tsx`
- Modify: `components/WorkResearchAndTeaching.tsx`
- Modify: `components/tools/UnifiedToolsIndex.tsx`
- Modify: `components/tools/GroupedToolsIndex.tsx`
- Modify: `components/tools/CalculatorThumbnail.js`
- Modify other audited raster call sites listed by Task 1.
- Modify: `tests/tools/public-image-component.test.js`

**Interfaces:**
- Consumes `sizesPreset` and registry-backed art direction from Tasks 1–3.
- Produces no new API; closes all delivery bypasses.

- [ ] **Step 1: Strengthen the bypass test**

```js
for (const usage of await findDirectImageUsages()) {
  assert.equal(usage.file, "components/PublicImage.tsx", `${usage.file} bypasses PublicImage`);
}
assert.deepEqual((await auditPublicImages({ rootDir })).referenced.filter(x => !x.registered), []);
```

- [ ] **Step 2: Run and confirm any remaining failures**

Run: `node --test tests/tools/public-image-component.test.js tests/tools/public-image-audit.test.js`.

- [ ] **Step 3: Replace ad-hoc `sizes` strings with accurate presets**

Examples:

```tsx
<PublicImage src={tool.coverImage} alt="" sizesPreset="tool-card" />
<PublicImage src={project.image} alt={previewAlt} sizesPreset="project-card" />
<PublicImage src={image.src} alt={image.alt} sizesPreset="gallery-thumb" />
```

Keep exact custom sizes only where the named presets are materially inaccurate. Pass `loading="eager" fetchPriority="high"` only for existing likely-LCP portraits or hero images.

- [ ] **Step 4: Run focused tests and commit**

Run: `node --test tests/tools/public-image-component.test.js tests/tools/public-image-audit.test.js tests/tools/tutorial-card-image-ratio.test.js`  
Expected: PASS.

```bash
git add components app tests/tools/public-image-component.test.js
git commit -m "perf: route site imagery through responsive renderer"
```

### Task 5: Generate simplified mobile covers for every raster-backed tool

**Files:**
- Create: `public/media/tools/mobile/*.png`
- Create generated variants under: `public/media/generated/responsive/media/tools/mobile/*`
- Modify: `data/public-image-registry.js`
- Create: `data/tool-mobile-image-prompts.js`
- Create: `tests/tools/tool-mobile-images.test.js`

**Interfaces:**
- Produces one `mobileSrc` for every registry entry with `role: "tool-cover"`.
- Produces prompt records `{ source, prompt, concept, generatedAt }` for reproducibility.
- Consumes `image_gen` for original art and Sharp for exact normalization.

- [ ] **Step 1: Write completeness and geometry tests**

```js
test("every raster tool cover has a normalized mobile composition", async () => {
  for (const [source, config] of Object.entries(publicImageRegistry)) {
    if (config.role !== "tool-cover") continue;
    assert.ok(config.mobileSrc?.includes("/media/tools/mobile/"));
    const metadata = await sharp(path.join("public", config.mobileSrc)).metadata();
    assert.equal(metadata.width, 960);
    assert.equal(metadata.height, 960);
    assert.ok((await stat(path.join("public", config.mobileSrc))).size <= 500 * 1024);
  }
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/tools/tool-mobile-images.test.js`  
Expected: FAIL listing every missing mobile source.

- [ ] **Step 3: Generate tool families in bounded batches**

Use one image-generation call per cover. Each prompt must name the specific engineering concept and end with:

```text
Simple educational visual for a non-technical viewer, one input on the left,
one central transformation, one output on the right, primary objects fill 60%
of a square frame, charcoal background, muted blue and cyan, warm gold accent,
clean soft-3D ASL instrument style, no text, no letters, no numbers, no formulas,
no logos, no watermark, no decorative machinery, safe centered crop, 1:1.
```

Generate all raster-backed tool covers, grouped as workbenches, circuits, cryptography/encoding, satellite, and RF. Preserve real UI screenshots and photography.

- [ ] **Step 4: Inspect every generated image before integration**

Use `view_image` for each batch. Reject imagery with unreadable clutter, accidental text, incorrect directionality, misleading circuit topology, or weak small-size silhouette. Regenerate rejected files rather than patching them manually.

- [ ] **Step 5: Normalize and register accepted sources**

Normalize each accepted source to exact 960×960 PNG with Sharp, descriptive kebab-case filenames, palette compression when visually safe, and source size under 500 KB. Record the exact prompt and generation date in `data/tool-mobile-image-prompts.js`.

- [ ] **Step 6: Generate responsive encodings and run tests**

Run: `npm run prepare:images`  
Run: `node --test tests/tools/tool-mobile-images.test.js tests/tools/public-image-pipeline.test.js`  
Expected: all mobile originals and their AVIF/WebP variants exist and remain within budget.

- [ ] **Step 7: Commit**

```bash
git add public/media/tools/mobile public/media/generated/responsive/media/tools/mobile data/public-image-registry.js data/tool-mobile-image-prompts.js data/public-image-manifest.generated.ts data/public-image-audit.generated.json tests/tools/tool-mobile-images.test.js
git commit -m "feat: add simplified mobile artwork for every tool cover"
```

### Task 6: Validate breakpoint selection and visual quality

**Files:**
- Create: `tests/tools/public-image-responsive-browser.test.js`
- Create: `tests/fixtures/responsive-image-pages.js`
- Modify: CSS only when inspection finds a concrete crop or containment defect.

**Interfaces:**
- Consumes the built application and all image families.
- Produces browser assertions for selected source URLs, intrinsic sizing, overflow, and layout stability.

- [ ] **Step 1: Write browser assertions for representative routes**

Test `/`, `/tools/`, `/tools/category/text-encoding/`, `/tools/category/satellite/`, `/tools/hash-generator/`, `/work/`, `/work/embedded-iot/aqua-sync/`, and `/about/` at widths 390, 768, 1366, 1920, and 2560.

```js
const currentSrc = await image.getAttribute("currentSrc");
assert.match(currentSrc, width <= 639 ? /\/mobile\// : /\/responsive\//);
assert.equal(await page.locator("body").evaluate(el => el.scrollWidth <= innerWidth), true);
assert.equal(await image.evaluate(el => el.naturalWidth > 0 && el.naturalHeight > 0), true);
```

- [ ] **Step 2: Run and confirm the test detects wrong selection before final wiring**

Run: `node --test tests/tools/public-image-responsive-browser.test.js`.

- [ ] **Step 3: Correct registry mappings, source ordering, focal positions, or containment styles**

Do not change unrelated page layouts. Fix only demonstrated image selection, crop, overflow, or aspect-ratio issues.

- [ ] **Step 4: Capture and inspect representative screenshots**

Inspect at least one phone and one desktop screenshot for each listed route. Confirm mobile concepts remain understandable at card size and desktop assets retain detail without pixelation.

- [ ] **Step 5: Run responsive tests and commit**

Run: `node --test tests/tools/public-image-responsive-browser.test.js`  
Expected: PASS at every route and viewport.

```bash
git add tests/tools/public-image-responsive-browser.test.js tests/fixtures/responsive-image-pages.js app components data
git commit -m "test: verify responsive asset selection across viewports"
```

### Task 7: Production verification and release

**Files:**
- Modify generated build artifacts only through the existing build/deploy process.

**Interfaces:**
- Consumes all earlier tasks.
- Produces verified source commit on `source` and static deployment on `main` only after comparison with the recorded baseline.

- [ ] **Step 1: Run focused asset verification**

Run:

```bash
node --test tests/tools/public-image-audit.test.js tests/tools/public-image-pipeline.test.js tests/tools/public-image-component.test.js tests/tools/tool-mobile-images.test.js tests/tools/public-image-responsive-browser.test.js
npm run check:images
npm run validate:content
```

Expected: all pass; zero missing, oversized, unregistered, undecodable, or bypassed assets.

- [ ] **Step 2: Run SEO and production build**

Run:

```bash
npx vitest run --config vitest.seo.config.ts
npm run build
```

Expected: 27 or more SEO tests pass; the static export completes for every route.

- [ ] **Step 3: Compare the full regression suite with the recorded baseline**

Run: `npm test`  
Expected baseline: 702 total, 698 pass, 3 known failures, 1 skip. Any additional failure blocks release. The known failures are the resistor diagram source-order pair and Model Mission startup test.

- [ ] **Step 4: Record payload improvement**

Compare the current public build and new build for the Tools hub, a tool category, one tool page, Work, and About. Record selected image URL and transferred image bytes at phone and desktop widths in the release notes or final handoff.

- [ ] **Step 5: Push source and publish static output**

Push the reviewed source HEAD to `origin/source`. Create a clean deployment worktree from `origin/main`, copy the verified `out/` export while preserving `.git`, verify `CNAME` and `.nojekyll`, commit, and push that deployment commit to `origin/main`.

- [ ] **Step 6: Verify the public site**

Request the public Tools, Work, About, and representative tool URLs with cache-busting query strings. Confirm HTTP 200, responsive `<picture>` markup, live mobile search, mobile asset selection, conference image delivery, canonical metadata, and image URLs.

- [ ] **Step 7: Report truthfully**

Report source and deployment commit hashes, generated asset counts, size-budget status, build/SEO results, responsive browser results, payload comparison, and the exact unchanged baseline failures if they remain.
