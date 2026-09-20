# Claude Tool Audit and Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify and harden the seven uncommitted classical-cryptography/hash/AES tools created with Claude, including their routes, canonical outputs, accessibility, design-system integration, covers, metadata, and responsive behavior.

**Architecture:** Keep pure cryptographic logic in `lib/tools/` and React behavior in the existing explorer components. Add one integration contract and one browser contract that exercise the seven tools as a coherent product set, then correct only defects those contracts or the existing suites reproduce.

**Tech Stack:** Next.js 16.3, React 19, TypeScript/TSX, JavaScript ESM, Node `node:test`, Puppeteer Core, existing CSS Modules and SVG covers.

## Global Constraints

- Audit these exact slugs: `vigenere-cipher`, `affine-cipher`, `transposition-cipher`, `playfair-cipher`, `hill-cipher`, `hash-generator`, `aes-hex-calculator`.
- Preserve the existing pure-logic/UI separation.
- Use the existing `DesignLab.module.css` and global design tokens; do not introduce a new visual system.
- Keep all computation local to the browser and add no runtime dependency.
- Preserve all unrelated dirty working-tree changes.
- Reuse the existing seven dark/light SVG cover pairs unless a test proves one is absent or invalid; do not generate redundant raster art.

---

## File map

- `lib/tools/{vigenere,shift-ciphers,transposition,playfair,hill,md5,aes}.js`: pure algorithms.
- `components/tools/design/{Vigenere,ShiftCipher,Transposition,Playfair,Hill,Hash,Aes}Explorer.tsx`: interactive interfaces.
- `components/tools/design/DesignToolPage.tsx`: slug-to-component routing.
- `data/design-tools.js`: public catalog records.
- `data/tool-search-seeds.ts`: search and SEO examples.
- `data/calculator-visuals.js`: cover contracts.
- `public/media/tools/design/*-v1-{dark,light}.svg`: static covers.
- `tests/tools/*-math.test.js`: canonical vectors and algorithm errors.
- `tests/tools/classical-tools-integration.test.js`: new cross-registry contract.
- `tests/tools/classical-tools-browser.test.js`: new route, interaction, accessibility, and responsive contract.
- `components/tools/design/DesignLab.module.css`: shared explorer styling, modified only for reproduced shared defects.

### Task 1: Cross-registry and asset contract

**Files:**
- Create: `tests/tools/classical-tools-integration.test.js`
- Modify only if a failing assertion identifies a defect: `components/tools/design/DesignToolPage.tsx`
- Modify only if a failing assertion identifies a defect: `data/design-tools.js`
- Modify only if a failing assertion identifies a defect: `data/tool-search-seeds.ts`
- Modify only if a failing assertion identifies a defect: `data/calculator-visuals.js`
- Modify only if a failing assertion identifies a defect: `public/media/tools/design/*-v1-{dark,light}.svg`

**Interfaces:**
- Consumes: seven canonical slug records.
- Produces: a test that proves each slug is registered exactly once, routed to its explorer, searchable, paired with two valid SVG covers, and has canonical example copy.

- [ ] **Step 1: Write the integration contract**

Create a test with:

```js
const slugs = [
  "vigenere-cipher", "affine-cipher", "transposition-cipher",
  "playfair-cipher", "hill-cipher", "hash-generator", "aes-hex-calculator"
];
```

For every slug, assert one `designTools` record with `custom: true`, one search seed, one visual contract with existing dark/light paths, readable SVG files containing a `viewBox`, `<title>` or accessible label, and a matching conditional branch in `DesignToolPage.tsx`.

- [ ] **Step 2: Run the contract**

Run: `node --test tests/tools/classical-tools-integration.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS or a precise failure naming the missing registry/asset field.

- [ ] **Step 3: Correct only reproduced registry or asset defects**

For a missing field, add the exact slug entry following the neighboring design-tool shape. For an inaccessible SVG, add `<title id="title">…</title>` and `role="img" aria-labelledby="title"` without changing its established artwork.

- [ ] **Step 4: Re-run and confirm GREEN**

Run: `node --test tests/tools/classical-tools-integration.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the integration contract**

