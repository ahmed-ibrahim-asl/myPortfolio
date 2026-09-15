# Article and Tool Cover System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the field-note article route at every required viewport and give all 41 engineering tools a coherent, accurate cover through either a restrained workbench raster or a purpose-specific calculator vector.

**Architecture:** The article route will opt into the existing `asl-page` contract so shared gutter and palette selectors apply, with focused article overrides removing the legacy game theme. The tool catalog will keep raster assets only for five workbenches and use a complete data-driven vector registry for all 36 calculators. A versioned prompt manifest records every generated raster and preserves the remaining image-generation backlog.

**Tech Stack:** Next.js 16, React 19, TypeScript and JavaScript, CSS custom properties, inline SVG, Node test runner, Chrome DevTools Protocol responsive audit, GPT Image generation.

## Global Constraints

- Required responsive viewports: 390x844, 768x1024, 950x900, 982x986, 1366x768, 1920x1080, 2560x1440, and 3440x1440.
- Do not use the em dash character.
- Use the existing ASL near-black, warm-white, muted-gray, gold, and limited signal-blue tokens.
- Keep tool covers 16:9, simple at card size, free of watermarks, fake UI text, cyberpunk scenery, and excessive detail.
- Do not alter calculator mathematics or tool behavior.
- Do not commit or push repository changes unless the user explicitly requests it.

---

### Task 1: Expand the responsive matrix and reproduce the article regression

**Files:**
- Modify: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: rendered routes from `ROUTES` and viewport objects from `VIEWPORTS`.
- Produces: regression failures for article gutters, article palette, heading marker, typography, and overflow.

- [ ] **Step 1: Add the two requested intermediate viewports**

Add these entries between 768 and 1366:

```js
{ width: 950, height: 900, label: "950 (split view)" },
{ width: 982, height: 986, label: "982 (near square)" },
```

Update the test title so it lists all eight widths.

- [ ] **Step 2: Make article shells part of the shared gutter audit**

Extend the shell selector with `.asl-article > .shell` and collect article header, layout, and footer geometry. Query the article body from `.asl-article .article-body`, not the currently impossible `.asl-page.article-page .article-body` selector.

- [ ] **Step 3: Assert the complete article design contract**

At `/writing/welcome-to-field-notes/`, fail when any article shell differs from the adaptive gutter, when the body uses a legacy shadow or blue surface, when the body font is not the ASL font, or when `h2::before` remains visible.

- [ ] **Step 4: Run the focused responsive test and confirm RED**

Run:

```powershell
$env:SITE_RESPONSIVE_BASE_URL='http://127.0.0.1:3000'; node --test tests/tools/site-responsive.test.js
```

Expected: FAIL on the field-note route because article shells have zero gutter and legacy article styles remain active.

---

### Task 2: Apply the ASL article contract at the source

**Files:**
- Modify: `app/writing/[slug]/page.tsx`
- Modify: `app/asl-theme.css`
- Test: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: `--page-gutter`, `--asl-page`, `--asl-surface`, `--asl-sunken`, `--asl-line`, `--asl-text`, `--asl-text-secondary`, `--asl-gold`, `--asl-font`, and `--asl-mono`.
- Produces: an article page that participates in the same shell and palette contract as all other routes.

- [ ] **Step 1: Opt the route into the ASL page contract**

Change the article root to:

```tsx
<article className="asl-page article-page asl-article">
```

- [ ] **Step 2: Put gutters on the article shells, not the root twice**

Use one focused selector:

```css
.asl-article > .shell {
  padding-inline: var(--page-gutter);
}
```

Ensure `.asl-page.article-page` itself does not add a second inline gutter.

- [ ] **Step 3: Override every legacy article surface**

Set the article body to ASL surface, line border, no shadow, ASL font, and secondary text. Restore normal heading case, a 1px gold top rule, and hide the legacy `h2::before`. Apply ASL colors to links, blockquotes, inline code, preformatted blocks, tables, metadata, rails, and pagination.

- [ ] **Step 4: Stabilize the intermediate layouts**

At 950 and 982 pixels, keep the article heading within the viewport, stack facts cleanly, and prevent the rails from squeezing the reading column. At mobile width, use a single column and reduce display heading size without changing its hierarchy.

- [ ] **Step 5: Run the responsive test and confirm GREEN**

Run the Task 1 command. Expected: PASS with no overflow and valid article geometry at all eight viewports.

---

### Task 3: Define complete calculator-cover data before changing rendering

**Files:**
- Create: `data/calculator-visuals.js`
- Modify: `data/calculators.js`
- Modify: `tests/tools/asl-design-contract.test.js`

**Interfaces:**
- Produces: `calculatorVisuals`, a frozen object keyed by every calculator slug.
- Each entry exposes `{ kind, formula, accent, ariaLabel }`.
- `data/calculators.js` sets each tool's `visualKey` to its slug.

- [ ] **Step 1: Write the failing registry coverage test**

Load `calculators` and `calculatorVisuals`, then assert:

```js
assert.deepEqual(
  Object.keys(calculatorVisuals).sort(),
  calculators.map((tool) => tool.slug).sort()
);
assert.equal(new Set(calculators.map((tool) => tool.visualKey)).size, 36);
```

Also assert that every visual has a non-empty `kind` and `ariaLabel`.

- [ ] **Step 2: Run the contract test and confirm RED**

Run:

```powershell
node --test tests/tools/asl-design-contract.test.js
```

Expected: FAIL because the full registry does not exist and visual keys are grouped.

- [ ] **Step 3: Add all 36 accurate visual records**

Use the actual circuit or relation for each calculator. Kinds include resistor, divider, LED, battery, capacitor, waveform, filter, timer, number-system transform, unit conversion, motion, and root. Keep formulas concise and technically correct.

