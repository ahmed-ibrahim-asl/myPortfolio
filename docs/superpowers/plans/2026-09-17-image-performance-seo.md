# Image Performance and Search Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a faster image delivery pipeline, an AgriBot-style Wireless ROV cover, stronger personal and tool search signals, and a dedicated SEO treatment for Gradify's working GPA/CGPA calculator.

**Architecture:** A deterministic Node/Sharp preparation script discovers public raster references, generates responsive AVIF/WebP derivatives, and writes a typed manifest consumed by one reusable React image component. Existing metadata and JSON-LD helpers remain the canonical SEO layer, while Gradify section data supplies page-specific visible copy and schema so titles, H1s, FAQs, and structured data cannot drift.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, Node.js scripts, Sharp, Node test runner, Vitest, Puppeteer/Edge, GitHub Pages.

## Global Constraints

- Keep the public domain and every canonical URL on `https://eng-asl.com/`.
- Preserve the exact professional title `Embedded Systems & IoT R&D Engineer`.
- Do not overwrite original ROV evidence; add a versioned cover and retain the prototype and SolidWorks images.
- Homepage portrait largest delivered variant must be at most 100 KB.
- Featured project and tool cover largest delivered variant must be at most 180 KB.
- Gallery/evidence largest delivered variant must be at most 300 KB.
- No new public raster may exceed 500 KB without an explicit allowlist reason.
- Generated raster delivery uses AVIF first and WebP fallback; SVG remains SVG.
- Do not add hidden keyword blocks, doorway pages, unverified claims, or schema content that is not visible on the page.
- The Gradify calculator's numerical behavior must not change unless an existing correctness test proves a defect.
- Preserve static export, trailing-slash routes, mobile responsiveness, keyboard access, and reduced-motion behavior.

---

### Task 1: Deterministic responsive-image pipeline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/public-image-pipeline.mjs`
- Create: `data/public-image-manifest.generated.ts`
- Create: `components/PublicImage.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `components/WorkCollection.tsx`
- Modify: `components/CommunityRecord.tsx`
- Modify: `components/ProfilePortrait.tsx`
- Modify: `components/WorldGallery.tsx`
- Modify: `components/MobileScreenGallery.tsx`
- Modify: `components/tools/CalculatorThumbnail.js`
- Modify: `components/tools/ToolNavCard.tsx`
- Modify: `app/page.tsx`
- Create: `tests/tools/public-image-pipeline.test.js`

**Interfaces:**
- Produces: `preparePublicImages({ rootDir, write }): Promise<ImagePipelineReport>` from `scripts/public-image-pipeline.mjs`.
- Produces: `publicImageManifest: Record<string, PublicImageAsset>` where `PublicImageAsset` has `source`, `width`, `height`, `avif`, and `webp` variant arrays.
- Produces: `<PublicImage src alt sizes loading className />`, accepting the same public path strings already stored in portfolio/tool data.
- Consumes: literal and template-derived raster paths under `public/`, excluding `public/vendor/`, favicon/social metadata assets, videos, remote URLs, and explicitly documented original-download evidence.

- [ ] **Step 1: Add failing pipeline tests**

Create fixture tests that demand reference discovery, responsive width generation, manifest stability, and budget failures:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { preparePublicImages } from "../../scripts/public-image-pipeline.mjs";

test("public image preparation discovers references and writes bounded AVIF/WebP variants", async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), "asl-images-"));
  await mkdir(path.join(rootDir, "public/media"), { recursive: true });
  await mkdir(path.join(rootDir, "data"), { recursive: true });
  await sharp({ create: { width: 1800, height: 1200, channels: 3, background: "#777" } })
    .png().toFile(path.join(rootDir, "public/media/test.png"));
  await writeFile(path.join(rootDir, "data/images.ts"), 'export const image = "/media/test.png";');
  const report = await preparePublicImages({ rootDir, write: true });
  assert.deepEqual(report.missing, []);
  assert.equal(report.assets[0].source, "/media/test.png");
  assert.ok(report.assets[0].avif.every(item => item.bytes <= 300 * 1024));
  assert.ok(report.assets[0].webp.some(item => item.width === 1280));
  assert.match(await readFile(path.join(rootDir, "data/public-image-manifest.generated.ts"), "utf8"), /media\/test\.png/);
});
```