```bash
git add tests/tools/classical-tools-integration.test.js components/tools/design/DesignToolPage.tsx data/design-tools.js data/tool-search-seeds.ts data/calculator-visuals.js public/media/tools/design
git commit -m "test: verify classical tool integration"
```

### Task 2: Canonical algorithm and invalid-input audit

**Files:**
- Modify: `tests/tools/vigenere-autokey-math.test.js`
- Modify: `tests/tools/shift-ciphers-math.test.js`
- Modify: `tests/tools/transposition-math.test.js`
- Modify: `tests/tools/playfair-math.test.js`
- Modify: `tests/tools/hill-math.test.js`
- Modify: `tests/tools/md5-math.test.js`
- Modify: `tests/tools/aes-math.test.js`
- Modify only for reproduced defects: matching files under `lib/tools/`

**Interfaces:**
- Consumes: current pure function exports.
- Produces: canonical vector, round-trip, Unicode/normalization, malformed-key, and boundary coverage for every algorithm.

- [ ] **Step 1: Add missing negative and round-trip tests**

Add these explicit cases where absent:

- Vigenère/Autokey: empty alphabetic key rejects; punctuation is preserved; decrypt(encrypt(text)) restores normalized letters.
- Affine: non-coprime multiplier rejects on encode and decode; negative additive shifts normalize modulo 26.
- Transposition: rail counts `1` and greater than text length reject; ragged columnar lengths round-trip for every length `1..32` with key `ZEBRAS`.
- Playfair: empty keyword behavior is explicit; repeated-letter and odd-length padding is stable; `J` normalization is documented by the result.
- Hill: singular 2×2 and 3×3 matrices reject; block padding and both published vectors round-trip to the padded normalized text.
- MD5: RFC 1321 empty, `abc`, alphabet, alphanumeric, and 80-character vectors all match.
- AES: FIPS-197 128/192/256 vectors, decrypt round trips, invalid hex, non-block-sized data, and invalid key lengths reject.

- [ ] **Step 2: Run the seven math files and confirm failures are reproducible**

Run:

```bash
node --test tests/tools/vigenere-autokey-math.test.js tests/tools/shift-ciphers-math.test.js tests/tools/transposition-math.test.js tests/tools/playfair-math.test.js tests/tools/hill-math.test.js tests/tools/md5-math.test.js tests/tools/aes-math.test.js
```

Expected: existing behavior passes; any newly exposed defect fails with the affected algorithm and input.

- [ ] **Step 3: Fix each failing pure function at its validation or normalization boundary**

Do not alter React code in this task. Keep thrown errors as `RangeError` for numerical/key-domain errors and `TypeError` for non-string/non-array structural inputs. Make one algorithm correction at a time and re-run its single test file before continuing.

- [ ] **Step 4: Run all seven files and confirm GREEN**

Run the command from Step 2.

Expected: PASS.

- [ ] **Step 5: Commit the algorithm hardening**

```bash
git add lib/tools/aes.js lib/tools/hill.js lib/tools/md5.js lib/tools/playfair.js lib/tools/shift-ciphers.js lib/tools/transposition.js lib/tools/vigenere.js tests/tools/aes-math.test.js tests/tools/hill-math.test.js tests/tools/md5-math.test.js tests/tools/playfair-math.test.js tests/tools/shift-ciphers-math.test.js tests/tools/transposition-math.test.js tests/tools/vigenere-autokey-math.test.js
git commit -m "test: harden classical cipher calculations"
```

### Task 3: Shared accessibility and interaction contract

**Files:**
- Create: `tests/tools/classical-tools-browser.test.js`
- Modify: `components/tools/design/VigenereExplorer.tsx`
- Modify: `components/tools/design/ShiftCipherExplorer.tsx`
- Modify: `components/tools/design/TranspositionExplorer.tsx`
- Modify: `components/tools/design/PlayfairExplorer.tsx`
- Modify: `components/tools/design/HillExplorer.tsx`
- Modify: `components/tools/design/HashExplorer.tsx`
- Modify: `components/tools/design/AesExplorer.tsx`
- Modify if shared layout requires it: `components/tools/design/DesignLab.module.css`

**Interfaces:**
- Consumes: the seven `/tools/<slug>/` routes.
- Produces: named mode groups, labeled fields, polite result/status regions, keyboard-visible focus, canonical live outputs, and overflow-free 320px–1440px layouts.

