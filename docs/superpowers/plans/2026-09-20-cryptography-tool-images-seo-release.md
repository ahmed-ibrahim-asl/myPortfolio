# Cryptography Tool Images, SEO, and Public Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and release novice-friendly cryptography covers, a global tool finder, page-specific SEO images, and the supplied enhanced U-Net conference evidence.

**Architecture:** A small shared registry will own each tool's source-image path and descriptive alt text. Calculator cards, route metadata, and WebApplication JSON-LD will consume that registry, while the existing `PublicImage` pipeline creates budgeted AVIF/WebP variants. The verified Next.js export will be committed separately to the static `main` Pages branch.

**Tech Stack:** Next.js 16, React 19, JavaScript/TypeScript, Sharp, Node test runner, Vitest, built-in image generation, GitHub Pages.

## Global Constraints

- Cover seven routes only: Vigenère, Affine, Transposition, Playfair, Hill, Hash Generator, and AES Hex Calculator.
- Use simple graphite/gold educational transformations that distinguish encryption, rearrangement, and one-way hashing for nontechnical visitors.
- Use a landscape composition cropped to exactly 1600 × 900 pixels.
- Do not include embedded titles, labels, logos, watermarks, random code, or illegible glyphs.
- Preserve the existing SVG covers; do not delete them.
- Keep every generated AVIF/WebP cover variant within the existing 180 KB budget.
- Do not stage or publish unrelated dirty working-tree files.
- Do not call the repository-wide suite green while its recorded baseline failures remain.

---

### Task 1: Define the shared cryptography image contract

**Files:**
- Create: `data/cryptography-tool-images.js`
- Create: `tests/tools/cryptography-tool-images.test.js`
- Modify: `data/calculator-visuals.js`

**Interfaces:**
- Produces: `cryptographyToolImages`, an immutable record keyed by tool slug with `{ path: string, alt: string }` values.
- Produces: `getCryptographyToolImage(slug: string)`, returning the record entry or `null`.
- Consumed by: calculator thumbnails, route metadata, and structured data.

- [ ] **Step 1: Write the failing registry test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { cryptographyToolImages } from "../../data/cryptography-tool-images.js";
import { calculatorVisuals } from "../../data/calculator-visuals.js";

const slugs = [
  "vigenere-cipher", "affine-cipher", "transposition-cipher",
  "playfair-cipher", "hill-cipher", "hash-generator", "aes-hex-calculator"
];