- [ ] **Step 2: Run the pipeline test and confirm RED**

Run: `node --test tests/tools/public-image-pipeline.test.js`

Expected: FAIL because `scripts/public-image-pipeline.mjs` does not exist.

- [ ] **Step 3: Install Sharp and add preparation scripts**

Run: `npm install --save-dev sharp`

Add these scripts:

```json
{
  "prepare:images": "node scripts/public-image-pipeline.mjs --write",
  "check:images": "node scripts/public-image-pipeline.mjs --check",
  "predev": "npm run prepare:gradify && npm run prepare:images",
  "prebuild": "npm run prepare:gradify && npm run prepare:images"
}
```

- [ ] **Step 4: Implement the image pipeline**

Implement these exported shapes and deterministic settings:

```js
export const RESPONSIVE_WIDTHS = [320, 640, 960, 1280, 1600];
export const BUDGETS = { portrait: 100 * 1024, cover: 180 * 1024, evidence: 300 * 1024 };

export async function preparePublicImages({ rootDir = process.cwd(), write = false } = {}) {
  // Scan app/, components/, content/, data/, and lib/ for public raster references.
  // Expand template-literal families against real files under public/.
  // Decode each referenced local raster with sharp.metadata().
  // Generate bounded AVIF quality 55 and WebP quality 78 variants.
  // Write variants under public/media/generated/responsive/<mirrored-relative-path>/.
  // Write data/public-image-manifest.generated.ts in stable source-path order.
  // Return { assets, missing, oversized, orphanCandidates, allowlisted }.
}
```

Classification rules use the source path: `profile` → portrait, `cover` or `tools` or `calculators` → cover, everything else → evidence. A generated variant that exceeds its class budget is retried at quality decrements of 5 down to AVIF 40/WebP 60; if still oversized, the script records the exact source and variant in `oversized` and exits nonzero in `--check` mode.

- [ ] **Step 5: Implement the shared responsive image component**

```tsx
type PublicImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  alt: string;
  sizes: string;
};

export function PublicImage({ src, alt, sizes, loading = "lazy", ...props }: PublicImageProps) {
  const asset = publicImageManifest[src];
  if (!asset) return <img src={src} alt={alt} sizes={sizes} loading={loading} {...props} />;
  const srcSet = (items: typeof asset.webp) => items.map(item => `${item.src} ${item.width}w`).join(", ");
  return <picture>
    <source type="image/avif" srcSet={srcSet(asset.avif)} sizes={sizes} />
    <source type="image/webp" srcSet={srcSet(asset.webp)} sizes={sizes} />
    <img src={asset.webp.at(-1)!.src} width={asset.width} height={asset.height} alt={alt} sizes={sizes} loading={loading} {...props} />
  </picture>;
}
```

Use `PublicImage` on portfolio, homepage, profile, community, gallery, calculator-thumbnail, and tool-card raster paths. Preserve decorative empty alt text and use factual existing alt text elsewhere. Use eager loading only for the mobile identity portrait and current above-the-fold LCP image.

- [ ] **Step 6: Run focused image tests and production generation**

Run:

```powershell
node --test tests/tools/public-image-pipeline.test.js
npm run prepare:images
npm run check:images
```

Expected: PASS; manifest is stable on a second run; no referenced asset is missing; no generated variant exceeds its class budget.

- [ ] **Step 7: Remove proven orphaned historical derivatives**

Review only the report's `orphanCandidates`. Delete versioned tool/calculator covers superseded by a currently referenced version and keep original project evidence. Run `npm run prepare:images` again, then assert all source references still resolve. Do not delete any path named in portfolio galleries, content, CSS, metadata, or generated family expansion.