- [ ] **Step 4: Make calculator slugs the visual keys**

Replace category fallback grouping with direct slug lookup so no calculator silently receives another tool's cover.

- [ ] **Step 5: Run the contract test and confirm GREEN**

Run the Task 3 test command. Expected: PASS with 36 distinct visual keys and no missing registry entry.

---

### Task 4: Render the complete vector cover system

**Files:**
- Modify: `components/tools/CalculatorThumbnail.js`
- Modify: `app/asl-tools.css`
- Modify: `tests/tools/asl-design-contract.test.js`
- Test: `tests/tools/site-responsive.test.js`

**Interfaces:**
- Consumes: `calculatorVisuals[visualKey]`.
- Produces: one accessible 16:9 vector cover for every calculator card.

- [ ] **Step 1: Add a failing render-contract test**

Assert that `CalculatorThumbnail` imports the registry, rejects unknown visual keys in development, and uses the registry aria label instead of the generic `circuit diagram` label.

- [ ] **Step 2: Run the contract test and confirm RED**

Expected: FAIL against the current eleven-case switch.

- [ ] **Step 3: Replace the grouped switch with data-driven primitives**

Build small SVG primitives for each `kind`. Compose them from the registry record and use formula or relationship text only when it conveys actual engineering information. Keep the grid quiet and use gold, warm white, and signal blue by semantic role.

- [ ] **Step 4: Standardize both raster and vector frames at 16:9**

Set `.unified-tool-cover` and `.calculator-thumbnail` to `aspect-ratio: 16 / 9`, remove destructive grayscale filtering, and preserve existing card spacing.

- [ ] **Step 5: Run contract and responsive tests**

Expected: all 36 vector covers render, all 41 tool cards stay within the viewport, and cards remain one, two, four, five, or six columns according to width.

---

### Task 5: Generate and integrate the five workbench covers

**Files:**
- Create or replace: `public/media/tools/tool-ai-script-generator.webp`
- Create or replace: `public/media/tools/tool-security-mission.webp`
- Create or replace: `public/media/tools/tool-pid-simulator.webp`
- Create or replace: `public/media/tools/tool-sensor-code-generator.webp`
- Create or replace: `public/media/tools/tool-battery-estimator.webp`
- Modify: `data/tools.js`
- Create: `docs/assets/tool-cover-prompts.md`
- Modify: `tests/tools/asl-design-contract.test.js`

**Interfaces:**
- Consumes: the five workbench records in `data/tools.js`.
- Produces: five local 16:9 covers and a reproducible prompt manifest.

- [ ] **Step 1: Write a failing asset contract**

Assert that all five workbenches have unique cover paths, every file exists, and the prompt manifest names all five output paths.

- [ ] **Step 2: Run the contract test and confirm RED**

Expected: FAIL until the coherent five-cover set and manifest are present.

- [ ] **Step 3: Generate one restrained image per workbench**

Use the shared visual grammar from the design spec. Generate without words or interface labels. Keep each focal relationship simple:

- AI Script Generator: three source types converging into a clean runnable project artifact.
- Security Mission: an authorized lab command path with a clear safety boundary.
- PID Simulator: setpoint, measured response, and actuator loop represented physically and accurately.
- Sensor Code Generator: ESP32 with a small family of sensors connected through organized buses.
- Battery Estimator: ESP32 duty cycle, battery source, and current profile as one measured power story.

- [ ] **Step 4: Save the final prompts and outputs**

Record purpose, negative constraints, exact prompt, output path, and status for each image in `docs/assets/tool-cover-prompts.md`.

- [ ] **Step 5: Integrate paths and verify visual crop**

Update `data/tools.js` only if paths change. Confirm every image fills the 16:9 frame without losing its focal object at card size.

---

### Task 6: Preserve the remaining image backlog

**Files:**
- Create: `docs/assets/site-image-backlog.md`

**Interfaces:**
- Produces: a durable queue for project covers, note covers, prompt examples, and tool-page walkthrough assets.

- [ ] **Step 1: Record all requested visual shortcuts**

Include `/defectview`, `/layer`, `/machineview`, `/machineview360`, `/sequence`, `/beforeafter`, `/explodeview`, `/topview`, `/3dbillboard`, `/handwritten`, `/metaad`, `/magazinecover`, `/floating3d`, `/goldenhour`, `/wideshot`, `/adcreativecode`, and `/footwaretechpac`.

- [ ] **Step 2: Record future cover families**

Track project evidence, C and C++ notes, Python, Bash, Dart, Flutter, Linux, networking, electronics, CTF walkthroughs, prompt-guide examples, and tool-page diagrams. Give every item a purpose, destination route, recommended shortcut, and status.

---

### Task 7: Full verification and browser review

**Files:**
- Modify only if verification exposes a tested defect.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: fresh automated and visual evidence.

- [ ] **Step 1: Run focused tests**

```powershell
node --test tests/tools/asl-design-contract.test.js
$env:SITE_RESPONSIVE_BASE_URL='http://127.0.0.1:3000'; node --test tests/tools/site-responsive.test.js
```

- [ ] **Step 2: Run the complete suite**

```powershell
npm test
```

- [ ] **Step 3: Run a production build**

```powershell
npm run build
```

- [ ] **Step 4: Inspect the live article and catalog**

Use the local browser to inspect the article and `/tools/` at all eight required viewports. Confirm no horizontal overflow, consistent gutters, no legacy article decoration, readable metadata, coherent card crops, and all 41 covers.

- [ ] **Step 5: Leave the local server and useful review page available**

Keep the existing local server running and leave the corrected article or tool catalog open for user review. Do not commit or push.