test("new cryptography tools use generated raster covers", () => {
  assert.deepEqual(Object.keys(cryptographyToolImages), slugs);
  for (const slug of slugs) {
    const image = cryptographyToolImages[slug];
    assert.match(image.path, new RegExp(`${slug}-instrument-v2\\.png$`));
    assert.ok(image.alt.length >= 40);
    assert.equal(calculatorVisuals[slug].image, image.path);
    assert.equal(calculatorVisuals[slug].imageDark, undefined);
    assert.equal(calculatorVisuals[slug].imageLight, undefined);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/tools/cryptography-tool-images.test.js`

Expected: FAIL because `data/cryptography-tool-images.js` does not exist.

- [ ] **Step 3: Add the image registry and connect calculator visuals**

Create the seven exact image paths under `/media/tools/design/`, add accurate alt text, export the null-safe lookup, and replace the seven `imageDark`/`imageLight` pairs in `calculator-visuals.js` with `image: cryptographyToolImages[slug].path`.

- [ ] **Step 4: Run the registry test**

Run: `node --test tests/tools/cryptography-tool-images.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the contract**

```bash
git add data/cryptography-tool-images.js data/calculator-visuals.js tests/tools/cryptography-tool-images.test.js
git commit -m "feat: register cryptography tool artwork"
```

---

### Task 2: Generate and normalize the seven covers

**Files:**
- Create: `public/media/tools/design/vigenere-cipher-instrument-v2.png`
- Create: `public/media/tools/design/affine-cipher-instrument-v2.png`
- Create: `public/media/tools/design/transposition-cipher-instrument-v2.png`
- Create: `public/media/tools/design/playfair-cipher-instrument-v2.png`
- Create: `public/media/tools/design/hill-cipher-instrument-v2.png`
- Create: `public/media/tools/design/hash-generator-instrument-v2.png`
- Create: `public/media/tools/design/aes-hex-calculator-instrument-v2.png`
- Modify: `tests/tools/cryptography-tool-images.test.js`

**Interfaces:**
- Consumes: the exact paths in `cryptographyToolImages`.
- Produces: seven 1600 × 900 PNG source assets without text or watermarks.

- [ ] **Step 1: Extend the failing test with file and geometry checks**

```js
import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

for (const image of Object.values(cryptographyToolImages)) {
  const file = path.join(process.cwd(), "public", image.path.slice(1));
  await access(file);
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.height, 900);
  assert.equal(metadata.format, "png");
}
```

- [ ] **Step 2: Run the test and verify missing files fail**

Run: `node --test tests/tools/cryptography-tool-images.test.js`

Expected: FAIL with `ENOENT` for the first source PNG.

- [ ] **Step 3: Generate one image per approved concept**

Use one built-in image-generation call for each concept in the specification. Repeat the shared palette, material, no-text, no-logo, no-watermark, center-safe composition, and small-thumbnail readability constraints in every prompt.

- [ ] **Step 4: Inspect and normalize each selected output**

Visually inspect every generated result. Reject any result with visible text, a watermark, generic padlock imagery, or an inaccurate algorithm metaphor. Copy selected outputs into the seven exact workspace paths and use Sharp to cover-crop from center to 1600 × 900 pixels.

- [ ] **Step 5: Run source image tests**

Run: `node --test tests/tools/cryptography-tool-images.test.js`

Expected: PASS with seven PNG files at exactly 1600 × 900.

- [ ] **Step 6: Commit source artwork**

```bash
git add public/media/tools/design/*-instrument-v2.png tests/tools/cryptography-tool-images.test.js
git commit -m "feat: add generated cryptography tool covers"
```

---

### Task 3: Add page-specific social and structured-data images

**Files:**
- Modify: `app/tools/[slug]/page.js`
- Modify: `components/tools/ToolSearchHook.tsx`
- Create: `tests/seo/cryptography-tools-seo.test.tsx`

**Interfaces:**
- Consumes: `getCryptographyToolImage(slug)`.
- Produces: absolute per-route Open Graph and Twitter image URLs plus `WebApplication.image`.

- [ ] **Step 1: Write the failing metadata test**

For every slug, call `generateMetadata`, assert its canonical URL, assert a single Open Graph image and Twitter image equal to the absolute registry path, render `ToolSearchSchema`, and assert the same absolute URL appears in the WebApplication JSON-LD. Also assert every route appears in `sitemap()`.

- [ ] **Step 2: Run the SEO test and verify it fails**

Run: `npx vitest run --config vitest.seo.config.ts tests/seo/cryptography-tools-seo.test.tsx`

Expected: FAIL because route metadata and WebApplication schema still use no page-specific image.

- [ ] **Step 3: Implement route metadata images**

In `generateMetadata`, resolve the registry entry. For covered tools, add:

```js
const image = getCryptographyToolImage(slug);
const shareImage = image ? {
  url: absoluteUrl(image.path), width: 1600, height: 900, alt: image.alt
} : null;
```

Use `shareImage` in Open Graph and its URL in Twitter metadata. Preserve the generic `twitterImage` fallback for every other tool.

- [ ] **Step 4: Implement structured-data images**

In `ToolSearchSchema`, resolve the same registry entry and conditionally spread `image: absoluteUrl(image.path)` into the WebApplication object.

- [ ] **Step 5: Run the focused and complete SEO suites**

Run: `npx vitest run --config vitest.seo.config.ts tests/seo/cryptography-tools-seo.test.tsx`

Run: `npx vitest run --config vitest.seo.config.ts`

Expected: both PASS.

- [ ] **Step 6: Commit SEO integration**

```bash
git add app/tools/[slug]/page.js components/tools/ToolSearchHook.tsx tests/seo/cryptography-tools-seo.test.tsx
git commit -m "feat: add cryptography tool social images"
```

---

### Task 4: Produce responsive assets and verify the rendered cards

**Files:**
- Modify: `data/public-image-manifest.generated.ts`
- Create: generated files under `public/media/generated/responsive/media/tools/design/*-instrument-v2/`
- Modify: `tests/tools/cryptography-tool-images.test.js`

**Interfaces:**
- Consumes: seven registered source PNGs.
- Produces: width-specific AVIF/WebP variants used by `PublicImage`.

- [ ] **Step 1: Add manifest and budget assertions**

Import `publicImageManifest`, assert all seven source paths exist, assert each has AVIF and WebP variants, and assert each variant is at most `180 * 1024` bytes.

- [ ] **Step 2: Verify the new assertions fail before pipeline generation**

Run: `node --test tests/tools/cryptography-tool-images.test.js`

Expected: FAIL because the manifest has no entries for the new PNGs.

- [ ] **Step 3: Generate responsive assets**

Run: `npm run prepare:images`

Expected: no missing or oversized referenced images.

- [ ] **Step 4: Verify image contracts**

Run: `npm run check:images`

Run: `node --test tests/tools/cryptography-tool-images.test.js tests/tools/classical-tools-integration.test.js`

Expected: PASS.

- [ ] **Step 5: Inspect responsive UI**

Run the production server and capture `/tools/` plus representative Vigenère, Hash, and AES routes at 390 × 844 and 1440 × 1000 in dark and light themes. Confirm safe crops, readable hierarchy, no overflow, and consistent card treatment.

- [ ] **Step 6: Commit responsive outputs**

```bash
git add data/public-image-manifest.generated.ts public/media/generated/responsive/media/tools/design tests/tools/cryptography-tool-images.test.js
git commit -m "perf: optimize cryptography tool covers"
```

---

### Task 5: Verify the source release

**Files:**
- Modify only if a scoped verification exposes a defect.

**Interfaces:**
- Produces: fresh evidence that the source tree is releasable within the recorded baseline.

- [ ] **Step 1: Run content and SEO validation**

Run: `npm run validate:content`

Run: `npx vitest run --config vitest.seo.config.ts`

Expected: PASS.

- [ ] **Step 2: Run scoped tool tests**

Run: `node --test tests/tools/cryptography-tool-images.test.js tests/tools/classical-tools-integration.test.js tests/tools/classical-tools-browser.test.js tests/tools/asl-design-contract.test.js tests/tools/discoverability.test.js`

Expected: PASS.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: type-check and static export complete successfully.

- [ ] **Step 4: Run the repository-wide suite**

Run: `npm test`

Expected: no new failures compared with the recorded baseline of two resistor source-order failures and one Model Mission startup failure. Report the actual totals exactly.

- [ ] **Step 5: Check the scoped diff**

Run: `git diff --check` and `git status --short`. Confirm only known user-owned dirty files remain unstaged.

---

### Task 5A: Simplify the cryptography covers and add novice labels

**Files:**
- Replace: the seven `public/media/tools/design/*-instrument-v2.png` sources
- Modify: `data/calculator-visuals.js`
- Modify: `components/tools/CalculatorThumbnail.js`
- Modify: `app/asl-tools.css`
- Modify: `tests/tools/cryptography-tool-images.test.js`

**Interfaces:**
- Adds optional `conceptLabel` and `conceptHint` properties to visual contracts.
- Renders concise HTML overlay text; generated images remain text-free.

- [ ] Write failing assertions for the seven novice labels and three semantic families.
- [ ] Generate seven simplified one-transformation covers from the amended specification.
- [ ] Render the label and hint as accessible HTML over the lower image edge.
- [ ] Regenerate responsive variants, run image budgets, and inspect dark/light mobile/desktop screenshots.
- [ ] Commit with `feat: simplify cryptography tool discovery`.

---

### Task 5B: Add global search before tool categories

**Files:**
- Create: `components/tools/ToolsQuickSearch.tsx`
- Create: `components/tools/ToolsQuickSearch.module.css`
- Create: `data/tool-search-aliases.js`
- Modify: `app/tools/page.tsx`
- Modify: `lib/tool-search.js`
- Test: `tests/tools/tools-quick-search.test.js`
- Test: `tests/tools/tools-quick-search-browser.test.js`

**Interfaces:**
- Produces `ToolsQuickSearch({ items })` with six-result preview and show-all behavior.
- Extends `filterToolItems` to consume `searchTerms` in addition to existing searchable fields.

- [ ] Write failing data and source-contract tests for full-catalog uniqueness, aliases, ordering, and placement before `ToolsCategoryHub`.
- [ ] Add the shared search index with formal and novice terms.
- [ ] Implement the accessible search field, keyboard-safe linked results, show-all control, and helpful empty state.
- [ ] Add browser tests at 390 and 1440 pixels.
- [ ] Commit with `feat: add global tools quick search`.

---

### Task 5C: Add enhanced U-Net conference evidence

**Files:**
- Create: `public/media/portfolio/nrsc-2026-enhanced-unet-post-conference.jpg`
- Modify: `types/portfolio.ts`
- Modify: `data/publications.json`
- Modify: `components/WorkResearchAndTeaching.tsx`
- Modify: `app/game-theme.css`
- Test: `tests/tools/publication-conference-evidence.test.js`

**Interfaces:**
- Adds optional `conferenceEvidence` with `image`, `alt`, `caption`, and `href` to `Publication`.

- [ ] Write a failing contract test for the exact paper, image, neutral alt, supplied Facebook URL, and responsive rendering hook.
- [ ] Copy the supplied photograph into the versioned public path without changing its content.
- [ ] Add the evidence data and render a responsive figure with separate publication and conference-post actions.
- [ ] Run the image pipeline and inspect desktop/mobile layouts.
- [ ] Commit with `feat: document enhanced unet conference presentation`.

---

### Task 6: Publish source and the GitHub Pages artifact

**Files:**
- Source commits on `feature/image-performance-seo`, pushed to `origin/source` with an explicit refspec.
- Static export committed in a clean deployment worktree based on `origin/main`.

**Interfaces:**
- Consumes: verified source HEAD and `out/`.
- Produces: updated `origin/source`, updated public `origin/main`, and a live Pages deployment.

- [ ] **Step 1: Fetch and confirm remote heads**

Run: `git fetch origin`

Run: `git rev-parse HEAD origin/source origin/main`

Confirm `origin/source` is an ancestor of the verified source HEAD and the public deployment worktree starts from the latest `origin/main`.

- [ ] **Step 2: Push the verified source**

Run: `git push origin HEAD:source`

Expected: fast-forward update of `origin/source` only.

- [ ] **Step 3: Create a clean deployment worktree**

Create a managed worktree from `origin/main`. Copy the contents of the verified `out/` directory into that worktree while preserving `CNAME` and `.nojekyll`, remove only stale generated site files inside that validated deployment worktree, and never modify the source worktree's unrelated dirty files.

- [ ] **Step 4: Verify the static deployment tree**

Confirm the seven route directories contain `index.html`, every generated cover and responsive variant is present, `sitemap.xml` contains all seven canonical URLs, and the HTML contains the expected social image URLs.

- [ ] **Step 5: Commit and push the public artifact**

```bash
git add -A
git commit -m "Publish cryptography tool artwork and SEO"
git push origin HEAD:main
```

- [ ] **Step 6: Verify the public site**

Check the Pages deployment status and request representative public Vigenère, Hash, and AES URLs. Confirm HTTP success, the new image URLs, canonical tags, Open Graph tags, and updated visual cards.

- [ ] **Step 7: Report release identifiers**

Report the source commit, deployment commit, public URL, exact verification totals, and any unchanged baseline failures.