- [ ] **Step 8: Commit the image pipeline**

```powershell
git add package.json package-lock.json scripts/public-image-pipeline.mjs data/public-image-manifest.generated.ts components app tests/tools/public-image-pipeline.test.js public/media/generated/responsive public/media
git commit -m "perf: add responsive public image pipeline"
```

---

### Task 2: AgriBot-style Wireless ROV cover and evidence trail

**Files:**
- Create: `public/media/portfolio/showcase/wireless-rov/cover-asl-v1.png`
- Generate: `public/media/generated/responsive/media/portfolio/showcase/wireless-rov/cover-asl-v1/*.{avif,webp}`
- Modify: `data/portfolio.ts`
- Modify: `tests/tools/rov-project-evidence.test.js`
- Modify: `docs/assets/site-image-backlog.md`

**Interfaces:**
- Consumes: `/media/portfolio/showcase/wireless-rov/prototype.webp` as subject reference and `/media/portfolio/showcase/agribot/cover.webp` as style reference.
- Produces: `/media/portfolio/showcase/wireless-rov/cover-asl-v1.png` as the source cover passed through Task 1's manifest.
- Preserves: prototype and SolidWorks paths as factual evidence gallery entries.

- [ ] **Step 1: Strengthen the ROV evidence test before generating**

```js
assert.match(html, /wireless-rov\/cover-asl-v1\.png/);
assert.match(html, /AI-styled cover based on the Wireless ROV prototype/i);
assert.match(html, /wireless-rov\/prototype\.webp/);
assert.match(html, /wireless-rov\/solidworks-design\.webp/);
```

- [ ] **Step 2: Run the ROV test and confirm RED**

Run: `node --test tests/tools/rov-project-evidence.test.js`

Expected: FAIL because the new cover and evidence note are absent.

- [ ] **Step 3: Generate the cover with the built-in image generation tool**

Use both local references and this production prompt:

```text
Create a text-free 16:9 cinematic engineering product cover for the Wireless ROV Control System. Preserve the recognizable prototype architecture: stainless protective frame, central sealed white electronics enclosure with cable glands and antenna, black structural plate, blue buoyancy elements, paired front thrusters, fasteners and wiring. Present the complete vehicle at a three-quarter front angle on a low matte-charcoal studio plinth. Match the reference AgriBot cover's restrained portfolio language: dark charcoal environment, subtle deep-blue engineering grid wall, cool blue fill light, warm gold rim light from the right, realistic metal and polymer materials, premium but credible prototype photography, generous safe crop margins. Improve cable organization and finish only; do not invent extra vehicles, arms, dashboard screens, text, logos, watermarks, people, underwater scenery, or performance claims.
```

Save the output non-destructively as `cover-asl-v1.png` in the project path above.

- [ ] **Step 4: Connect cover and original evidence**

Update the ROV record:

```ts
image: asset("/media/portfolio/showcase/wireless-rov/cover-asl-v1.png"),
imageNote: "AI-styled cover based on the Wireless ROV prototype. Original prototype and SolidWorks mechanical design are available below.",
galleryLabel: "View original prototype and SolidWorks design",
gallery: [
  { src: asset("/media/portfolio/showcase/wireless-rov/prototype.webp"), alt: "Original Wireless ROV prototype with protective frame, sealed enclosure, buoyancy and thrusters" },
  { src: asset("/media/portfolio/showcase/wireless-rov/solidworks-design.webp"), alt: "SolidWorks mechanical design of the wireless remotely operated vehicle" }
]
```

- [ ] **Step 5: Generate derivatives and inspect crops**

Run `npm run prepare:images`, start the static preview, and capture the homepage at 390×844 and 1920×1080 plus the ROV project page at 1366×768. Reject the generated image if the vehicle is cropped, the enclosure/thrusters become implausible, or the card lacks readable subject separation.