- [ ] **Step 1: Write the browser contract**

For each route, collect `pageerror` and severe console errors, assert HTTP 200, one `<h1>`, no horizontal document overflow at widths `320`, `390`, `768`, and `1440`, and at least one labeled editable control. Assert every group of `aria-pressed` buttons has an ancestor with `role="group"` and an `aria-label`.

Add canonical UI assertions:

- Vigenère default output contains `LXFOPVEFRNHR`.
- Affine example produces `IHHWVCSWFRCP` after selecting Affine.
- Transposition default output contains `WECRLTEERDSOEEFEAOCAIVDEN`.
- Playfair default output contains `BMODZBXDNABEKUDMUIXMMOUVIF`.
- Hill default output contains `LNSHDLEWMTRW`.
- Hash input `abc` produces MD5 `900150983cd24fb0d6963f7d28e17f72` and the full SHA-256 vector.
- AES default output contains `69c4e0d86a7b0430d8cdb78070b4c55a`.

- [ ] **Step 2: Run the browser contract and confirm RED where semantics are missing**

Start `npm run dev`, then run:

`node --test tests/tools/classical-tools-browser.test.js`

Expected: canonical calculations pass; group-label/live-region assertions identify any missing semantics.

- [ ] **Step 3: Apply consistent semantic wrappers**

Wrap each mode/direction toolbar as:

```tsx
<div className={styles.toolbar} role="group" aria-label="Cipher mode">
```

Use a specific label such as `Operation`, `Matrix size`, or `Transposition mode`. Mark changing result containers `aria-live="polite" aria-atomic="true"`; keep error messages `role="status"`. Do not add ARIA roles to native labeled inputs or buttons when their native semantics already suffice.

- [ ] **Step 4: Verify responsive styling and both themes**

Capture 390px and 1440px dark/light screenshots for all seven routes under `test-results/classical-tools/`. If a shared toolbar or matrix overflows, correct only the relevant shared class in `DesignLab.module.css`; do not add inline width overrides.

- [ ] **Step 5: Re-run and confirm GREEN**

Run: `node --test tests/tools/classical-tools-browser.test.js`

Expected: PASS with no page errors, missing labels, or overflow.

- [ ] **Step 6: Commit the UI hardening**

```bash
git add tests/tools/classical-tools-browser.test.js components/tools/design/VigenereExplorer.tsx components/tools/design/ShiftCipherExplorer.tsx components/tools/design/TranspositionExplorer.tsx components/tools/design/PlayfairExplorer.tsx components/tools/design/HillExplorer.tsx components/tools/design/HashExplorer.tsx components/tools/design/AesExplorer.tsx components/tools/design/DesignLab.module.css
git commit -m "fix: harden classical tool interfaces"
```

### Task 4: Complete regression and production verification

**Files:**
- Create: `docs/reports/2026-09-20-claude-tool-audit.md`

**Interfaces:**
- Consumes: completed satellite plan and Tasks 1–3 above.
- Produces: a durable findings report containing commands, pass counts, fixed issues, cover decision, and remaining risks.

- [ ] **Step 1: Run the full Node tool suite**

Run: `node --test --test-concurrency=1 tests/tools/*.test.js`

Expected: PASS.

- [ ] **Step 2: Run the configured SEO suite**

Run: `npx vitest run --config vitest.seo.config.ts`

Expected: PASS.

- [ ] **Step 3: Run content validation and production build**

Run:

```bash
npm run validate:content
npm run build
```

Expected: both exit 0 with no route-generation error.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check` and `git status --short`. Confirm no unrelated pre-existing dirty file was staged or overwritten and no generated `tsconfig.tsbuildinfo`, screenshot, or temporary file is included in a commit.

- [ ] **Step 5: Write the audit report**

Record the seven audited routes, each defect reproduced and fixed, exact verification commands and outcomes, and the decision that no new generated bitmap was needed because all seven tools already have valid theme-paired SVG covers. Include any remaining risk without claiming it is fixed.

- [ ] **Step 6: Commit the report**

```bash
git add docs/reports/2026-09-20-claude-tool-audit.md
git commit -m "docs: report tool audit verification"
```