- [ ] **Step 6: Run ROV tests and commit**

```powershell
node --test tests/tools/rov-project-evidence.test.js tests/tools/home-mobile-clear-service.test.js
git add public/media/portfolio/showcase/wireless-rov public/media/generated/responsive data/portfolio.ts tests/tools/rov-project-evidence.test.js docs/assets/site-image-backlog.md data/public-image-manifest.generated.ts
git commit -m "feat: add branded Wireless ROV project cover"
```

---

### Task 3: Personal identity and public-tool SEO contracts

**Files:**
- Modify: `lib/seo.ts`
- Modify: `types/seo.ts`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `components/tools/ToolSearchHook.tsx`
- Modify: `data/tool-search-hooks.ts`
- Modify: `app/sitemap.js`
- Create: `tests/tools/public-seo-contract.test.js`

**Interfaces:**
- Produces: `createToolJsonLd({ slug, pathname, name?, description? }): JsonLdData[]` in `lib/seo.ts`.
- Updates: `ToolSearchSchema({ slug, pathname? })`, defaulting to `/tools/${slug}/`.
- Preserves: `createPageMetadata` as the single canonical metadata constructor.

- [ ] **Step 1: Add failing rendered SEO contract tests**

Test exported HTML, not source regex alone:

```js
assert.equal(home.canonical, "https://eng-asl.com/");
assert.match(home.title, /Ahmed Ibrahim Asl/i);
assert.match(home.bodyText, /Ahmed Asl/);
assert.deepEqual(home.person.alternateName, ["Ahmed Asl", "أحمد إبراهيم عسل"]);
assert.equal(about.h1, "Ahmed Ibrahim Asl");
assert.equal(new Set(toolCanonicals).size, toolCanonicals.length);
assert.ok(toolSchemas.every(schema => schema["@type"] === "WebApplication"));
assert.ok(sitemapUrls.every(url => !url.includes("github.io") && !url.includes("myPortfolio")));
```

- [ ] **Step 2: Run the SEO test and confirm RED**

Run: `node --test tests/tools/public-seo-contract.test.js`

Expected: FAIL on the homepage title, Person aliases, About H1, and any route/schema mismatch exposed by the crawl.

- [ ] **Step 3: Strengthen Person/ProfilePage identity data**

Add to the canonical Person node:

```ts
alternateName: ["Ahmed Asl", "أحمد إبراهيم عسل"],
jobTitle: "Embedded Systems & IoT R&D Engineer",
mainEntityOfPage: absoluteUrl("/about/"),
```

Make the ProfilePage reference the same Person `@id`, include the current job title, and update `dateModified` to the actual implementation date `2026-09-17`.

- [ ] **Step 4: Align visible name content and metadata**

Set homepage metadata to `Ahmed Ibrahim Asl | Embedded Systems & IoT Engineer` and keep the natural short form `Ahmed Asl` in the visible opening identity. Change the About H1 to `Ahmed Ibrahim Asl` and begin its first paragraph with `Ahmed Asl is an Embedded Systems & IoT R&D Engineer…`. Preserve the approved mobile headline and service sentence.

- [ ] **Step 5: Make tool schema path-aware and validate all canonical routes**

```tsx
type ToolSearchHookProps = { slug: string; pathname?: string };

export function ToolSearchSchema({ slug, pathname = `/tools/${slug}/` }: ToolSearchHookProps) {
  const url = absoluteUrl(pathname);
  // WebApplication, visible FAQ, and breadcrumb entities all use this URL.
}
```

Generate schema for every existing tool without duplicating titles or FAQ content. Ensure sitemap output contains each canonical tool and category exactly once.

- [ ] **Step 6: Run SEO and existing design tests**

```powershell
npm run build
node --test tests/tools/public-seo-contract.test.js tests/tools/asl-design-contract.test.js tests/tools/security-mission-completion.test.js
```

Expected: PASS with one canonical Person, unique route canonicals, and valid tool schemas.

- [ ] **Step 7: Commit identity/tool SEO**

```powershell
git add lib/seo.ts types/seo.ts app/layout.tsx app/page.tsx app/about/page.tsx components/tools/ToolSearchHook.tsx data/tool-search-hooks.ts app/sitemap.js tests/tools/public-seo-contract.test.js
git commit -m "feat: strengthen identity and tool search signals"
```

---

### Task 4: Gradify GPA/CGPA search landing page

**Files:**
- Modify: `data/gradify-sections.ts`
- Modify: `app/tools/gradify/[section]/page.tsx`
- Modify: `components/tools/gradify/GradifyWorkspace.tsx`
- Create: `components/tools/gradify/GradifyCalculatorSeo.tsx`
- Modify: `components/tools/gradify/GradifyWorkspace.module.css`
- Create: `tests/tools/gradify-seo.test.js`

**Interfaces:**
- Extends each `gradifySections` entry with `seoTitle`, `metaDescription`, `h1`, and optional `searchContent`.
- Produces: `<GradifyCalculatorSeo />` containing visible explanation/FAQ plus matching `WebApplication`, `HowTo`, `FAQPage`, and `BreadcrumbList` JSON-LD.
- Consumes: existing calculator functions without altering calculation inputs or results.

- [ ] **Step 1: Add failing Gradify SEO tests**

```js
assert.equal(page.title, "GPA Calculator & CGPA Calculator | Gradify");
assert.equal(page.h1, "Free GPA & CGPA Calculator");
assert.match(page.description, /semester GPA.*cumulative GPA.*target/i);
assert.match(page.bodyText, /weighted grade points/i);
assert.equal(page.schema.WebApplication.url, "https://eng-asl.com/tools/gradify/calculator/");
assert.ok(page.schema.FAQPage.mainEntity.length >= 4);
assert.equal(page.visibleQuestions.length, page.schema.FAQPage.mainEntity.length);
assert.ok(page.links.includes("/tools/gradify/planner/"));
assert.ok(page.links.includes("/tools/gradify/guide/"));
```

- [ ] **Step 2: Run the Gradify SEO test and confirm RED**

Run: `node --test tests/tools/gradify-seo.test.js`

Expected: FAIL because the existing page is titled `GPA calculator | Gradify` and lacks the visible explanation/FAQ schema pair.

- [ ] **Step 3: Add page-specific Gradify SEO data**

For the calculator entry use:

```ts
{
  slug: "calculator",
  title: "GPA calculator",
  h1: "Free GPA & CGPA Calculator",
  seoTitle: "GPA Calculator & CGPA Calculator | Gradify",
  metaDescription: "Calculate semester GPA and cumulative GPA, include previous credit hours, and estimate the grades needed for a target GPA with university scales.",
  detail: "Calculate semester GPA, cumulative GPA, and the grades you need next using credit-hour weighting and your university scale."
}
```

Keep parent Gradify metadata focused on the complete planning suite so it does not duplicate the calculator query.

- [ ] **Step 4: Add visible explanation and matching schema**

Render after the calculator:

```tsx
const questions = [
  ["What is the difference between GPA and CGPA?", "Semester GPA covers the courses in one term. CGPA combines the grade points and credit hours from all included terms."],
  ["Does the calculator weight courses by credit hours?", "Yes. Each course contributes grade points multiplied by its credit hours, then the total is divided by the included hours."],
  ["Can I use a custom university grading scale?", "Yes. Choose the custom scale option and enter the grade labels and points published by your university."],
  ["Does Gradify replace my university record?", "No. Use the result as a planning estimate and verify repeats, improvements, exclusions, and official rules with your university."],
];
```

The visible formula is `GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)`. The schema's FAQ answers must come from the same `questions` array. `HowTo` steps describe choosing a university, adding course hours/grades, optionally adding previous CGPA/hours, and reading the result; those exact steps are visible beside the formula.

- [ ] **Step 5: Preserve interaction priority and accessibility**

Keep the calculator controls above the long explanation on both desktop and mobile. Use semantic sections/headings, do not insert a second H1, and preserve the existing university select label, status messages, keyboard operation, and result announcement behavior.

- [ ] **Step 6: Run Gradify functional and SEO tests**

```powershell
node --test tests/tools/gradify-seo.test.js tests/tools/gradify-controls-browser.test.js tests/tools/gradify-planning-browser.test.js
npm run test:gradify
```

Expected: all existing calculations and planning behavior remain green; rendered title/H1/content/schema match.

- [ ] **Step 7: Commit Gradify SEO**

```powershell
git add data/gradify-sections.ts app/tools/gradify/[section]/page.tsx components/tools/gradify tests/tools/gradify-seo.test.js
git commit -m "feat: optimize Gradify for GPA and CGPA search"
```

---

### Task 5: Full verification, deployment, and indexation handoff

**Files:**
- Modify: `tests/tools/site-responsive.test.js` only if the approved visible copy changes an explicit current contract
- Create: `docs/seo/search-console-2026-09-17.md`
- Generate: `out/**`

**Interfaces:**
- Consumes: all earlier tasks and the existing GitHub Pages main-branch publication workflow.
- Produces: source commit(s), deployed static output, a live verification record, and exact Search Console actions.

- [ ] **Step 1: Run fresh local verification**

```powershell
npm run validate:content
npm run check:images
npm run test:gradify
npm test
npm run build
```

Expected: content validation, image budgets, Gradify tests, the complete Node suite, TypeScript compilation, and static generation all pass. Do not reuse output from an earlier commit.

- [ ] **Step 2: Inspect rendered pages at representative widths**

Serve `out/` and inspect `/`, `/about/`, `/work/embedded-iot/wireless-rov-control/`, `/tools/`, `/tools/gradify/`, and `/tools/gradify/calculator/` at 390×844 and 1920×1080. Record console errors, image current source/type/bytes, LCP candidate, overflow, H1/title/canonical, and rendered JSON-LD. Fix any broken asset, cropped ROV, hidden controls, schema/content mismatch, or layout shift before continuing.

- [ ] **Step 3: Request and apply code review**

Review the complete branch diff for correctness, scope, image evidence integrity, generated-file determinism, metadata duplication, structured-data truthfulness, client bundle impact, unsafe HTML, and external-link handling. Resolve every critical or important finding, then rerun the affected tests and build.

- [ ] **Step 4: Document Search Console steps**

Create a short record with the verified property `https://eng-asl.com/`, sitemap URL `https://eng-asl.com/sitemap.xml`, and inspection queue:

```text
https://eng-asl.com/
https://eng-asl.com/about/
https://eng-asl.com/tools/
https://eng-asl.com/tools/gradify/
https://eng-asl.com/tools/gradify/calculator/
```

State that sitemap submission and one indexing request per priority URL are external actions; repeated requests do not accelerate indexing.

- [ ] **Step 5: Push source and publish static output**

Fetch `origin`, confirm the source branch is fast-forwardable, push the feature result to `source`, mirror the freshly generated `out/` into the clean Pages deployment worktree after validating both absolute paths, commit the static output, and push it to `main` without force.

- [ ] **Step 6: Verify live deployment**

Wait for the GitHub Pages workflow to complete successfully. Then verify:

```powershell
curl.exe -I http://eng-asl.com/
curl.exe -I https://eng-asl.com/
```

Expected: HTTP redirects to HTTPS and HTTPS returns 200. Run the homepage/ROV/Gradify browser contracts against `https://eng-asl.com`, confirm no `/myPortfolio` or `github.io` asset/canonical URLs, and check the new AVIF/WebP ROV paths return 200.

- [ ] **Step 7: Final repository checks**

Confirm source and deployment worktrees are clean, `origin/source` and `origin/main` point at the intended commits, and no generated screenshots, audit downloads, temporary PDFs, or visual-companion files were committed.
